-- ========================================
-- Verify Data Relationships After Import
-- Execute in Supabase Dashboard → SQL Editor
-- ========================================

-- 1. Check comments exist and have valid foreign keys
SELECT
  'Comments Check' as test,
  COUNT(*) as total_comments,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT report_id) as unique_reports
FROM comments;

-- 2. Check if all comment report_ids exist in reports table
SELECT
  'Orphaned Comments Check' as test,
  COUNT(*) as orphaned_comments
FROM comments c
WHERE NOT EXISTS (
  SELECT 1 FROM reports r WHERE r.id = c.report_id
);
-- Should be 0

-- 3. Sample joined query (similar to ProfilePage)
SELECT
  c.id as comment_id,
  c.content,
  r.id as report_id,
  r.title as report_title,
  t.id as topic_id,
  t.name as topic_name
FROM comments c
LEFT JOIN reports r ON c.report_id = r.id
LEFT JOIN topics t ON r.topic_id = t.id
LIMIT 5;

-- 4. Check reports with topics
SELECT
  'Reports with Topics' as test,
  COUNT(*) as total_reports,
  COUNT(topic_id) as reports_with_topics
FROM reports;
-- Both should be 24

-- 5. Detailed view of a user's comments with all relations
SELECT
  c.id,
  c.content,
  c.created_at,
  r.title as report_title,
  t.name as topic_name,
  p.display_name as user_name
FROM comments c
JOIN reports r ON c.report_id = r.id
JOIN topics t ON r.topic_id = t.id
JOIN profiles p ON c.user_id = p.id
WHERE p.display_name = 'Mike Thompson'  -- Change to any user
ORDER BY c.created_at DESC;
