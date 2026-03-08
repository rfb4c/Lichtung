-- ========================================
-- Phase 2.3: Add identities column to profiles
-- Execute in Supabase Dashboard → SQL Editor
-- ========================================

-- 1. Add identities column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS identities JSONB DEFAULT '[]'::jsonb;

-- 2. Add column comment for documentation
COMMENT ON COLUMN profiles.identities IS 'Path C: User identity tags with narratives (Layer 1-4)';

-- 3. Create GIN index for JSONB queries (performance optimization)
CREATE INDEX IF NOT EXISTS idx_profiles_identities
ON profiles USING gin(identities);

-- 4. Verify the schema change
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Expected output should include:
-- identities | jsonb | '[]'::jsonb | YES
