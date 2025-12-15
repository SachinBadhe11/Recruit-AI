# Supabase Setup Guide for Recruit-AI

## Prerequisites
- Supabase account (free tier is sufficient)
- Google Cloud Console project (for OAuth)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Click "New Project"
5. Fill in:
   - **Name**: Recruit-AI
   - **Database Password**: (generate a strong password and save it)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free
6. Click "Create new project"
7. Wait for project to be provisioned (~2 minutes)

## Step 2: Get API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (this is safe to use in frontend)
3. Save these for later (you'll need them in `.env`)

## Step 3: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `backend/supabase-schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. Verify success:
   - You should see "Success. No rows returned"
   - Check the **Table Editor** to see all 5 tables created

## Step 4: Configure Google OAuth

### 4.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google+ API
   - Google Calendar API (for Phase 4)

### 4.2 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure consent screen if prompted:
   - User Type: External
   - App name: Recruit-AI
   - User support email: your email
   - Developer contact: your email
   - Add scopes: `email`, `profile`, `openid`
4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: Recruit-AI Web Client
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for local development)
     - `https://your-vercel-app.vercel.app` (for production)
   - Authorized redirect URIs:
     - `http://localhost:5173` (for local)
     - `https://your-vercel-app.vercel.app` (for production)
     - `https://xxxxx.supabase.co/auth/v1/callback` (Supabase callback)
5. Click **Create**
6. Copy **Client ID** and **Client Secret**

### 4.3 Configure in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google**
4. Paste your Google OAuth credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
5. Copy the **Redirect URL** shown (e.g., `https://xxxxx.supabase.co/auth/v1/callback`)
6. Go back to Google Cloud Console and add this URL to **Authorized redirect URIs** if not already added
7. Click **Save** in Supabase

## Step 5: Configure Email Auth

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. **Email** should be enabled by default
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize "Confirm signup", "Magic Link", etc.
4. For production, configure **SMTP** settings:
   - Go to **Project Settings** → **Auth**
   - Scroll to **SMTP Settings**
   - Enter your SMTP provider details (Gmail, SendGrid, etc.)

## Step 6: Configure Frontend Environment Variables

1. In your frontend directory, create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Fill in the values:
   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbG...
   VITE_N8N_WEBHOOK_URL_ANALYZE=http://localhost:5678/webhook/analyze
   VITE_N8N_WEBHOOK_URL_EMAIL=http://localhost:5678/webhook/send-email
   VITE_N8N_WEBHOOK_URL_CALENDAR=http://localhost:5678/webhook/schedule-interview
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

## Step 7: Test Database Connection

1. Start your frontend dev server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Open browser console (F12)
3. Check for any Supabase connection errors
4. Try signing up with a test email

## Step 8: Verify Tables and Policies

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'settings', 'screenings', 'email_logs', 'calendar_events');
```

## Troubleshooting

### Issue: "Missing Supabase environment variables"
- Check that `.env` file exists in frontend directory
- Verify variable names start with `VITE_`
- Restart dev server after changing `.env`

### Issue: Google OAuth not working
- Verify redirect URIs match exactly (including http/https)
- Check that Google OAuth consent screen is published
- Ensure Google+ API is enabled

### Issue: RLS policies blocking queries
- Verify user is authenticated (`supabase.auth.getUser()`)
- Check that `user_id` matches `auth.uid()`
- Review policies in Supabase dashboard

### Issue: Tables not created
- Check for SQL syntax errors in schema file
- Verify you have proper permissions
- Try running schema in smaller chunks

## Next Steps

After completing this setup:
1. ✅ Test signup/login with email
2. ✅ Test Google OAuth login
3. ✅ Verify profile creation in `profiles` table
4. ✅ Move to Phase 2: Update Login.jsx component

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Using `anon` key in frontend (not `service_role` key)
- [ ] RLS policies are enabled on all tables
- [ ] Google OAuth redirect URIs are restricted
- [ ] SMTP credentials are secure (if configured)

---

**Need Help?**
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
