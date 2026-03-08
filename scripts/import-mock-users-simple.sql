-- ========================================
-- 一键导入所有 Mock 用户（简化版 - 含头像）
-- 前提：已在 Supabase Dashboard 手动创建 12 个用户账号（只需 email + password）
-- ========================================

-- 这个脚本会：
-- 1. 更新 auth.users 表的 raw_user_meta_data（添加 display_name）
-- 2. 创建或更新 profiles 表记录（包含 avatar_url 和完整的 identities）

-- ========================================
-- 1. Mike Thompson
-- ========================================
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"display_name": "Mike Thompson"}'::jsonb
WHERE email = 'mike.thompson@example.com';

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT
  id,
  'Mike Thompson',
  '/avatars/user-01.png',
  '{}',
  '[
    {"id": "father", "layer": 1, "label": "Father", "emoji": "👨‍👧‍👦", "narrative": "Two kids, 8 and 12. Coaching their soccer team on weekends."},
    {"id": "veteran", "layer": 2, "label": "Veteran", "emoji": "🎖️", "narrative": "Served two tours in Afghanistan. Still processing what I saw there."},
    {"id": "small-business-owner", "layer": 3, "label": "Small Biz Owner", "emoji": "🏪"},
    {"id": "hunting-fishing", "layer": 4, "label": "Hunter & Angler", "emoji": "🎣"}
  ]'::jsonb
FROM auth.users
WHERE email = 'mike.thompson@example.com'
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    identities = EXCLUDED.identities;

-- ========================================
-- 2. Sarah Chen
-- ========================================
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"display_name": "Sarah Chen"}'::jsonb
WHERE email = 'sarah.chen@example.com';

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT
  id,
  'Sarah Chen',
  '/avatars/user-02.png',
  '{}',
  '[
    {"id": "mother", "layer": 1, "label": "Mother", "emoji": "👩‍👧"},
    {"id": "immigrant-child", "layer": 2, "label": "Immigrant Roots", "emoji": "🌏", "narrative": "My parents came from Taiwan with $200 and two suitcases. I grew up translating for them at parent-teacher conferences."},
    {"id": "educator", "layer": 3, "label": "Educator", "emoji": "📚"},
    {"id": "cooking", "layer": 4, "label": "Home Chef", "emoji": "🍳"}
  ]'::jsonb
FROM auth.users
WHERE email = 'sarah.chen@example.com'
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    identities = EXCLUDED.identities;

-- ========================================
-- 3. James Walker
-- ========================================
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"display_name": "James Walker"}'::jsonb
WHERE email = 'james.walker@example.com';

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT
  id,
  'James Walker',
  '/avatars/user-03.png',
  '{}',
  '[
    {"id": "father", "layer": 1, "label": "Father", "emoji": "👨‍👧‍👦"},
    {"id": "small-town", "layer": 2, "label": "Country Raised", "emoji": "🏡", "narrative": "Population 2,000 in rural Montana. Everyone knew everyone."},
    {"id": "farmer", "layer": 3, "label": "Land & Livestock", "emoji": "🌾"},
    {"id": "faith-community", "layer": 4, "label": "Person of Faith", "emoji": "⛪"}
  ]'::jsonb
FROM auth.users
WHERE email = 'james.walker@example.com'
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    identities = EXCLUDED.identities;

-- ========================================
-- 4. Diana Morales
-- ========================================
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"display_name": "Diana Morales"}'::jsonb
WHERE email = 'diana.morales@example.com';

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT
  id,
  'Diana Morales',
  '/avatars/user-04.png',
  '{}',
  '[
    {"id": "single-parent", "layer": 1, "label": "Solo Parent", "emoji": "💪", "narrative": "Raising my daughter alone since she was three. It''s exhausting, but watching her thrive makes every sacrifice worth it."},
    {"id": "working-class", "layer": 2, "label": "Blue-Collar Raised", "emoji": "🔧"},
    {"id": "healthcare-worker", "layer": 3, "label": "In Healthcare", "emoji": "🏥"},
    {"id": "pet-owner", "layer": 4, "label": "Pet Parent", "emoji": "🐕"}
  ]'::jsonb
FROM auth.users
WHERE email = 'diana.morales@example.com'
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    identities = EXCLUDED.identities;

-- ========================================
-- 5. Robert Hayes
-- ========================================
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"display_name": "Robert Hayes"}'::jsonb
WHERE email = 'robert.hayes@example.com';

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT
  id,
  'Robert Hayes',
  '/avatars/user-05.png',
  '{}',
  '[
    {"id": "caregiver", "layer": 1, "label": "Family Caregiver", "emoji": "🤲"},
    {"id": "veteran", "layer": 2, "label": "Veteran", "emoji": "🎖️", "narrative": "Did two deployments in Iraq. The transition back to civilian life wasn''t easy, but the fire department gave me purpose again."},
    {"id": "first-responder", "layer": 3, "label": "First responder", "emoji": "🚒"},
    {"id": "outdoor-recreation", "layer": 4, "label": "Trail & Peaks", "emoji": "⛰️"}
  ]'::jsonb
FROM auth.users
WHERE email = 'robert.hayes@example.com'
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    identities = EXCLUDED.identities;

-- ========================================
-- 6. Emily Nguyen
-- ========================================
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"display_name": "Emily Nguyen"}'::jsonb
WHERE email = 'emily.nguyen@example.com';

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT
  id,
  'Emily Nguyen',
  '/avatars/user-06.png',
  '{}',
  '[
    {"id": "mother", "layer": 1, "label": "Mother", "emoji": "👩‍👧"},
    {"id": "first-gen-college", "layer": 2, "label": "First-Gen College", "emoji": "🎓", "narrative": "First person in my family to go to college. My parents worked three jobs between them to help me through state school."},
    {"id": "educator", "layer": 3, "label": "Educator", "emoji": "📚"},
    {"id": "outdoor-recreation", "layer": 4, "label": "Trail & Peaks", "emoji": "⛰️"}
  ]'::jsonb
FROM auth.users
WHERE email = 'emily.nguyen@example.com'
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    identities = EXCLUDED.identities;

-- ========================================
-- 7. Carlos Ramirez
-- ========================================
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"display_name": "Carlos Ramirez"}'::jsonb
WHERE email = 'carlos.ramirez@example.com';

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT
  id,
  'Carlos Ramirez',
  '/avatars/user-07.png',
  '{}',
  '[
    {"id": "father", "layer": 1, "label": "Father", "emoji": "👨‍👧‍👦"},
    {"id": "immigrant-child", "layer": 2, "label": "Immigrant Roots", "emoji": "🌏", "narrative": "My parents crossed the border with nothing. I grew up translating at doctor''s offices and parent-teacher conferences."},
    {"id": "volunteer", "layer": 3, "label": "Giving Back", "emoji": "🤝"},
    {"id": "cooking", "layer": 4, "label": "Home Chef", "emoji": "🍳"},
    {"id": "faith-community", "layer": 4, "label": "Person of Faith", "emoji": "⛪"}
  ]'::jsonb
FROM auth.users
WHERE email = 'carlos.ramirez@example.com'
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    identities = EXCLUDED.identities;

-- ========================================
-- 8. Karen Mitchell
-- ========================================
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"display_name": "Karen Mitchell"}'::jsonb
WHERE email = 'karen.mitchell@example.com';

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT
  id,
  'Karen Mitchell',
  '/avatars/user-08.png',
  '{}',
  '[
    {"id": "grandparent", "layer": 1, "label": "Raising the Next Gen", "emoji": "👵", "narrative": "Watching my grandkids grow up reminds me how fast time goes. I try to pass down the values my parents taught me on the farm."},
    {"id": "small-town", "layer": 2, "label": "Country Raised", "emoji": "🏡"},
    {"id": "volunteer", "layer": 3, "label": "Giving Back", "emoji": "🤝"}
  ]'::jsonb
FROM auth.users
WHERE email = 'karen.mitchell@example.com'
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    identities = EXCLUDED.identities;

-- ========================================
-- 9. David Park
-- ========================================
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"display_name": "David Park"}'::jsonb
WHERE email = 'david.park@example.com';

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT
  id,
  'David Park',
  '/avatars/user-09.png',
  '{}',
  '[
    {"id": "lost-loved-one", "layer": 1, "label": "Carrying a Loss", "emoji": "🕊️", "narrative": "Lost my wife to cancer two years ago. Some days are harder than others, but our dog keeps me grounded."},
    {"id": "chronic-illness", "layer": 2, "label": "Chronic Fighter", "emoji": "💪"},
    {"id": "healthcare-worker", "layer": 3, "label": "In Healthcare", "emoji": "🏥"},
    {"id": "pet-owner", "layer": 4, "label": "Pet Parent", "emoji": "🐕"}
  ]'::jsonb
FROM auth.users
WHERE email = 'david.park@example.com'
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    identities = EXCLUDED.identities;

-- ========================================
-- 10. Lisa Johnson
-- ========================================
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"display_name": "Lisa Johnson"}'::jsonb
WHERE email = 'lisa.johnson@example.com';

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT
  id,
  'Lisa Johnson',
  '/avatars/user-10.png',
  '{}',
  '[
    {"id": "military-family", "layer": 1, "label": "Military Family", "emoji": "🇺🇸"},
    {"id": "experienced-poverty", "layer": 2, "label": "Self-Made", "emoji": "💪"},
    {"id": "small-business-owner", "layer": 3, "label": "Small Biz Owner", "emoji": "🏪"},
    {"id": "hunting-fishing", "layer": 4, "label": "Hunter & Angler", "emoji": "🎣", "narrative": "My grandmother taught me to fish on Lake Superior. I take my kids there every summer."}
  ]'::jsonb
FROM auth.users
WHERE email = 'lisa.johnson@example.com'
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    identities = EXCLUDED.identities;

-- ========================================
-- 11. Tom Bradley
-- ========================================
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"display_name": "Tom Bradley"}'::jsonb
WHERE email = 'tom.bradley@example.com';

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT
  id,
  'Tom Bradley',
  '/avatars/user-11.png',
  '{}',
  '[
    {"id": "father", "layer": 1, "label": "Father", "emoji": "👨‍👧‍👦"},
    {"id": "small-town", "layer": 2, "label": "Country Raised", "emoji": "🏡"},
    {"id": "farmer", "layer": 3, "label": "Land & Livestock", "emoji": "🌾", "narrative": "Fourth-generation rancher. The land''s been in my family since 1892. Some city folks don''t get it, but this is who we are."},
    {"id": "hunting-fishing", "layer": 4, "label": "Hunter & Angler", "emoji": "🎣"},
    {"id": "faith-community", "layer": 4, "label": "Person of Faith", "emoji": "⛪"}
  ]'::jsonb
FROM auth.users
WHERE email = 'tom.bradley@example.com'
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    identities = EXCLUDED.identities;

-- ========================================
-- 12. Rachel Kim
-- ========================================
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"display_name": "Rachel Kim"}'::jsonb
WHERE email = 'rachel.kim@example.com';

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT
  id,
  'Rachel Kim',
  '/avatars/user-12.png',
  '{}',
  '[
    {"id": "mother", "layer": 1, "label": "Mother", "emoji": "👩‍👧"},
    {"id": "first-gen-college", "layer": 2, "label": "First-Gen College", "emoji": "🎓"},
    {"id": "healthcare-worker", "layer": 3, "label": "In Healthcare", "emoji": "🏥", "narrative": "ER nurse for 11 years. I''ve held the hands of strangers on their worst days."},
    {"id": "cooking", "layer": 4, "label": "Cooking", "emoji": "🍳"}
  ]'::jsonb
FROM auth.users
WHERE email = 'rachel.kim@example.com'
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    identities = EXCLUDED.identities;

-- ========================================
-- 验证导入结果
-- ========================================
SELECT
  id,
  display_name,
  avatar_url,
  jsonb_array_length(identities) as tag_count,
  created_at
FROM profiles
WHERE display_name IN (
  'Mike Thompson', 'Sarah Chen', 'James Walker', 'Diana Morales',
  'Robert Hayes', 'Emily Nguyen', 'Carlos Ramirez', 'Karen Mitchell',
  'David Park', 'Lisa Johnson', 'Tom Bradley', 'Rachel Kim'
)
ORDER BY display_name;

-- 预期输出：12 行记录
-- - display_name: 姓名
-- - avatar_url: /avatars/user-XX.png
-- - tag_count: 3-5 之间
