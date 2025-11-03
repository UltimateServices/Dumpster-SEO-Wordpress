-- ============================================
-- ENABLE SUPABASE AUTHENTICATION
-- ============================================
-- Run this in your Supabase SQL Editor
-- This ensures auth is properly configured
-- ============================================

-- This is just a verification query
-- Actual auth settings must be configured in:
-- https://supabase.com/dashboard/project/zfrgvionocpdsmyfwwlb/auth/providers

SELECT
  'Auth is configured through Supabase Dashboard' as message,
  'Go to: Authentication > Providers' as step_1,
  'Enable Email provider' as step_2,
  'Optional: Configure email templates' as step_3,
  'Set site URL to your production domain' as step_4;

-- Verify users table exists (created automatically by Supabase)
SELECT
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'auth'
    AND table_name = 'users'
  ) as auth_enabled;
