# Adding Real Email Sending to n8n Workflow

## 🎯 Current Status

The existing workflow (`recruit-ai-workflow.json`) only **generates email drafts** but does **NOT send actual emails**. The nodes "Generate Interview Email Draft" and "Generate Rejection Email Draft" just create email objects but don't send them.

## ✅ Solution: Add Email Sending Nodes

We'll add actual email sending using n8n's **Gmail** or **SMTP** nodes.

---

## Option 1: Using Gmail (Recommended for Quick Setup)

### Step 1: Set Up Gmail OAuth in n8n

1. **Create Google Cloud Project** (if not already done):
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable **Gmail API**

2. **Create OAuth Credentials**:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Add authorized redirect URI:
     ```
     http://localhost:5678/rest/oauth2-credential/callback
     ```
   - Copy **Client ID** and **Client Secret**

3. **Configure in n8n**:
   - Go to n8n → **Credentials**
   - Click **New Credential**
   - Select **Gmail OAuth2 API**
   - Paste Client ID and Client Secret
   - Click **Connect my account**
   - Authorize with your Gmail account

### Step 2: Add Gmail Send Nodes to Workflow

Add these two nodes after the email draft generation nodes:

#### Node 1: Send Interview Email (Gmail)

**Position**: After "Generate Interview Email Draft"

```json
{
  "parameters": {
    "sendTo": "={{ $json.candidateEmail }}",
    "subject": "={{ $json.emailDraft.subject }}",
    "message": "={{ $json.emailDraft.body }}",
    "options": {
      "ccList": "",
      "bccList": ""
    }
  },
  "name": "Send Interview Email (Gmail)",
  "type": "n8n-nodes-base.gmail",
  "typeVersion": 2,
  "position": [1650, 200],
  "credentials": {
    "gmailOAuth2": {
      "id": "YOUR_GMAIL_CREDENTIAL_ID",
      "name": "Gmail account"
    }
  }
}
```

#### Node 2: Send Rejection Email (Gmail)

**Position**: After "Generate Rejection Email Draft"

```json
{
  "parameters": {
    "sendTo": "={{ $json.candidateEmail }}",
    "subject": "={{ $json.emailDraft.subject }}",
    "message": "={{ $json.emailDraft.body }}",
    "options": {
      "ccList": "",
      "bccList": ""
    }
  },
  "name": "Send Rejection Email (Gmail)",
  "type": "n8n-nodes-base.gmail",
  "typeVersion": 2,
  "position": [1650, 400],
  "credentials": {
    "gmailOAuth2": {
      "id": "YOUR_GMAIL_CREDENTIAL_ID",
      "name": "Gmail account"
    }
  }
}
```

### Step 3: Update Connections

Update the workflow connections to route through the new Gmail nodes:

```json
"Generate Interview Email Draft": {
  "main": [
    [
      {
        "node": "Send Interview Email (Gmail)",
        "type": "main",
        "index": 0
      }
    ]
  ]
},
"Generate Rejection Email Draft": {
  "main": [
    [
      {
        "node": "Send Rejection Email (Gmail)",
        "type": "main",
        "index": 0
      }
    ]
  ]
},
"Send Interview Email (Gmail)": {
  "main": [
    [
      {
        "node": "Simulate Calendar Integration",
        "type": "main",
        "index": 0
      }
    ]
  ]
},
"Send Rejection Email (Gmail)": {
  "main": [
    [
      {
        "node": "Return Response",
        "type": "main",
        "index": 0
      }
    ]
  ]
}
```

---

## Option 2: Using SMTP (More Flexible)

### Step 1: Get SMTP Credentials

**For Gmail:**
1. Enable 2-Factor Authentication on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Copy the 16-character password

**For Other Providers:**
- **Outlook**: smtp-mail.outlook.com, port 587
- **Yahoo**: smtp.mail.yahoo.com, port 587
- **Custom SMTP**: Get from your email provider

### Step 2: Configure SMTP Credentials in n8n

1. Go to n8n → **Credentials**
2. Click **New Credential**
3. Select **SMTP**
4. Fill in:
   - **User**: your-email@gmail.com
   - **Password**: (app password from Step 1)
   - **Host**: smtp.gmail.com
   - **Port**: 587
   - **SSL/TLS**: Enable
5. Click **Save**

### Step 3: Add SMTP Send Nodes

#### Node 1: Send Interview Email (SMTP)

```json
{
  "parameters": {
    "fromEmail": "recruiter@yourcompany.com",
    "toEmail": "={{ $json.candidateEmail }}",
    "subject": "={{ $json.emailDraft.subject }}",
    "text": "={{ $json.emailDraft.body }}",
    "options": {}
  },
  "name": "Send Interview Email (SMTP)",
  "type": "n8n-nodes-base.emailSend",
  "typeVersion": 2,
  "position": [1650, 200],
  "credentials": {
    "smtp": {
      "id": "YOUR_SMTP_CREDENTIAL_ID",
      "name": "SMTP account"
    }
  }
}
```

#### Node 2: Send Rejection Email (SMTP)

```json
{
  "parameters": {
    "fromEmail": "recruiter@yourcompany.com",
    "toEmail": "={{ $json.candidateEmail }}",
    "subject": "={{ $json.emailDraft.subject }}",
    "text": "={{ $json.emailDraft.body }}",
    "options": {}
  },
  "name": "Send Rejection Email (SMTP)",
  "type": "n8n-nodes-base.emailSend",
  "typeVersion": 2,
  "position": [1650, 400],
  "credentials": {
    "smtp": {
      "id": "YOUR_SMTP_CREDENTIAL_ID",
      "name": "SMTP account"
    }
  }
}
```

---

## 📧 Enhanced Email Templates

### Update Email Draft Generation with Better Templates

#### Interview Email Template

```javascript
const emailDraft = {
  to: candidateEmail,
  subject: `🎉 Interview Invitation - ${candidateName}`,
  body: `Dear ${candidateName},

Thank you for applying to our position. We were impressed by your profile and qualifications.

📊 Your Application Score: ${score}/100

We would like to invite you for an interview to discuss this opportunity further.

Our team will reach out shortly to schedule a convenient time for both parties. The interview will typically last 45-60 minutes and will be conducted via video call.

Please let us know your availability for the next week, and we'll do our best to accommodate your schedule.

We look forward to speaking with you!

Best regards,
Recruit-AI Team

---
This is an automated message from Recruit-AI. Please do not reply to this email.`,
  type: 'interview_invitation',
  generated: new Date().toISOString()
};
```

#### Rejection Email Template

```javascript
const emailDraft = {
  to: candidateEmail,
  subject: `Application Update - ${candidateName}`,
  body: `Dear ${candidateName},

Thank you for your interest in our position and for taking the time to apply.

After careful review of your application, we have decided to move forward with other candidates whose experience more closely matches our current requirements.

We truly appreciate the time and effort you invested in the application process. Your skills and experience are valuable, and we encourage you to apply for future positions that may be a better fit.

We wish you the best of luck in your job search and future career endeavors.

Best regards,
Recruit-AI Team

---
This is an automated message from Recruit-AI. Please do not reply to this email.`,
  type: 'rejection',
  generated: new Date().toISOString()
};
```

---

## 🔄 Complete Updated Workflow Flow

```
Webhook (Receive JD + Resume)
    ↓
Validate Input
    ↓
Configure LLM Provider
    ↓
Call LLM API
    ↓
Parse LLM Response
    ↓
Check Recommendation
    ↓
    ├─ If "Interview" →
    │   ↓
    │   Generate Interview Email Draft
    │   ↓
    │   Send Interview Email (Gmail/SMTP) ← NEW!
    │   ↓
    │   Simulate Calendar Integration
    │   ↓
    │   Return Response
    │
    └─ If "Reject" →
        ↓
        Generate Rejection Email Draft
        ↓
        Send Rejection Email (Gmail/SMTP) ← NEW!
        ↓
        Return Response
```

---

## 🧪 Testing Email Sending

### Test with cURL:

```bash
curl -X POST http://localhost:5678/webhook/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "jd": "Senior React Developer with 5+ years experience",
    "resume": "John Doe - john@example.com - 7 years React experience",
    "provider": "openai",
    "userId": "test-user-id"
  }'
```

### Expected Behavior:

1. **If score ≥ 65** (Interview):
   - Email sent to candidate's email
   - Subject: "🎉 Interview Invitation - John Doe"
   - Calendar event created (simulated)

2. **If score < 65** (Reject):
   - Email sent to candidate's email
   - Subject: "Application Update - John Doe"

### Check Email Sent:

- Check your Gmail "Sent" folder
- Check candidate's inbox (if using real email)
- Check n8n execution logs for success/failure

---

## 🔒 Security & Best Practices

### 1. Email Rate Limiting

Add a delay between emails to avoid spam detection:

```json
{
  "parameters": {
    "amount": 2,
    "unit": "seconds"
  },
  "name": "Wait",
  "type": "n8n-nodes-base.wait",
  "typeVersion": 1
}
```

### 2. Error Handling

Add error handling nodes:

```json
{
  "parameters": {
    "rules": {
      "values": [
        {
          "conditions": {
            "string": [
              {
                "value1": "={{ $json.error }}",
                "operation": "isNotEmpty"
              }
            ]
          }
        }
      ]
    }
  },
  "name": "Check Email Send Error",
  "type": "n8n-nodes-base.if",
  "typeVersion": 1
}
```

### 3. Log Email Sends to Supabase

Add a node to log emails:

```json
{
  "parameters": {
    "method": "POST",
    "url": "={{ $env.SUPABASE_URL }}/rest/v1/email_logs",
    "authentication": "headerAuth",
    "headerParameters": {
      "parameters": [
        {
          "name": "apikey",
          "value": "={{ $env.SUPABASE_SERVICE_KEY }}"
        },
        {
          "name": "Authorization",
          "value": "Bearer ={{ $env.SUPABASE_SERVICE_KEY }}"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "user_id",
          "value": "={{ $json.userId }}"
        },
        {
          "name": "email_type",
          "value": "={{ $json.emailDraft.type }}"
        },
        {
          "name": "recipient_email",
          "value": "={{ $json.candidateEmail }}"
        },
        {
          "name": "status",
          "value": "sent"
        }
      ]
    }
  },
  "name": "Log Email to Supabase",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4
}
```

---

## 📝 Quick Setup Checklist

- [ ] Choose email method (Gmail OAuth or SMTP)
- [ ] Set up credentials in n8n
- [ ] Add email sending nodes to workflow
- [ ] Update workflow connections
- [ ] Test with sample data
- [ ] Verify email received
- [ ] Add error handling
- [ ] Add email logging to Supabase
- [ ] Set up rate limiting (optional)
- [ ] Update email templates (optional)

---

## 🚀 Next Steps

After adding email sending:

1. **Add Calendar Integration**: Replace "Simulate Calendar Integration" with real Google Calendar API
2. **Add Email Templates**: Create HTML email templates for better formatting
3. **Add Attachments**: Include JD or company info as attachments
4. **Add Scheduling**: Allow candidates to pick interview slots
5. **Add Reminders**: Send reminder emails before interviews

---

## 💡 Pro Tips

1. **Use Gmail for Development**: Easier OAuth setup
2. **Use SMTP for Production**: More reliable, works with any email provider
3. **Test with Your Own Email First**: Before sending to real candidates
4. **Monitor Email Logs**: Check Supabase `email_logs` table
5. **Handle Bounces**: Add error handling for invalid emails

---

**Ready to send real emails!** 📧

Choose your method (Gmail or SMTP) and follow the steps above to enable actual email sending in your n8n workflow.
