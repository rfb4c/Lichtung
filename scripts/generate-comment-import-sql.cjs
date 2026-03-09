#!/usr/bin/env node

/**
 * Generate SQL script to import mock comments from app-data.json
 * Usage: node scripts/generate-comment-import-sql.js > scripts/import-mock-comments.sql
 */

const fs = require('fs');
const path = require('path');

// Load app-data.json
const appDataPath = path.join(__dirname, '../src/data/app-data.json');
const appData = JSON.parse(fs.readFileSync(appDataPath, 'utf-8'));

// User ID mapping (userId → email)
const userEmailMap = {
  'user-01': 'mike.thompson@example.com',
  'user-02': 'sarah.chen@example.com',
  'user-03': 'james.walker@example.com',
  'user-04': 'diana.morales@example.com',
  'user-05': 'robert.hayes@example.com',
  'user-06': 'emily.nguyen@example.com',
  'user-07': 'carlos.ramirez@example.com',
  'user-08': 'karen.mitchell@example.com',
  'user-09': 'david.park@example.com',
  'user-10': 'lisa.johnson@example.com',
  'user-11': 'tom.bradley@example.com',
  'user-12': 'rachel.kim@example.com',
};

// SQL header
console.log(`-- ========================================
-- Import Mock Comments to Supabase
-- Generated from app-data.json
-- Total comments: ${appData.mockComments.length}
-- Execute in Supabase Dashboard → SQL Editor
-- ========================================

-- Clear existing comments (optional - uncomment if you want to start fresh)
-- DELETE FROM comments;

-- Import comments (each INSERT...SELECT auto-maps email to UUID)
`);

// Generate INSERT statements
appData.mockComments.forEach((comment, index) => {
  const userEmail = userEmailMap[comment.userId];
  if (!userEmail) {
    console.log(`-- WARNING: Unknown userId ${comment.userId} for comment ${comment.id}`);
    return;
  }

  // Escape single quotes in content
  const escapedContent = comment.content.replace(/'/g, "''");

  console.log(`-- ${comment.id} (${comment.userId})
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  '${comment.reportId}',
  id,
  '${escapedContent}',
  '${comment.createdAt}'::timestamptz
FROM auth.users
WHERE email = '${userEmail}';
`);
});

// SQL footer
console.log(`
-- ========================================
-- Verify import results
-- ========================================

SELECT
  COUNT(*) as total_comments,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT report_id) as unique_reports
FROM comments;

-- Expected output:
-- total_comments: ${appData.mockComments.length}
-- unique_users: ${Object.keys(userEmailMap).length}

-- Sample comments (first 10)
SELECT
  c.id,
  c.report_id,
  p.display_name,
  LEFT(c.content, 60) || '...' as content_preview,
  c.created_at
FROM comments c
JOIN profiles p ON c.user_id = p.id
ORDER BY c.created_at DESC
LIMIT 10;
`);
