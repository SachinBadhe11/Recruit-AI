# n8n Workflow Documentation - Recruit-AI Agent

## Overview

This n8n workflow implements an AI-powered recruitment screening agent that analyzes candidate resumes against job descriptions and provides structured recommendations.

**✨ NEW: Multi-LLM Provider Support**  
The workflow now supports multiple LLM providers including **OpenAI**, **Perplexity AI**, **Google Gemini**, and custom APIs. See [MULTI_LLM_GUIDE.md](file:///d:/Masai_Capstone/Recruit-AI/backend/MULTI_LLM_GUIDE.md) for configuration details.

## Workflow Architecture

```
Webhook (POST /analyze)
    ↓
Validate Input (Check JD & Resume)
    ↓                    ↓
AI Agent (LLM)    Return Error
    ↓
Parse LLM Response
    ↓
Check Recommendation
    ↓                           ↓
Interview Path              Reject Path
    ↓                           ↓
Generate Interview Email    Generate Rejection Email
    ↓                           ↓
Simulate Calendar Event     Return Response
    ↓
Return Response
```

## Features

### ✅ Core Functionality

1. **Text/File Input Acceptance**
   - Accepts `jd` (Job Description) and `resume` as text inputs
   - Validates both fields are present before processing

2. **LLM Analysis**
   - Uses OpenAI GPT-4 Turbo for intelligent analysis
   - Analyzes resume against job description criteria
   - Evaluates: Experience, Technical Skills, Education, Soft Skills

3. **Structured Output**
   - **Score**: 0-100 integer (realistic assessment)
   - **Summary**: 3-4 sentence explanation of fit
   - **Recommendation**: "Interview" or "Reject"
   - **Details**: Array of criteria with match status and reasons
   - **Candidate Info**: Extracted name and email

4. **Simulated Integrations**
   - **Email Draft Generation**: Creates interview invitation or rejection emails
   - **Calendar Integration**: Generates calendar event metadata for interviews

## Workflow Nodes

### 1. Webhook
- **Type**: Webhook Trigger
- **Method**: POST
- **Path**: `/analyze`
- **Input Format**:
  ```json
  {
    "jd": "Job description text...",
    "resume": "Resume text..."
  }
  ```

### 2. Validate Input
- **Type**: IF Node
- **Purpose**: Ensures both `jd` and `resume` are provided
- **Success**: Proceeds to LLM analysis
- **Failure**: Returns error response

### 3. AI Agent (LLM)
- **Type**: OpenAI Node
- **Model**: GPT-4 Turbo
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Output**: Structured JSON with score, summary, recommendation, details

### 4. Parse LLM Response
- **Type**: Code Node
- **Purpose**: Ensures LLM response is valid JSON
- **Handles**: String responses and extracts JSON objects

### 5. Check Recommendation
- **Type**: IF Node
- **Purpose**: Routes to Interview or Reject path based on recommendation

### 6. Generate Interview Email Draft
- **Type**: Code Node
- **Purpose**: Creates interview invitation email draft
- **Output**: Email object with to, subject, body, type, timestamp

### 7. Generate Rejection Email Draft
- **Type**: Code Node
- **Purpose**: Creates rejection email draft
- **Output**: Email object with professional rejection message

### 8. Simulate Calendar Integration
- **Type**: Code Node
- **Purpose**: Creates calendar event metadata for interviews
- **Output**: Calendar event with suggested date/time (3 days from now)

### 9. Return Response
- **Type**: Respond to Webhook
- **Purpose**: Returns final structured response to frontend

## Setup Instructions

### Step 1: Install n8n

```bash
npm install -g n8n
```

### Step 2: Start n8n

```bash
n8n start
```

n8n will be available at: **http://localhost:5678**

### Step 3: Import Workflow

1. Open n8n in your browser
2. Click **Workflows** → **Import from File**
3. Select `recruit-ai-workflow.json`
4. Click **Import**

### Step 4: Configure OpenAI Credentials

1. Double-click the **"AI Agent (LLM)"** node
2. Click **Credentials** → **Create New**
3. Enter your OpenAI API key
4. Save the credential

### Step 5: Activate Workflow

1. Click the **Active** toggle in the top-right
2. Copy the **Webhook URL** (e.g., `http://localhost:5678/webhook/analyze`)

### Step 6: Connect Frontend

1. Open `frontend/src/services/api.js`
2. Update the configuration:
   ```javascript
   const USE_MOCK = false;
   const N8N_WEBHOOK_URL = "YOUR_WEBHOOK_URL_HERE";
   ```

## Testing the Workflow

### Test Payload

```json
{
  "jd": "We are looking for a Senior React Developer with 5+ years of experience in building scalable web applications. Must have expertise in React, TypeScript, and Node.js. Experience with AWS is a plus.",
  "resume": "John Doe\nEmail: john.doe@example.com\n\nSenior Frontend Developer with 6 years of experience specializing in React and TypeScript. Built multiple enterprise-scale applications using React, Redux, and Node.js. Proficient in AWS services including S3, Lambda, and CloudFront."
}
```

### Expected Response

```json
{
  "score": 85,
  "summary": "Strong candidate with 6 years of relevant experience in React and TypeScript. Demonstrates expertise in required technologies and has AWS experience. Good fit for the Senior React Developer role.",
  "recommendation": "Interview",
  "details": [
    {
      "criteria": "Experience",
      "status": "match",
      "reason": "6 years of frontend development, exceeds 5-year requirement"
    },
    {
      "criteria": "Technical Skills",
      "status": "match",
      "reason": "Proficient in React, TypeScript, Node.js, and AWS"
    },
    {
      "criteria": "Education",
      "status": "partial",
      "reason": "Not mentioned in resume"
    },
    {
      "criteria": "Soft Skills",
      "status": "partial",
      "reason": "Limited information on communication and leadership"
    }
  ],
  "candidateName": "John Doe",
  "candidateEmail": "john.doe@example.com",
  "emailDraft": {
    "to": "john.doe@example.com",
    "subject": "Interview Invitation - John Doe",
    "body": "Dear John Doe,\n\nThank you for applying...",
    "type": "interview_invitation",
    "generated": "2025-12-08T11:43:00.000Z"
  },
  "calendarEvent": {
    "title": "Interview: John Doe",
    "description": "Technical interview with John Doe\nCandidate Score: 85/100",
    "startTime": "2025-12-11T10:00:00.000Z",
    "duration": 60,
    "attendees": ["john.doe@example.com"],
    "location": "Video Call (Link to be shared)",
    "status": "tentative"
  },
  "calendarEventCreated": true,
  "emailDraftGenerated": true
}
```

## Scoring Guidelines

- **90-100**: Exceptional fit, exceeds requirements
- **75-89**: Strong fit, meets most requirements
- **60-74**: Moderate fit, has potential but gaps exist
- **40-59**: Weak fit, significant gaps
- **0-39**: Poor fit, does not meet requirements

## Recommendation Logic

- **Interview**: Score ≥ 65 OR strong potential despite lower score
- **Reject**: Score < 65 AND no exceptional qualities

## Upgrading Simulations to Real Integrations

### Email Integration (Optional)

To send actual emails instead of drafts:

1. Replace the "Generate Interview Email Draft" and "Generate Rejection Email Draft" code nodes with **Email Send** nodes
2. Configure SMTP credentials (Gmail, SendGrid, etc.)
3. Update the email content as needed

### Calendar Integration (Optional)

To create actual calendar events:

1. Replace the "Simulate Calendar Integration" code node with **Google Calendar** node
2. Authenticate with Google OAuth
3. Configure event details and attendee notifications

## Troubleshooting

### Issue: "Missing required fields" error
**Solution**: Ensure both `jd` and `resume` are included in the POST request body

### Issue: LLM returns invalid JSON
**Solution**: The "Parse LLM Response" node handles this automatically by extracting JSON from text

### Issue: Webhook URL not working
**Solution**: Ensure n8n is running and the workflow is activated

### Issue: OpenAI API errors
**Solution**: Verify your API key is valid and has sufficient credits

## Next Steps

- ✅ Import and test the workflow
- ✅ Configure OpenAI credentials
- ✅ Test with sample data
- ⬜ (Optional) Upgrade to real email sending
- ⬜ (Optional) Integrate with Google Calendar
- ⬜ (Optional) Add database storage for candidate records
- ⬜ (Optional) Add Slack/Teams notifications

## Support

For issues or questions:
1. Check n8n logs in the terminal
2. Review the workflow execution history in n8n UI
3. Verify all credentials are properly configured
4. Test with the provided sample payload

---

**Version**: 2.0  
**Last Updated**: December 2025  
**Compatible with**: n8n v1.0+, OpenAI GPT-4
