-- ========================================
-- Phase 2.3: Import Mock Users to Supabase
-- Execute AFTER manually creating user accounts
-- ========================================

-- STEP 1: Manually create these 12 user accounts in Supabase Dashboard → Authentication
-- Use password: password123 for all (or your preferred test password)

-- user-01: mike.thompson@example.com
-- user-02: sarah.chen@example.com
-- user-03: james.walker@example.com
-- user-04: diana.morales@example.com
-- user-05: robert.hayes@example.com
-- user-06: emily.nguyen@example.com
-- user-07: carlos.ramirez@example.com
-- user-08: karen.mitchell@example.com
-- user-09: david.park@example.com
-- user-10: lisa.johnson@example.com
-- user-11: tom.bradley@example.com
-- user-12: rachel.kim@example.com

-- STEP 2: After creating accounts, run the UPDATE statements below
-- (Replace USER_ID with actual UUID from Supabase Authentication)

-- ========================================
-- Mike Thompson (user-01)
-- ========================================
UPDATE profiles
SET
  display_name = 'Mike Thompson',
  identities = '[
    {
      "id": "father",
      "layer": 1,
      "label": "Father",
      "emoji": "👨‍👧‍👦",
      "narrative": "Two kids, 8 and 12. Coaching their soccer team on weekends."
    },
    {
      "id": "veteran",
      "layer": 2,
      "label": "Veteran",
      "emoji": "🎖️",
      "narrative": "Served two tours in Afghanistan. Still processing what I saw there."
    },
    {
      "id": "small-business-owner",
      "layer": 3,
      "label": "Small Biz Owner",
      "emoji": "🏪"
    },
    {
      "id": "hunting-fishing",
      "layer": 4,
      "label": "Hunter & Angler",
      "emoji": "🎣"
    }
  ]'::jsonb,
  avatar_url = '/avatars/user-01.png'
WHERE id = 'USER_ID_FROM_AUTH_TABLE';

-- ========================================
-- Sarah Chen (user-02)
-- ========================================
UPDATE profiles
SET
  display_name = 'Sarah Chen',
  identities = '[
    {
      "id": "mother",
      "layer": 1,
      "label": "Mother",
      "emoji": "👩‍👧"
    },
    {
      "id": "immigrant-child",
      "layer": 2,
      "label": "Immigrant Roots",
      "emoji": "🌏",
      "narrative": "My parents came from Taiwan with $200 and two suitcases. I grew up translating for them at parent-teacher conferences."
    },
    {
      "id": "educator",
      "layer": 3,
      "label": "Educator",
      "emoji": "📚"
    },
    {
      "id": "cooking",
      "layer": 4,
      "label": "Home Chef",
      "emoji": "🍳"
    }
  ]'::jsonb,
  avatar_url = '/avatars/user-02.png'
WHERE id = 'USER_ID_FROM_AUTH_TABLE';

-- ========================================
-- James Walker (user-03)
-- ========================================
UPDATE profiles
SET
  display_name = 'James Walker',
  identities = '[
    {
      "id": "father",
      "layer": 1,
      "label": "Father",
      "emoji": "👨‍👧‍👦"
    },
    {
      "id": "small-town",
      "layer": 2,
      "label": "Country Raised",
      "emoji": "🏡",
      "narrative": "Population 2,000 in rural Montana. Everyone knew everyone."
    },
    {
      "id": "farmer",
      "layer": 3,
      "label": "Land & Livestock",
      "emoji": "🌾"
    },
    {
      "id": "faith-community",
      "layer": 4,
      "label": "Person of Faith",
      "emoji": "⛪"
    }
  ]'::jsonb,
  avatar_url = '/avatars/user-03.png'
WHERE id = 'USER_ID_FROM_AUTH_TABLE';

-- ========================================
-- Diana Morales (user-04)
-- ========================================
UPDATE profiles
SET
  display_name = 'Diana Morales',
  identities = '[
    {
      "id": "single-parent",
      "layer": 1,
      "label": "Solo Parent",
      "emoji": "💪",
      "narrative": "Raising my daughter alone since she was three. It''s exhausting, but watching her thrive makes every sacrifice worth it."
    },
    {
      "id": "working-class",
      "layer": 2,
      "label": "Blue-Collar Raised",
      "emoji": "🔧"
    },
    {
      "id": "healthcare-worker",
      "layer": 3,
      "label": "In Healthcare",
      "emoji": "🏥"
    },
    {
      "id": "pet-owner",
      "layer": 4,
      "label": "Pet Parent",
      "emoji": "🐕"
    }
  ]'::jsonb,
  avatar_url = '/avatars/user-04.png'
WHERE id = 'USER_ID_FROM_AUTH_TABLE';

-- ========================================
-- Robert Hayes (user-05)
-- ========================================
UPDATE profiles
SET
  display_name = 'Robert Hayes',
  identities = '[
    {
      "id": "caregiver",
      "layer": 1,
      "label": "Family Caregiver",
      "emoji": "🤲"
    },
    {
      "id": "veteran",
      "layer": 2,
      "label": "Veteran",
      "emoji": "🎖️",
      "narrative": "Did two deployments in Iraq. The transition back to civilian life wasn''t easy, but the fire department gave me purpose again."
    },
    {
      "id": "first-responder",
      "layer": 3,
      "label": "First responder",
      "emoji": "🚒"
    },
    {
      "id": "outdoor-recreation",
      "layer": 4,
      "label": "Trail & Peaks",
      "emoji": "⛰️"
    }
  ]'::jsonb,
  avatar_url = '/avatars/user-05.png'
WHERE id = 'USER_ID_FROM_AUTH_TABLE';

-- ========================================
-- Emily Nguyen (user-06)
-- ========================================
UPDATE profiles
SET
  display_name = 'Emily Nguyen',
  identities = '[
    {
      "id": "mother",
      "layer": 1,
      "label": "Mother",
      "emoji": "👩‍👧"
    },
    {
      "id": "first-gen-college",
      "layer": 2,
      "label": "First-Gen College",
      "emoji": "🎓",
      "narrative": "First person in my family to go to college. My parents worked three jobs between them to help me through state school."
    },
    {
      "id": "educator",
      "layer": 3,
      "label": "Educator",
      "emoji": "📚"
    },
    {
      "id": "outdoor-recreation",
      "layer": 4,
      "label": "Trail & Peaks",
      "emoji": "⛰️"
    }
  ]'::jsonb,
  avatar_url = '/avatars/user-06.png'
WHERE id = 'USER_ID_FROM_AUTH_TABLE';

-- ========================================
-- Carlos Ramirez (user-07)
-- ========================================
UPDATE profiles
SET
  display_name = 'Carlos Ramirez',
  identities = '[
    {
      "id": "father",
      "layer": 1,
      "label": "Father",
      "emoji": "👨‍👧‍👦"
    },
    {
      "id": "immigrant-child",
      "layer": 2,
      "label": "Immigrant Roots",
      "emoji": "🌏",
      "narrative": "My parents crossed the border with nothing. I grew up translating at doctor''s offices and parent-teacher conferences."
    },
    {
      "id": "volunteer",
      "layer": 3,
      "label": "Giving Back",
      "emoji": "🤝"
    },
    {
      "id": "cooking",
      "layer": 4,
      "label": "Home Chef",
      "emoji": "🍳"
    },
    {
      "id": "faith-community",
      "layer": 4,
      "label": "Person of Faith",
      "emoji": "⛪"
    }
  ]'::jsonb,
  avatar_url = '/avatars/user-07.png'
WHERE id = 'USER_ID_FROM_AUTH_TABLE';

-- ========================================
-- Karen Mitchell (user-08)
-- ========================================
UPDATE profiles
SET
  display_name = 'Karen Mitchell',
  identities = '[
    {
      "id": "grandparent",
      "layer": 1,
      "label": "Raising the Next Gen",
      "emoji": "👵",
      "narrative": "Watching my grandkids grow up reminds me how fast time goes. I try to pass down the values my parents taught me on the farm."
    },
    {
      "id": "small-town",
      "layer": 2,
      "label": "Country Raised",
      "emoji": "🏡"
    },
    {
      "id": "volunteer",
      "layer": 3,
      "label": "Giving Back",
      "emoji": "🤝"
    }
  ]'::jsonb,
  avatar_url = '/avatars/user-08.png'
WHERE id = 'USER_ID_FROM_AUTH_TABLE';

-- ========================================
-- David Park (user-09)
-- ========================================
UPDATE profiles
SET
  display_name = 'David Park',
  identities = '[
    {
      "id": "lost-loved-one",
      "layer": 1,
      "label": "Carrying a Loss",
      "emoji": "🕊️",
      "narrative": "Lost my wife to cancer two years ago. Some days are harder than others, but our dog keeps me grounded."
    },
    {
      "id": "chronic-illness",
      "layer": 2,
      "label": "Chronic Fighter",
      "emoji": "💪"
    },
    {
      "id": "healthcare-worker",
      "layer": 3,
      "label": "In Healthcare",
      "emoji": "🏥"
    },
    {
      "id": "pet-owner",
      "layer": 4,
      "label": "Pet Parent",
      "emoji": "🐕"
    }
  ]'::jsonb,
  avatar_url = '/avatars/user-09.png'
WHERE id = 'USER_ID_FROM_AUTH_TABLE';

-- ========================================
-- Lisa Johnson (user-10)
-- ========================================
UPDATE profiles
SET
  display_name = 'Lisa Johnson',
  identities = '[
    {
      "id": "military-family",
      "layer": 1,
      "label": "Military Family",
      "emoji": "🇺🇸"
    },
    {
      "id": "experienced-poverty",
      "layer": 2,
      "label": "Self-Made",
      "emoji": "💪"
    },
    {
      "id": "small-business-owner",
      "layer": 3,
      "label": "Small Biz Owner",
      "emoji": "🏪"
    },
    {
      "id": "hunting-fishing",
      "layer": 4,
      "label": "Hunter & Angler",
      "emoji": "🎣",
      "narrative": "My grandmother taught me to fish on Lake Superior. I take my kids there every summer."
    }
  ]'::jsonb,
  avatar_url = '/avatars/user-10.png'
WHERE id = 'USER_ID_FROM_AUTH_TABLE';

-- ========================================
-- Tom Bradley (user-11)
-- ========================================
UPDATE profiles
SET
  display_name = 'Tom Bradley',
  identities = '[
    {
      "id": "father",
      "layer": 1,
      "label": "Father",
      "emoji": "👨‍👧‍👦"
    },
    {
      "id": "small-town",
      "layer": 2,
      "label": "Country Raised",
      "emoji": "🏡"
    },
    {
      "id": "farmer",
      "layer": 3,
      "label": "Land & Livestock",
      "emoji": "🌾",
      "narrative": "Fourth-generation rancher. The land''s been in my family since 1892. Some city folks don''t get it, but this is who we are."
    },
    {
      "id": "hunting-fishing",
      "layer": 4,
      "label": "Hunter & Angler",
      "emoji": "🎣"
    },
    {
      "id": "faith-community",
      "layer": 4,
      "label": "Person of Faith",
      "emoji": "⛪"
    }
  ]'::jsonb,
  avatar_url = '/avatars/user-11.png'
WHERE id = 'USER_ID_FROM_AUTH_TABLE';

-- ========================================
-- Rachel Kim (user-12)
-- ========================================
UPDATE profiles
SET
  display_name = 'Rachel Kim',
  identities = '[
    {
      "id": "mother",
      "layer": 1,
      "label": "Mother",
      "emoji": "👩‍👧"
    },
    {
      "id": "first-gen-college",
      "layer": 2,
      "label": "First-Gen College",
      "emoji": "🎓"
    },
    {
      "id": "healthcare-worker",
      "layer": 3,
      "label": "In Healthcare",
      "emoji": "🏥",
      "narrative": "ER nurse for 11 years. I''ve held the hands of strangers on their worst days."
    },
    {
      "id": "cooking",
      "layer": 4,
      "label": "Cooking",
      "emoji": "🍳"
    }
  ]'::jsonb,
  avatar_url = '/avatars/user-12.png'
WHERE id = 'USER_ID_FROM_AUTH_TABLE';

-- ========================================
-- Verification
-- ========================================
-- Run this to verify all users have identities:
SELECT id, display_name, jsonb_array_length(identities) as tag_count
FROM profiles
WHERE display_name IN (
  'Mike Thompson', 'Sarah Chen', 'James Walker', 'Diana Morales',
  'Robert Hayes', 'Emily Nguyen', 'Carlos Ramirez', 'Karen Mitchell',
  'David Park', 'Lisa Johnson', 'Tom Bradley', 'Rachel Kim'
)
ORDER BY display_name;
