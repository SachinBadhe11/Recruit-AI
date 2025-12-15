# 🚀 Recruit-AI - Complete Setup & Run Guide

## Overview

This guide will walk you through setting up and running the complete Recruit-AI application, including the frontend, backend (n8n), and database (Supabase).

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- ✅ **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- ✅ **npm** (comes with Node.js)
- ✅ **Git** (for cloning the repository)
- ✅ **A code editor** (VS Code recommended)

---

## 🎯 Quick Start (Mock Mode - No Setup Required)

If you just want to test the UI without setting up Supabase or n8n:

### Step 1: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 2: Run in Mock Mode
```bash
npm run dev
```

### Step 3: Open Browser
- Navigate to: **http://localhost:5173/**
- The app will use mock data for testing

**Note:** In mock mode, authentication and data persistence won't work, but you can test the UI and screening flow.

---

## 🏗️ Full Production Setup

For a complete, production-ready setup with real authentication, database, and AI analysis:

---

## Part 1: Supabase Setup (Database & Authentication)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign in with GitHub or email
4. Click **"New Project"**
5. Fill in:
   - **Name**: `Recruit-AI`
   - **Database Password**: (generate and save it)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
6. Click **"Create new project"**
7. Wait 2-3 minutes for provisioning

### Step 2: Get API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (long string)
3. Save these for later

### Step 3: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Open the file: `backend/supabase-schema.sql`
4. Copy the **entire contents** of the file
5. Paste into the SQL editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see: **"Success. No rows returned"**

### Step 4: Verify Tables Created

1. Go to **Table Editor** in Supabase
2. You should see 5 tables:
   - `profiles`
   - `settings`
   - `screenings`
   - `email_logs`
   - `calendar_events`

### Step 5: Configure Google OAuth (Optional)

**If you want Google Sign-In:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. Configure consent screen if prompted
6. Create OAuth client:
   - **Application type**: Web application
   - **Name**: Recruit-AI
   - **Authorized redirect URIs**: 
     - `http://localhost:5173`
     - `https://xxxxx.supabase.co/auth/v1/callback` (from Supabase)
7. Copy **Client ID** and **Client Secret**

8. In Supabase:
   - Go to **Authentication** → **Providers**
   - Enable **Google**
   - Paste Client ID and Client Secret
   - Click **Save**

---

## Part 2: Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Create Environment File

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your values:
   ```bash
   # Supabase (from Part 1, Step 2)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here

   # n8n Webhooks (we'll set these up in Part 3)
   VITE_N8N_WEBHOOK_URL_ANALYZE=http://localhost:5678/webhook/analyze
   VITE_N8N_WEBHOOK_URL_EMAIL=http://localhost:5678/webhook/send-email
   VITE_N8N_WEBHOOK_URL_CALENDAR=http://localhost:5678/webhook/schedule-interview

   # Mock mode (set to false for production)
   VITE_USE_MOCK=false

   # Google OAuth (optional)
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

### Step 3: Run Frontend

```bash
npm run dev
```

**Expected Output:**
```
VITE v7.2.4  ready in 1554 ms

➜  Local:   http://localhost:5173/
```

### Step 4: Test Authentication

1. Open browser: **http://localhost:5173/**
2. You should see the login screen
3. Click **"Sign up"**
4. Enter:
   - Name: Your name
   - Email: your@email.com
   - Password: (min 6 characters)
5. Click **"Create Account"**
6. You should be redirected to the dashboard

**✅ Frontend is now running with authentication!**

---

## Part 3: n8n Setup (AI Backend)

### Step 1: Install n8n

**Option A: Using npx (Recommended for testing)**
```bash
npx n8n
```

**Option B: Global installation**
```bash
npm install -g n8n
n8n start
```

**Expected Output:**
```
Editor is now accessible via:
http://localhost:5678/
```

### Step 2: Access n8n Dashboard

1. Open browser: **http://localhost:5678/**
2. Create an account (first time only)
3. You'll see the n8n workflow editor

### Step 3: Import Workflow

1. In n8n, click **"Add workflow"** → **"Import from File"**
2. Select: `backend/recruit-ai-workflow.json`
3. Click **"Import"**
4. The workflow should load with all nodes

### Step 4: Configure Environment Variables

**Option A: Set in n8n UI**
1. Go to **Settings** → **Environment Variables**
2. Add these variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   OPENAI_API_KEY=sk-...
   PERPLEXITY_API_KEY=pplx-...
   GEMINI_API_KEY=AIza...
   ```

**Option B: Set in terminal (before starting n8n)**
```bash
# Windows PowerShell
$env:OPENAI_API_KEY="sk-your-key-here"
$env:SUPABASE_URL="https://your-project.supabase.co"
npx n8n

# macOS/Linux
export OPENAI_API_KEY="sk-your-key-here"
export SUPABASE_URL="https://your-project.supabase.co"
npx n8n
```

### Step 5: Update Workflow Nodes

1. Open the imported workflow
2. Find the **"Configure LLM Provider"** node
3. Click to edit
4. Follow instructions in `backend/N8N_MULTI_LLM_SETUP.md` to update the code
5. Click **"Save"**

### Step 6: Activate Workflow

1. In the workflow editor, toggle the switch at the top to **"Active"**
2. The webhook should now be listening at: `http://localhost:5678/webhook/analyze`

### Step 7: Test Webhook

**Using cURL:**
```bash
curl -X POST http://localhost:5678/webhook/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "jd": "Looking for a Senior React Developer with 5+ years experience",
    "resume": "John Doe - 7 years React experience, worked at Google",
    "provider": "openai",
    "userId": "test-user-id"
  }'
```

**Expected Response:**
```json
{
  "score": 88,
  "summary": "Strong candidate...",
  "recommendation": "Interview",
  "details": [...],
  "candidateName": "John Doe",
  "candidateEmail": "john@example.com"
}
```

**✅ n8n backend is now running!**

---

## Part 4: Connect Frontend to Backend

### Step 1: Update Frontend Environment

Make sure your `frontend/.env` has:
```bash
VITE_USE_MOCK=false
VITE_N8N_WEBHOOK_URL_ANALYZE=http://localhost:5678/webhook/analyze
```

### Step 2: Restart Frontend

1. Stop the frontend (Ctrl+C in terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 3: Configure LLM Provider in UI

1. Open **http://localhost:5173/**
2. Sign in
3. Go to **Settings** (sidebar)
4. Select a provider (OpenAI, Perplexity, Gemini, or Custom)
5. Enter your API key
6. Select a model
7. Click **"Save Settings"**

### Step 4: Test Full Flow

1. Go to **Dashboard**
2. Click **"Single Screening"** tab
3. Enter a Job Description:
   ```
   Senior React Developer
   - 5+ years React experience
   - TypeScript proficiency
   - Team leadership
   ```
4. Enter a Resume (or upload file):
   ```
   John Doe
   john@example.com
   
   Senior Software Engineer with 7 years of React development.
   Expert in TypeScript, Redux, and modern web technologies.
   Led teams of 5+ developers at Google.
   ```
5. Click **"Analyze Candidate"**
6. Wait 5-10 seconds
7. You should see the analysis result!

**✅ Full system is now working!**

---

## 🎯 Running the Complete System

### Terminal 1: Frontend
```bash
cd frontend
npm run dev
```
**URL**: http://localhost:5173/

### Terminal 2: n8n Backend
```bash
npx n8n
```
**URL**: http://localhost:5678/

### Terminal 3: (Optional) Check Logs
```bash
# Watch frontend logs
cd frontend
npm run dev

# Watch n8n logs
# Logs appear in the n8n terminal
```

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────┐
│  Browser (http://localhost:5173)                   │
│  ┌─────────────────────────────────────────────┐   │
│  │  React Frontend (Vite)                      │   │
│  │  - Login/Signup                             │   │
│  │  - Dashboard                                │   │
│  │  - Settings                                 │   │
│  │  - History                                  │   │
│  └─────────────┬───────────────────────────────┘   │
└────────────────┼─────────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼────────┐        ┌───────▼──────┐
│  Supabase  │        │  n8n Backend │
│            │        │ (localhost:  │
│ - Auth     │        │  5678)       │
│ - Database │        │              │
│ - RLS      │        │ - Webhooks   │
└────────────┘        │ - LLM Calls  │
                      └───────┬──────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              ┌─────▼─────┐      ┌──────▼──────┐
              │  OpenAI   │      │ Perplexity  │
              │  Gemini   │      │   Custom    │
              └───────────┘      └─────────────┘
```

---

## 🔧 Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:**
1. Check `.env` file exists in `frontend/` directory
2. Verify variables start with `VITE_`
3. Restart dev server after changing `.env`

### Issue: "Failed to analyze candidate"

**Possible causes:**
1. **n8n not running**: Start n8n (`npx n8n`)
2. **Workflow not active**: Toggle workflow to "Active" in n8n
3. **API key not configured**: Add API key in Settings or n8n env vars
4. **Wrong webhook URL**: Check `VITE_N8N_WEBHOOK_URL_ANALYZE` in `.env`

### Issue: "Login not working"

**Possible causes:**
1. **Supabase not configured**: Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. **Database schema not run**: Run `supabase-schema.sql` in Supabase SQL Editor
3. **RLS policies blocking**: Check Supabase logs for policy errors

### Issue: "Port already in use"

**Solution:**
```bash
# Frontend (if 5173 is in use)
# Vite will automatically use next available port (5174, 5175, etc.)

# n8n (if 5678 is in use)
n8n start --port 5679
# Then update VITE_N8N_WEBHOOK_URL_ANALYZE in .env
```

### Issue: "CORS errors"

**Solution:**
1. n8n should allow CORS by default for localhost
2. If issues persist, add to n8n settings:
   ```bash
   N8N_CORS_ORIGIN=http://localhost:5173
   ```

---

## 📝 Development Workflow

### Daily Development

1. **Start Supabase** (already running in cloud)
2. **Start n8n**:
   ```bash
   npx n8n
   ```
3. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
4. **Open browser**: http://localhost:5173/

### Making Changes

**Frontend changes:**
- Edit files in `frontend/src/`
- Vite hot-reloads automatically
- No restart needed

**n8n workflow changes:**
- Edit nodes in n8n UI
- Click "Save"
- Changes take effect immediately

**Database changes:**
- Run SQL in Supabase SQL Editor
- Changes take effect immediately

---

## 🚀 Production Deployment

### Frontend (Vercel)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

3. **Set environment variables** in Vercel dashboard

### Backend (n8n Cloud or Self-hosted)

**Option A: n8n Cloud**
1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Import workflow
3. Set environment variables
4. Activate workflow

**Option B: Self-hosted**
1. Deploy to VPS (DigitalOcean, AWS, etc.)
2. Use Docker or PM2 to run n8n
3. Configure domain and SSL

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **n8n Docs**: https://docs.n8n.io
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev

---

## ✅ Success Checklist

After setup, you should be able to:

- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign in with Google (if configured)
- [ ] Navigate to Settings
- [ ] Configure LLM provider (OpenAI/Perplexity/Gemini)
- [ ] Save settings
- [ ] Go to Dashboard
- [ ] Analyze a candidate (single screening)
- [ ] See analysis results
- [ ] View screening in History
- [ ] Filter and sort history
- [ ] Export history to CSV
- [ ] Logout and login again (session persists)

---

## 🎉 You're All Set!

Your Recruit-AI application is now fully functional with:
- ✅ Real authentication
- ✅ Database persistence
- ✅ AI-powered screening
- ✅ Multi-LLM support
- ✅ Screening history

**Happy recruiting! 🚀**

---

## 💡 Quick Commands Reference

```bash
# Frontend
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# n8n
npx n8n              # Start n8n (no installation)
npm install -g n8n   # Install globally
n8n start            # Start n8n (if installed globally)

# Supabase
# All operations done via web dashboard
# https://app.supabase.com
```

---

**Need help?** Check the troubleshooting section or refer to:
- `backend/SUPABASE_SETUP.md` - Detailed Supabase setup
- `backend/N8N_MULTI_LLM_SETUP.md` - n8n configuration guide
- `frontend/FRONTEND_DOCUMENTATION.md` - Frontend architecture
