# n8n Workflow Updates for Multi-LLM Support

## Overview

The n8n workflow needs to be updated to dynamically fetch LLM provider configurations from Supabase instead of using hardcoded API keys.

## Required Changes

### 1. Add Supabase HTTP Request Node (Before "Configure LLM Provider")

**Node Name:** `Fetch User Settings from Supabase`  
**Type:** HTTP Request  
**Position:** Between "Validate Input" and "Configure LLM Provider"

**Configuration:**
```json
{
  "method": "POST",
  "url": "https://YOUR_SUPABASE_URL/rest/v1/rpc/get_user_settings",
  "authentication": "headerAuth",
  "headerParameters": {
    "parameters": [
      {
        "name": "apikey",
        "value": "={{$env.SUPABASE_SERVICE_KEY}}"
      },
      {
        "name": "Authorization",
        "value": "Bearer ={{$env.SUPABASE_SERVICE_KEY}}"
      },
      {
        "name": "Content-Type",
        "value": "application/json"
      }
    ]
  },
  "sendBody": true,
  "jsonBody": "={{ { \"user_id_param\": $json.body.userId } }}",
  "options": {}
}
```

**Alternative:** Use Supabase node if available in your n8n instance.

### 2. Create Supabase Function (Optional but Recommended)

Create a PostgreSQL function in Supabase to fetch user settings:

```sql
CREATE OR REPLACE FUNCTION get_user_settings(user_id_param UUID)
RETURNS TABLE (
  active_provider TEXT,
  provider_config JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.active_provider, s.provider_config
  FROM settings s
  WHERE s.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Update "Configure LLM Provider" Code Node

Replace the entire `jsCode` content with:

```javascript
// Get input data
const body = $input.first().json.body;
const jd = body.jd;
const resume = body.resume;
const provider = body.provider || 'openai';
const userId = body.userId;

// Fetch user settings from previous node (if using Supabase HTTP Request)
// If you added a "Fetch User Settings" node, uncomment this:
// const userSettings = $('Fetch User Settings from Supabase').first().json;
// const providerConfig = userSettings.provider_config?.providers?.[provider];

// For now, we'll use a fallback approach with environment variables
// This allows the workflow to work even if Supabase fetch fails

// Provider URL configurations (these don't change)
const PROVIDER_URLS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  perplexity: 'https://api.perplexity.ai/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  custom: body.customUrl || 'https://api.openai.com/v1/chat/completions'
};

// Try to get API key from user settings (from Supabase)
// If not available, fall back to environment variables
let apiKey;
let model;

// Uncomment if using Supabase fetch:
// if (providerConfig && providerConfig.apiKey) {
//   apiKey = providerConfig.apiKey;
//   model = providerConfig.model;
// } else {
  // Fallback to environment variables
  switch(provider) {
    case 'openai':
      apiKey = $env.OPENAI_API_KEY;
      model = 'gpt-4-turbo';
      break;
    case 'perplexity':
      apiKey = $env.PERPLEXITY_API_KEY;
      model = 'llama-3.1-sonar-large-128k-online';
      break;
    case 'gemini':
      apiKey = $env.GEMINI_API_KEY;
      model = 'gemini-pro';
      break;
    case 'custom':
      apiKey = $env.CUSTOM_API_KEY;
      model = body.customModel || 'gpt-3.5-turbo';
      break;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
// }

if (!apiKey) {
  throw new Error(`API key not configured for provider: ${provider}`);
}

// Build config object
const config = {
  url: PROVIDER_URLS[provider],
  model: model,
  apiKeyHeader: provider === 'gemini' ? 'x-goog-api-key' : 'Authorization',
  apiKeyPrefix: provider === 'gemini' ? '' : 'Bearer ',
  apiKey: apiKey
};

// System prompt for analysis
const systemPrompt = `You are an expert Technical Recruiter with 10+ years of experience.

Analyze the following Resume against the Job Description. Be thorough, fair, and realistic in your assessment.

Provide a comprehensive analysis and output ONLY a valid JSON object with this exact structure:
{
  "score": (integer between 0-100, be realistic and fair),
  "summary": "3-4 sentences explaining the overall fit, highlighting key strengths and any significant gaps",
  "recommendation": "Interview" or "Reject",
  "details": [
    { "criteria": "Experience", "status": "match" or "partial" or "miss", "reason": "specific explanation with years/details" },
    { "criteria": "Technical Skills", "status": "match" or "partial" or "miss", "reason": "specific technologies and proficiency" },
    { "criteria": "Education", "status": "match" or "partial" or "miss", "reason": "degree and institution details" },
    { "criteria": "Soft Skills", "status": "match" or "partial" or "miss", "reason": "communication, leadership, teamwork assessment" }
  ],
  "candidateName": "extracted full name from resume",
  "candidateEmail": "extracted email from resume or 'Not provided'"
}

Scoring Guidelines:
- 90-100: Exceptional fit, exceeds requirements
- 75-89: Strong fit, meets most requirements
- 60-74: Moderate fit, has potential but gaps exist
- 40-59: Weak fit, significant gaps
- 0-39: Poor fit, does not meet requirements

Recommendation Guidelines:
- "Interview": Score >= 65 OR strong potential despite lower score
- "Reject": Score < 65 AND no exceptional qualities`;

const userPrompt = `JOB DESCRIPTION:\n${jd}\n\nRESUME:\n${resume}`;

// Prepare request body based on provider
let requestBody;
if (provider === 'gemini') {
  // Gemini uses different format
  requestBody = {
    contents: [{
      parts: [{
        text: systemPrompt + '\n\n' + userPrompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  };
} else {
  // OpenAI/Perplexity/Custom format
  requestBody = {
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 2048
  };
}

// Return configuration for HTTP Request node
return [{
  json: {
    llmConfig: config,
    requestBody: requestBody,
    jd: jd,
    resume: resume,
    provider: provider,
    userId: userId
  }
}];
```

### 4. Environment Variables to Set in n8n

Add these environment variables to your n8n instance:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# LLM Provider API Keys (fallback if not in Supabase)
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
GEMINI_API_KEY=AIza...
CUSTOM_API_KEY=your-custom-key
```

**How to set in n8n:**
1. Go to Settings → Environment Variables
2. Add each variable
3. Restart n8n

### 5. Update Webhook Validation (Optional but Recommended)

Add auth token validation to the "Validate Input" node:

```javascript
const body = $input.first().json.body;
const authToken = $input.first().json.headers?.authorization?.replace('Bearer ', '');

// Validate required fields
if (!body.jd || !body.resume) {
  throw new Error('Missing required fields: jd and resume');
}

if (!body.userId) {
  throw new Error('Missing userId - user not authenticated');
}

// Optional: Validate auth token with Supabase
// This requires an HTTP request to Supabase auth endpoint
// For now, we'll just check if token exists
if (!authToken) {
  console.warn('No auth token provided - request may be unauthorized');
}

return [{
  json: {
    body: body,
    authToken: authToken,
    validated: true
  }
}];
```

## Implementation Steps

### Quick Setup (Environment Variables Only)

1. **Set environment variables in n8n** with your API keys
2. **Update "Configure LLM Provider" node** with the new code above
3. **Test the workflow** - it will use env vars as fallback

### Full Setup (Supabase Integration)

1. **Create Supabase function** (SQL above)
2. **Add "Fetch User Settings" HTTP Request node** before "Configure LLM Provider"
3. **Update "Configure LLM Provider" node** and uncomment Supabase fetch lines
4. **Set environment variables** as fallback
5. **Test the workflow** with different providers

## Testing

### Test with cURL:

```bash
curl -X POST http://localhost:5678/webhook/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT" \
  -d '{
    "jd": "Looking for a Senior React Developer...",
    "resume": "John Doe - 5 years React experience...",
    "provider": "openai",
    "userId": "user-uuid-here"
  }'
```

### Expected Response:

```json
{
  "score": 85,
  "summary": "Strong candidate with relevant experience...",
  "recommendation": "Interview",
  "details": [...],
  "candidateName": "John Doe",
  "candidateEmail": "john@example.com"
}
```

## Troubleshooting

### Error: "API key not configured"
- Check environment variables are set in n8n
- Verify provider name matches exactly ('openai', 'perplexity', 'gemini', 'custom')
- Check Supabase settings table has API keys for the user

### Error: "Unknown provider"
- Ensure provider field in request is one of: openai, perplexity, gemini, custom
- Check frontend is sending correct provider value

### Error: "Missing userId"
- Verify frontend is authenticated
- Check api.js is sending userId from Supabase auth

## Security Notes

- ✅ **Never** expose service_role key to frontend
- ✅ Use environment variables for API keys in n8n
- ✅ Validate auth tokens before processing
- ✅ Use RLS policies in Supabase to protect user data
- ✅ Consider encrypting API keys in Supabase settings table

## Next Steps

After implementing these changes:
1. Test with each provider (OpenAI, Perplexity, Gemini)
2. Verify settings are saved/loaded correctly
3. Test provider switching in frontend
4. Monitor n8n logs for errors
5. Move to Phase 3: Screening Persistence
