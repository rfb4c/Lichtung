-- ========================================
-- Verify Comments Table Schema
-- Execute in Supabase Dashboard → SQL Editor
-- ========================================

-- Check if comments table exists and view its schema
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'comments'
ORDER BY ordinal_position;

-- Expected output:
-- id           | uuid        | gen_random_uuid() | NO  | NULL
-- report_id    | text        | NULL              | NO  | NULL
-- user_id      | uuid        | NULL              | NO  | NULL
-- content      | text        | NULL              | NO  | NULL
-- created_at   | timestamptz | now()             | YES | NULL

-- Check foreign key constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'comments';

-- Expected output should show:
-- - report_id → reports(id)
-- - user_id → profiles(id)

-- Check indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'comments'
  AND schemaname = 'public';

-- Expected indexes:
-- - comments_pkey (PRIMARY KEY on id)
-- - idx_comments_report_id (on report_id)
-- - idx_comments_user_id (on user_id)

-- Count existing comments
SELECT COUNT(*) as comment_count FROM comments;
