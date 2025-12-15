# Multi-LLM Provider Configuration Guide

## Overview

The Recruit-AI workflow now supports **multiple LLM providers** including:
- ✅ **OpenAI** (GPT-4, GPT-3.5, etc.)
- ✅ **Perplexity AI** (Sonar models)
- ✅ **Google Gemini** (Gemini Pro, etc.)
- ✅ **Custom LLM APIs** (any OpenAI-compatible API)

## Quick Start

### Step 1: Choose Your Provider

Open the **"Configure LLM Provider"** node in n8n and edit the `LLM_CONFIG` object:

```javascript
const LLM_CONFIG = {
  // Change this to: 'openai', 'perplexity', 'gemini', or 'custom'
  provider: 'openai',
  
  // ... provider configurations below
};
```

### Step 2: Add Your API Key

Find your chosen provider in the `providers` object and replace the API key:

```javascript
openai: {
  url: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4-turbo',
  apiKeyHeader: 'Authorization',
  apiKeyPrefix: 'Bearer ',
  apiKey: 'sk-your-actual-openai-key-here', // ← Replace this
},
```

### Step 3: Save and Activate

Save the workflow and activate it. The workflow will now use your selected provider!

---

## Provider Configurations

### OpenAI

```javascript
provider: 'openai',

openai: {
  url: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4-turbo', // or 'gpt-4', 'gpt-3.5-turbo'
  apiKeyHeader: 'Authorization',
  apiKeyPrefix: 'Bearer ',
  apiKey: 'YOUR_OPENAI_API_KEY',
}
```

**Supported Models:**
- `gpt-4-turbo` (recommended)
- `gpt-4`
- `gpt-3.5-turbo`
- `gpt-4o`

**Get API Key:** https://platform.openai.com/api-keys

---

### Perplexity AI

```javascript
provider: 'perplexity',

perplexity: {
  url: 'https://api.perplexity.ai/chat/completions',
  model: 'llama-3.1-sonar-large-128k-online',
  apiKeyHeader: 'Authorization',
  apiKeyPrefix: 'Bearer ',
  apiKey: 'YOUR_PERPLEXITY_API_KEY',
}
```

**Supported Models:**
- `llama-3.1-sonar-large-128k-online` (recommended)
- `llama-3.1-sonar-small-128k-online`
- `llama-3.1-sonar-large-128k-chat`
- `llama-3.1-sonar-small-128k-chat`

**Get API Key:** https://www.perplexity.ai/settings/api

---

### Google Gemini

```javascript
provider: 'gemini',

gemini: {
  url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  model: 'gemini-pro',
  apiKeyHeader: 'x-goog-api-key',
  apiKeyPrefix: '',
  apiKey: 'YOUR_GEMINI_API_KEY',
}
```

**Supported Models:**
- `gemini-pro` (recommended)
- `gemini-1.5-pro`
- `gemini-1.5-flash`

**Get API Key:** https://makersuite.google.com/app/apikey

**Note:** For Gemini 1.5 models, update the URL:
```javascript
url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'
```

---

### Custom LLM Provider

For any OpenAI-compatible API (Anthropic Claude via proxy, local LLMs, etc.):

```javascript
provider: 'custom',

custom: {
  url: 'https://your-llm-endpoint.com/v1/chat/completions',
  model: 'your-model-name',
  apiKeyHeader: 'Authorization',
  apiKeyPrefix: 'Bearer ',
  apiKey: 'YOUR_CUSTOM_API_KEY',
}
```

**Examples:**
- **Anthropic Claude** (via OpenRouter): `https://openrouter.ai/api/v1/chat/completions`
- **Local LLM** (Ollama): `http://localhost:11434/v1/chat/completions`
- **Azure OpenAI**: `https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT/chat/completions?api-version=2024-02-15-preview`

---

## Advanced Configuration

### Changing Models

You can change the model for any provider by editing the `model` field:

```javascript
openai: {
  model: 'gpt-3.5-turbo', // Changed from gpt-4-turbo
  // ... rest of config
}
```

### Adjusting Temperature

The workflow uses `temperature: 0.7` by default. To change it, edit the `Configure LLM Provider` node:

```javascript
// In the requestBody section
temperature: 0.7, // Lower = more consistent, Higher = more creative
```

### Custom Headers

Some providers require additional headers. Add them in the `Call LLM API` node:

```javascript
headerParameters: {
  parameters: [
    {
      name: "={{$json.llmConfig.apiKeyHeader}}",
      value: "={{$json.llmConfig.apiKeyPrefix + $json.llmConfig.apiKey}}"
    },
    {
      name: "Content-Type",
      value: "application/json"
    },
    // Add custom headers here
    {
      name: "X-Custom-Header",
      value: "custom-value"
    }
  ]
}
```

---

## How It Works

### Workflow Architecture

```
Webhook → Validate Input → Configure LLM Provider → Call LLM API → Parse Response
                ↓                                                          ↓
           Return Error                                          Check Recommendation
                                                                      ↓         ↓
                                                              Interview    Reject
```

### Key Nodes

1. **Configure LLM Provider**: Reads your provider choice and prepares the API request
2. **Call LLM API**: Makes HTTP request to the selected LLM provider
3. **Parse LLM Response**: Intelligently parses responses from different providers

### Response Parsing

The workflow automatically detects and parses responses from:
- **OpenAI/Perplexity format**: `response.choices[0].message.content`
- **Gemini format**: `response.candidates[0].content.parts[0].text`
- **Custom formats**: Falls back to common patterns

---

## Troubleshooting

### Issue: "Unable to parse LLM response format"

**Solution:** The provider's response format may be different. Check the response in n8n's execution log and update the parsing logic in the "Parse LLM Response" node.

### Issue: API authentication errors

**Solution:** 
- Verify your API key is correct
- Check the `apiKeyHeader` and `apiKeyPrefix` match your provider's requirements
- Ensure your API key has sufficient credits/quota

### Issue: Model not found

**Solution:**
- Verify the model name is correct for your provider
- Check if you have access to that specific model
- Try a different model (e.g., `gpt-3.5-turbo` instead of `gpt-4`)

### Issue: Response doesn't include required fields

**Solution:** The LLM may not be following the JSON format. The workflow will attempt to extract JSON from markdown code blocks automatically.

---

## Testing Different Providers

### Test Payload

```json
{
  "jd": "Looking for Senior React Developer with 5+ years experience in React, TypeScript, and Node.js",
  "resume": "John Doe, john@example.com. 6 years React development experience with TypeScript and Node.js"
}
```

### Expected Response (All Providers)

```json
{
  "score": 85,
  "summary": "Strong candidate with 6 years of relevant experience...",
  "recommendation": "Interview",
  "details": [...],
  "candidateName": "John Doe",
  "candidateEmail": "john@example.com",
  "emailDraft": {...},
  "calendarEvent": {...}
}
```

---

## Cost Comparison

| Provider | Model | Cost per 1M tokens (input) | Cost per 1M tokens (output) |
|----------|-------|---------------------------|----------------------------|
| OpenAI | GPT-4 Turbo | $10 | $30 |
| OpenAI | GPT-3.5 Turbo | $0.50 | $1.50 |
| Perplexity | Sonar Large | $1 | $1 |
| Google | Gemini Pro | Free (up to limit) | Free (up to limit) |

**Recommendation:** Start with **Gemini Pro** (free) for testing, then switch to **GPT-4 Turbo** or **Perplexity** for production.

---

## Switching Providers

To switch providers, simply:

1. Open the **"Configure LLM Provider"** node
2. Change `provider: 'openai'` to your desired provider
3. Ensure the API key is set for that provider
4. Save and test

**No other changes needed!** The workflow handles everything automatically.

---

## Security Best Practices

### ⚠️ Never Commit API Keys

Don't commit the workflow JSON with real API keys to version control.

### ✅ Use Environment Variables (Advanced)

For production, consider using n8n environment variables:

```javascript
apiKey: $env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY'
```

Then set the environment variable when running n8n:

```bash
export OPENAI_API_KEY="sk-your-key-here"
n8n start
```

---

## Support

For provider-specific issues:
- **OpenAI**: https://platform.openai.com/docs
- **Perplexity**: https://docs.perplexity.ai
- **Gemini**: https://ai.google.dev/docs

For workflow issues, check the n8n execution logs and verify your configuration matches this guide.

---

**Version:** 3.0 (Multi-LLM Support)  
**Last Updated:** December 2025  
**Compatible with:** OpenAI, Perplexity AI, Google Gemini, and custom providers
