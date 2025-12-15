-- Supabase Database Schema for Recruit-AI
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'Talent Acquisition',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  active_provider TEXT DEFAULT 'openai',
  provider_config JSONB DEFAULT '{"providers": {}}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies for settings
CREATE POLICY "Users can manage own settings" 
  ON settings FOR ALL 
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. SCREENINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_name TEXT,
  candidate_email TEXT,
  position_title TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  recommendation TEXT CHECK (recommendation IN ('Interview', 'Reject')),
  summary TEXT,
  details JSONB,
  raw_jd TEXT,
  raw_resume TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE screenings ENABLE ROW LEVEL SECURITY;

-- Policies for screenings
CREATE POLICY "Users can view own screenings" 
  ON screenings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own screenings" 
  ON screenings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own screenings" 
  ON screenings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own screenings" 
  ON screenings FOR DELETE 
  USING (auth.uid() = user_id);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_screenings_user_id ON screenings(user_id);
CREATE INDEX IF NOT EXISTS idx_screenings_created_at ON screenings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_screenings_recommendation ON screenings(recommendation);

-- =====================================================
-- 4. EMAIL_LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  screening_id UUID REFERENCES screenings(id) ON DELETE SET NULL,
  candidate_email TEXT NOT NULL,
  email_type TEXT CHECK (email_type IN ('interview', 'rejection')),
  subject TEXT,
  status TEXT CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Policies for email_logs
CREATE POLICY "Users can view own email logs" 
  ON email_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email logs" 
  ON email_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Index for email logs
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_screening_id ON email_logs(screening_id);

-- =====================================================
-- 5. CALENDAR_EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  screening_id UUID REFERENCES screenings(id) ON DELETE SET NULL,
  candidate_email TEXT NOT NULL,
  candidate_name TEXT,
  event_id TEXT, -- Google Calendar event ID
  event_link TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Policies for calendar_events
CREATE POLICY "Users can manage own calendar events" 
  ON calendar_events FOR ALL 
  USING (auth.uid() = user_id);

-- Index for calendar events
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_screening_id ON calendar_events(screening_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);

-- =====================================================
-- 6. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for settings table
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. INITIAL DATA / SEED (Optional)
-- =====================================================

-- You can add seed data here if needed
-- Example: Default settings for new users

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if all tables were created successfully
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'settings', 'screenings', 'email_logs', 'calendar_events');

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('profiles', 'settings', 'screenings', 'email_logs', 'calendar_events');
