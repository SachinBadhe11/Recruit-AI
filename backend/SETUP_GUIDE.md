# Quick Setup Guide - Recruit-AI Backend

## Prerequisites
- Node.js installed (v14 or higher)
- OpenAI API key

## Installation Steps

### 1. Install n8n
```bash
npm install -g n8n
```

### 2. Start n8n
```bash
n8n start
```
Access n8n at: **http://localhost:5678**

### 3. Import Workflow
1. In n8n, click **Workflows** → **Import from File**
2. Select `recruit-ai-workflow.json`
3. Click **Import**

### 4. Configure OpenAI
1. Double-click **"AI Agent (LLM)"** node
2. Click **Credentials** → **Create New**
3. Enter your OpenAI API key
4. Save

### 5. Activate Workflow
1. Toggle **Active** switch (top-right)
2. Copy the webhook URL

### 6. Connect Frontend
Edit `frontend/src/services/api.js`:
```javascript
const USE_MOCK = false;
const N8N_WEBHOOK_URL = "YOUR_WEBHOOK_URL_HERE";
```

## Test It!

Send a POST request to your webhook URL:
```json
{
  "jd": "Looking for Senior React Developer with 5+ years experience",
  "resume": "John Doe, john@example.com. 6 years React development..."
}
```

You should receive a structured response with score, summary, recommendation, email draft, and calendar event!

## What the Workflow Does

✅ **Accepts** text/file inputs (JD and Resume)  
✅ **Analyzes** resume against JD using GPT-4  
✅ **Outputs** structured score (0-100)  
✅ **Generates** summary and recommendation (Interview/Reject)  
✅ **Simulates** email draft generation  
✅ **Simulates** calendar integration  

## Need Help?

See `WORKFLOW_DOCUMENTATION.md` for detailed information.
