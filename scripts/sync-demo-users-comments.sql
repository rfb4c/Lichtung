-- ========================================
-- Sync mock profiles and comments to src/data/app-data.json
--
-- GENERATED FILE — do not hand-edit.
-- Regenerate: node scripts/generate-supabase-sync.cjs
--
-- 13 profiles · 76 comments
--
-- OPTIONAL. Run sync-demo-data.sql first (comments reference reports).
--
-- Prerequisite: the 13 auth accounts listed below must exist
-- (Dashboard -> Authentication -> Users), because profiles.id and
-- comments.user_id are foreign keys into auth.users. If you skip this script,
-- the app falls back to the mock comments in app-data.json — identity chips and
-- all — so the demo still shows everything.
-- ========================================

BEGIN;

CREATE TEMP TABLE mock_user_map (mock_id text PRIMARY KEY, auth_email text NOT NULL) ON COMMIT DROP;
INSERT INTO mock_user_map (mock_id, auth_email) VALUES
  ($lch$user-01$lch$, $lch$mike.thompson@example.com$lch$),
  ($lch$user-02$lch$, $lch$sarah.chen@example.com$lch$),
  ($lch$user-03$lch$, $lch$james.walker@example.com$lch$),
  ($lch$user-04$lch$, $lch$diana.morales@example.com$lch$),
  ($lch$user-05$lch$, $lch$robert.hayes@example.com$lch$),
  ($lch$user-06$lch$, $lch$emily.nguyen@example.com$lch$),
  ($lch$user-07$lch$, $lch$carlos.ramirez@example.com$lch$),
  ($lch$user-08$lch$, $lch$karen.mitchell@example.com$lch$),
  ($lch$user-09$lch$, $lch$david.park@example.com$lch$),
  ($lch$user-10$lch$, $lch$lisa.johnson@example.com$lch$),
  ($lch$user-11$lch$, $lch$tom.bradley@example.com$lch$),
  ($lch$user-12$lch$, $lch$rachel.kim@example.com$lch$),
  ($lch$user-13$lch$, $lch$jake.miller@example.com$lch$);

-- Stop before touching anything if an account is missing
DO $$
DECLARE missing text;
BEGIN
  SELECT string_agg(m.auth_email, ', ' ORDER BY m.mock_id) INTO missing
  FROM mock_user_map m
  LEFT JOIN auth.users u ON u.email = m.auth_email
  WHERE u.id IS NULL;

  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'No auth account for: %. Create them in Dashboard -> Authentication -> Users, or fix AUTH_EMAIL in scripts/generate-supabase-sync.cjs and regenerate.', missing;
  END IF;
END $$;

DELETE FROM public.comments
WHERE user_id IN (SELECT u.id FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email);

-- ---------- Profiles (13) ----------
UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || $lch${"display_name":"Mike Thompson"}$lch$::jsonb
WHERE email = (SELECT auth_email FROM mock_user_map WHERE mock_id = $lch$user-01$lch$);

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT u.id, $lch$Mike Thompson$lch$, $lch$/avatars/user-09.png$lch$, '{}', $lch$[{"id":"father","layer":1,"label":"Father","emoji":"👨‍👧‍👦","narrative":"Two kids, 8 and 12. Coaching their soccer team on weekends."},{"id":"veteran","layer":2,"label":"Veteran","emoji":"🎖️","narrative":"Served two tours in Afghanistan. Still processing what I saw there."},{"id":"small-business-owner","layer":3,"label":"Small Biz Owner","emoji":"🏪"},{"id":"hunting-fishing","layer":4,"label":"Hunter & Angler","emoji":"🎣"}]$lch$::jsonb
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-01$lch$
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, identities = EXCLUDED.identities;

UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || $lch${"display_name":"Sarah Chen"}$lch$::jsonb
WHERE email = (SELECT auth_email FROM mock_user_map WHERE mock_id = $lch$user-02$lch$);

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT u.id, $lch$Sarah Chen$lch$, $lch$/avatars/user-02.png$lch$, '{}', $lch$[{"id":"mother","layer":1,"label":"Mother","emoji":"👩‍👧"},{"id":"immigrant-child","layer":2,"label":"Immigrant Roots","emoji":"🌏","narrative":"My parents came from Taiwan with $200 and two suitcases. I grew up translating for them at parent-teacher conferences."},{"id":"educator","layer":3,"label":"Educator","emoji":"📚"},{"id":"cooking","layer":4,"label":"Home Chef","emoji":"🍳"}]$lch$::jsonb
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-02$lch$
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, identities = EXCLUDED.identities;

UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || $lch${"display_name":"James Walker"}$lch$::jsonb
WHERE email = (SELECT auth_email FROM mock_user_map WHERE mock_id = $lch$user-03$lch$);

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT u.id, $lch$James Walker$lch$, $lch$/avatars/user-03.png$lch$, '{}', $lch$[{"id":"father","layer":1,"label":"Father","emoji":"👨‍👧‍👦"},{"id":"small-town","layer":2,"label":"Country Raised","emoji":"🏡","narrative":"Population 2,000 in rural Montana. Everyone knew everyone."},{"id":"farmer","layer":3,"label":"Land & Livestock","emoji":"🌾"},{"id":"faith-community","layer":4,"label":"Person of Faith","emoji":"⛪"}]$lch$::jsonb
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-03$lch$
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, identities = EXCLUDED.identities;

UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || $lch${"display_name":"Diana Morales"}$lch$::jsonb
WHERE email = (SELECT auth_email FROM mock_user_map WHERE mock_id = $lch$user-04$lch$);

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT u.id, $lch$Diana Morales$lch$, $lch$/avatars/user-04.png$lch$, '{}', $lch$[{"id":"single-parent","layer":1,"label":"Solo Parent","emoji":"💪","narrative":"Raising my daughter alone since she was three. It's exhausting, but watching her thrive makes every sacrifice worth it."},{"id":"working-class","layer":2,"label":"Blue-Collar Raised","emoji":"🔧"},{"id":"healthcare-worker","layer":3,"label":"In Healthcare","emoji":"🏥"},{"id":"pet-owner","layer":4,"label":"Pet Parent","emoji":"🐕"}]$lch$::jsonb
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-04$lch$
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, identities = EXCLUDED.identities;

UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || $lch${"display_name":"Robert Hayes"}$lch$::jsonb
WHERE email = (SELECT auth_email FROM mock_user_map WHERE mock_id = $lch$user-05$lch$);

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT u.id, $lch$Robert Hayes$lch$, $lch$/avatars/user-05.png$lch$, '{}', $lch$[{"id":"caregiver","layer":1,"label":"Family Caregiver","emoji":"🤲"},{"id":"veteran","layer":2,"label":"Veteran","emoji":"🎖️","narrative":"Did two deployments in Iraq. The transition back to civilian life wasn't easy, but the fire department gave me purpose again."},{"id":"first-responder","layer":3,"label":"First responder","emoji":"🚒"},{"id":"outdoor-recreation","layer":4,"label":"Trail & Peaks","emoji":"⛰️"}]$lch$::jsonb
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-05$lch$
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, identities = EXCLUDED.identities;

UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || $lch${"display_name":"Emily Nguyen"}$lch$::jsonb
WHERE email = (SELECT auth_email FROM mock_user_map WHERE mock_id = $lch$user-06$lch$);

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT u.id, $lch$Emily Nguyen$lch$, $lch$/avatars/user-06.png$lch$, '{}', $lch$[{"id":"mother","layer":1,"label":"Mother","emoji":"👩‍👧"},{"id":"first-gen-college","layer":2,"label":"First-Gen College","emoji":"🎓","narrative":"First person in my family to go to college. My parents worked three jobs between them to help me through state school."},{"id":"educator","layer":3,"label":"Educator","emoji":"📚"},{"id":"outdoor-recreation","layer":4,"label":"Trail & Peaks","emoji":"⛰️"}]$lch$::jsonb
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-06$lch$
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, identities = EXCLUDED.identities;

UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || $lch${"display_name":"Carlos Ramirez"}$lch$::jsonb
WHERE email = (SELECT auth_email FROM mock_user_map WHERE mock_id = $lch$user-07$lch$);

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT u.id, $lch$Carlos Ramirez$lch$, $lch$/avatars/user-07.png$lch$, '{}', $lch$[{"id":"father","layer":1,"label":"Father","emoji":"👨‍👧‍👦"},{"id":"immigrant-child","layer":2,"label":"Immigrant Roots","emoji":"🌉","narrative":"My parents crossed the border with nothing. I grew up translating at doctor's offices and parent-teacher conferences."},{"id":"first-gen-college","layer":2,"label":"First-Gen College","emoji":"🎓","narrative":"First in my family to graduate college. Mom and Dad worked cleaning jobs so I could finish undergrad — $52,000 in loans, three part-time jobs junior year. Every scholarship deadline was a family emergency."},{"id":"volunteer","layer":3,"label":"Giving Back","emoji":"🤝"},{"id":"cooking","layer":4,"label":"Home Chef","emoji":"🍳"},{"id":"faith-community","layer":4,"label":"Person of Faith","emoji":"⛪"}]$lch$::jsonb
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-07$lch$
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, identities = EXCLUDED.identities;

UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || $lch${"display_name":"Karen Mitchell"}$lch$::jsonb
WHERE email = (SELECT auth_email FROM mock_user_map WHERE mock_id = $lch$user-08$lch$);

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT u.id, $lch$Karen Mitchell$lch$, $lch$/avatars/user-08.png$lch$, '{}', $lch$[{"id":"grandparent","layer":1,"label":"Raising the Next Gen","emoji":"👵","narrative":"Watching my grandkids grow up reminds me how fast time goes. I try to pass down the values my parents taught me on the farm."},{"id":"small-town","layer":2,"label":"Country Raised","emoji":"🏡"},{"id":"volunteer","layer":3,"label":"Giving Back","emoji":"🤝"}]$lch$::jsonb
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-08$lch$
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, identities = EXCLUDED.identities;

UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || $lch${"display_name":"David Park"}$lch$::jsonb
WHERE email = (SELECT auth_email FROM mock_user_map WHERE mock_id = $lch$user-09$lch$);

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT u.id, $lch$David Park$lch$, $lch$/avatars/user-13.png$lch$, '{}', $lch$[{"id":"lost-loved-one","layer":1,"label":"Carrying a Loss","emoji":"🕊️","narrative":"Lost my wife to cancer two years ago. Some days are harder than others, but our dog keeps me grounded."},{"id":"chronic-illness","layer":2,"label":"Chronic Fighter","emoji":"💪"},{"id":"healthcare-worker","layer":3,"label":"In Healthcare","emoji":"🏥"},{"id":"pet-owner","layer":4,"label":"Pet Parent","emoji":"🐕"}]$lch$::jsonb
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-09$lch$
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, identities = EXCLUDED.identities;

UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || $lch${"display_name":"Lisa Johnson"}$lch$::jsonb
WHERE email = (SELECT auth_email FROM mock_user_map WHERE mock_id = $lch$user-10$lch$);

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT u.id, $lch$Lisa Johnson$lch$, $lch$/avatars/user-10.png$lch$, '{}', $lch$[{"id":"military-family","layer":1,"label":"Military Family","emoji":"🇺🇸"},{"id":"experienced-poverty","layer":2,"label":"Self-Made","emoji":"💪"},{"id":"small-business-owner","layer":3,"label":"Small Biz Owner","emoji":"🏪"},{"id":"hunting-fishing","layer":4,"label":"Hunter & Angler","emoji":"🎣","narrative":"My grandmother taught me to fish on Lake Superior. I take my kids there every summer."}]$lch$::jsonb
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-10$lch$
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, identities = EXCLUDED.identities;

UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || $lch${"display_name":"Tom Bradley"}$lch$::jsonb
WHERE email = (SELECT auth_email FROM mock_user_map WHERE mock_id = $lch$user-11$lch$);

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT u.id, $lch$Tom Bradley$lch$, $lch$/avatars/user-11.png$lch$, '{}', $lch$[{"id":"father","layer":1,"label":"Father","emoji":"👨‍👧‍👦"},{"id":"small-town","layer":2,"label":"Country Raised","emoji":"🏡"},{"id":"farmer","layer":3,"label":"Land & Livestock","emoji":"🌾","narrative":"Fourth-generation rancher. The land's been in my family since 1892. Some city folks don't get it, but this is who we are."},{"id":"hunting-fishing","layer":4,"label":"Hunter & Angler","emoji":"🎣"},{"id":"faith-community","layer":4,"label":"Person of Faith","emoji":"⛪"}]$lch$::jsonb
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-11$lch$
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, identities = EXCLUDED.identities;

UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || $lch${"display_name":"Rachel Kim"}$lch$::jsonb
WHERE email = (SELECT auth_email FROM mock_user_map WHERE mock_id = $lch$user-12$lch$);

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT u.id, $lch$Rachel Kim$lch$, $lch$/avatars/user-12.png$lch$, '{}', $lch$[{"id":"mother","layer":1,"label":"Mother","emoji":"👩‍👧"},{"id":"first-gen-college","layer":2,"label":"First-Gen College","emoji":"🎓"},{"id":"healthcare-worker","layer":3,"label":"In Healthcare","emoji":"🏥","narrative":"ER nurse for 11 years. I've held the hands of strangers on their worst days."},{"id":"cooking","layer":4,"label":"Cooking","emoji":"🍳"}]$lch$::jsonb
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-12$lch$
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, identities = EXCLUDED.identities;

UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || $lch${"display_name":"Jake Miller"}$lch$::jsonb
WHERE email = (SELECT auth_email FROM mock_user_map WHERE mock_id = $lch$user-13$lch$);

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT u.id, $lch$Jake Miller$lch$, $lch$/avatars/user-01.png$lch$, '{}', $lch$[{"id":"first-gen-college","layer":2,"label":"First-Gen College","emoji":"🎓","narrative":"Grew up in a coal town in West Virginia, twenty minutes from where the mine closed in the '90s. Mom worked two jobs — grocery cashier by day, home aide at night — so I could finish college. First in my family with a bachelor's. $60,000 in loans, still paying."},{"id":"small-town","layer":2,"label":"Small-Town Roots","emoji":"🏘️"},{"id":"father","layer":1,"label":"Father","emoji":"👨‍👧‍👦"},{"id":"faith-community","layer":4,"label":"Person of Faith","emoji":"⛪"}]$lch$::jsonb
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-13$lch$
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, identities = EXCLUDED.identities;

-- ---------- Comments (76) ----------
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_001$lch$, u.id, $lch$I've owned firearms my entire adult life and taught both my kids to handle them safely. The problem isn't responsible gun owners — it's that we keep having this same debate while ignoring the real gaps in mental health support and enforcement.$lch$, $lch$2026-03-07T08:15:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-01$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_001$lch$, u.id, $lch$I'm a father too, and last week I had to explain active shooter drills to my 7-year-old. No parent should have to rehearse what to do when someone starts shooting at school. At some point, 'thoughts and prayers' isn't enough — we need action.$lch$, $lch$2026-03-07T08:45:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-07$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_001$lch$, u.id, $lch$I've been on the other end of these calls. You never forget the sound, the chaos, the families arriving at the scene. I carried a rifle overseas for this country, and I still believe some weapons have no place on our streets.$lch$, $lch$2026-03-07T09:10:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-05$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_001$lch$, u.id, $lch$Three GSW patients came through my ER last month alone, and two of them were under 20. I don't have a political opinion on this anymore — I just have a body count that keeps going up.$lch$, $lch$2026-03-07T09:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-12$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_002$lch$, u.id, $lch$I live in rural Maryland. Out here, a firearm isn't a political statement — it's how I protect my livestock from coyotes. Blanket bans on carrying in 'public places' ignore that a county road isn't the same as a shopping mall.$lch$, $lch$2026-03-07T07:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-03$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_002$lch$, u.id, $lch$As a teacher, I think about school safety every single day. My students deserve to learn without fear. I'm glad courts are upholding protections for schools and hospitals — these should be spaces where everyone feels safe.$lch$, $lch$2026-03-07T08:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-06$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_002$lch$, u.id, $lch$My kids go to school in a small town. I hunt every season. And honestly? I'm fine with keeping guns out of schools and hospitals. That's not tyranny — that's common sense. We can protect both rights and our kids.$lch$, $lch$2026-03-07T08:20:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-11$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_003$lch$, u.id, $lch$About time. I'm a woman who carries, and I shouldn't need bureaucratic permission to protect myself. Growing up poor taught me nobody's coming to save you — you have to save yourself.$lch$, $lch$2026-03-07T06:20:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-10$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_003$lch$, u.id, $lch$I see gun violence patients in the ER every week. More guns in public spaces means more patients on my table — that's not an opinion, it's eleven years of data from my own shift logs.$lch$, $lch$2026-03-07T06:55:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-12$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_003$lch$, u.id, $lch$I lost my brother to a shooting five years ago. Every time a court makes it easier to carry, I relive that day. I know this is about rights. But rights didn't bring him back.$lch$, $lch$2026-03-07T07:10:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-09$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_004$lch$, u.id, $lch$I voted for him. I own guns. And I can't figure out what he actually believes about the Second Amendment. If even our own side can't get a straight answer, what are we even fighting for?$lch$, $lch$2026-03-07T05:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-11$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_004$lch$, u.id, $lch$The inconsistency is the point. This was never about principles for him — it's about whatever gets applause that day. Gun policy deserves serious, consistent leadership.$lch$, $lch$2026-03-07T06:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-02$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_004$lch$, u.id, $lch$I'm a veteran and a gun owner, and I'm tired of politicians using the Second Amendment as a campaign prop. Both sides do it. We need people who'll actually sit down and solve problems.$lch$, $lch$2026-03-07T06:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-01$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_005$lch$, u.id, $lch$I depend on medical marijuana for chronic pain. Forcing me to choose between pain management and self-defense is cruel. Constitutional rights shouldn't come with a prescription check.$lch$, $lch$2026-03-07T05:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-09$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_005$lch$, u.id, $lch$This case is more nuanced than people think. You can support responsible gun ownership AND medical freedom. Why are we forcing people to pick one right over another?$lch$, $lch$2026-03-07T06:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-07$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_005$lch$, u.id, $lch$As an educator, I teach my students that the Constitution is a living document. Cases like this show exactly why — 1968 lawmakers never imagined legal marijuana states.$lch$, $lch$2026-03-07T06:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-06$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_006$lch$, u.id, $lch$Ghost guns are a real issue, but the ATF has been overreaching for years. Rolling back blanket regulations and replacing them with targeted enforcement makes more sense for rural communities like mine.$lch$, $lch$2026-03-07T04:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-03$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_006$lch$, u.id, $lch$I'm a single mother in a city where gun violence is a daily reality. Untraceable ghost guns terrify me. My kid deserves to play outside without me wondering if today's the day.$lch$, $lch$2026-03-07T05:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-04$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_006$lch$, u.id, $lch$As a first responder, I've seen what ghost guns do to investigations. When we can't trace a weapon, cases go cold and families never get answers. Some regulations exist for good reason.$lch$, $lch$2026-03-07T05:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-05$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_007$lch$, u.id, $lch$Welcome to the club. Gun rights have never been partisan — they're human rights. Glad more people on the left are realizing that protecting yourself isn't a conservative value.$lch$, $lch$2026-03-07T03:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-10$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_007$lch$, u.id, $lch$Never thought I'd consider owning a gun. But when federal agents shoot unarmed protestors, what choice do we have? This isn't about politics anymore — it's about survival.$lch$, $lch$2026-03-07T04:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-07$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_007$lch$, u.id, $lch$I've lived long enough to see this cycle repeat. More fear, more guns, more violence, more fear. From either side, more guns isn't the answer. We need to break the cycle, not arm both sides of it.$lch$, $lch$2026-03-07T04:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-08$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_008$lch$, u.id, $lch$Second Amendment rights aren't negotiable — not for a Democrat, not for a Republican, not for anyone. If our own guy won't stand firm, we'll find someone who will.$lch$, $lch$2026-03-07T02:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-11$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_008$lch$, u.id, $lch$Maybe when even the NRA pushes back against a Republican president, it's time to admit this issue is more complicated than 'us vs. them.' We're all just parents trying to keep our kids safe.$lch$, $lch$2026-03-07T03:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-02$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_gun_008$lch$, u.id, $lch$I'm a veteran, a father, and a gun owner who's increasingly frustrated with both sides treating this like a football game. Real people are dying while politicians score points.$lch$, $lch$2026-03-07T03:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-01$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_001$lch$, u.id, $lch$As a healthcare worker, I've seen what happens when people can't access safe medical care. Back-alley alternatives don't stop abortions — they kill women. This ruling saves lives.$lch$, $lch$2026-03-07T09:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-04$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_001$lch$, u.id, $lch$I believe life begins at conception. My faith tells me that, and so does my experience watching my own children grow. I respect the court's process, but I think they got this one wrong.$lch$, $lch$2026-03-07T09:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-03$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_001$lch$, u.id, $lch$I raised my grandchildren because their mother couldn't care for them. These decisions are never simple. Compassion should come before politics — from any direction.$lch$, $lch$2026-03-07T10:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-08$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_002$lch$, u.id, $lch$I'm a nurse, and I've watched patients drive four hours to reach our clinic because everything closer has shut down. Access isn't a political talking point — it's a healthcare emergency.$lch$, $lch$2026-03-07T08:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-12$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_002$lch$, u.id, $lch$Fewer clinics means more women making desperate decisions. I'm pro-life, but I'm also a father. I'd want my daughter to have safe options if she ever faced that situation.$lch$, $lch$2026-03-07T09:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-11$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_002$lch$, u.id, $lch$Whatever your stance, women deserve access to accurate information and safe medical care. Closing clinics doesn't change minds — it just removes options for the most vulnerable.$lch$, $lch$2026-03-07T09:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-06$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_003$lch$, u.id, $lch$I served this country and nearly lost my life doing it. Veterans earned full healthcare access — that includes reproductive care. Politicians who never wore the uniform shouldn't be making these calls for us.$lch$, $lch$2026-03-07T05:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-05$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_003$lch$, u.id, $lch$I'm a veteran too, and I believe in protecting life at every stage. The VA should reflect that. This isn't about taking away healthcare — it's about what kind of procedures taxpayers should fund.$lch$, $lch$2026-03-07T05:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-01$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_003$lch$, u.id, $lch$As a military family, we've always had our healthcare decided by bureaucrats. This is just the latest example. We deserve better than being political footballs.$lch$, $lch$2026-03-07T06:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-10$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_004$lch$, u.id, $lch$Ballot measures give voters a direct voice. My mother's generation fought for these rights. If we lose them because people stay home on election day, that's on all of us.$lch$, $lch$2026-03-07T04:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-02$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_004$lch$, u.id, $lch$Voters in conservative states will show up to protect life — don't underestimate us. My community has deep convictions and we vote on them.$lch$, $lch$2026-03-07T05:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-03$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_004$lch$, u.id, $lch$As a person of faith, I genuinely struggle with this issue. I believe in the sanctity of life AND in a woman's dignity. I wish our political system allowed for that kind of nuance.$lch$, $lch$2026-03-07T05:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-07$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_005$lch$, u.id, $lch$This is exactly what I try to teach my students — look at the data, not just the loudest voices. When 63% of Americans want abortion legal in most cases, laws banning it completely don't represent the people.$lch$, $lch$2026-03-07T04:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-06$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_005$lch$, u.id, $lch$In my small town, opinions on this are far more varied than outsiders assume. Not everyone at church agrees, and not everyone at the diner disagrees. Real life isn't cable news.$lch$, $lch$2026-03-07T04:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-11$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_005$lch$, u.id, $lch$As a healthcare worker, I've learned that policy works best when it follows evidence, not emotion. This analysis shows we're doing neither.$lch$, $lch$2026-03-07T05:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-09$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_006$lch$, u.id, $lch$Shield laws exist because patients were being criminalized for seeking legal care. As a healthcare worker, I've seen the fear in patients' eyes. These protections are literally saving lives.$lch$, $lch$2026-03-07T03:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-04$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_006$lch$, u.id, $lch$I'm pro-life and I don't like these shield laws. But I also don't want the government tracking which state my daughter drives to for medical care. Privacy matters regardless of your politics.$lch$, $lch$2026-03-07T04:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-11$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_006$lch$, u.id, $lch$I've seen families torn apart by both unwanted pregnancies and by abortions. There's pain on every side of this. I wish we could argue with more compassion.$lch$, $lch$2026-03-07T04:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-08$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_007$lch$, u.id, $lch$I served overseas. I saw how American aid saves lives in places with nothing. Cutting healthcare funding to score political points back home is wrong, regardless of where you stand on abortion.$lch$, $lch$2026-03-07T03:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-01$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_007$lch$, u.id, $lch$My parents came here with nothing and received help from aid organizations. Cutting $30 billion in aid doesn't just affect policy — it affects real mothers and children overseas who have no voice.$lch$, $lch$2026-03-07T03:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-02$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_007$lch$, u.id, $lch$Foreign aid should support basic healthcare everywhere. Tying billions in humanitarian assistance to a single domestic political issue punishes the world's poorest people.$lch$, $lch$2026-03-07T04:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-07$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_008$lch$, u.id, $lch$Missouri voters already chose reproductive freedom in 2024. Putting it back on the ballot a year later is an insult to democracy. The people spoke — listen.$lch$, $lch$2026-03-07T02:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-12$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_008$lch$, u.id, $lch$The 2024 measure was confusingly worded. This new amendment is clearer about what's actually being decided. People deserve to vote on language they can understand.$lch$, $lch$2026-03-07T03:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-10$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_abortion_008$lch$, u.id, $lch$I've raised children who weren't mine because life is complicated. I've also buried friends who died from unsafe procedures decades ago. Both things are true, and both deserve respect.$lch$, $lch$2026-03-07T03:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-08$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_001$lch$, u.id, $lch$I'm a farmer. I see the weather changing with my own eyes — drought, floods, heat waves. But repealing regulations without replacing them with anything isn't a climate policy. It's just politics.$lch$, $lch$2026-03-07T08:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-11$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_001$lch$, u.id, $lch$I have a respiratory condition. Air quality regulations aren't abstract policy for me — they're the difference between a good day and an ER visit. Repealing the endangerment finding puts lives like mine at risk.$lch$, $lch$2026-03-07T08:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-09$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_001$lch$, u.id, $lch$Repealing the scientific basis for regulation doesn't change the science. It just removes our ability to respond to it. My students will inherit these decisions.$lch$, $lch$2026-03-07T09:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-02$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_002$lch$, u.id, $lch$Regulations cost money, and those costs get passed straight to families like mine. I care about clean air, but I also need to feed my kids. Not everyone can afford to be an environmentalist.$lch$, $lch$2026-03-07T07:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-03$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_002$lch$, u.id, $lch$I treat children with asthma worsened by pollution in my ER every week. The health costs of pollution are real — I see them in tiny lungs struggling to breathe. Ignoring those costs doesn't make them disappear.$lch$, $lch$2026-03-07T07:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-04$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_002$lch$, u.id, $lch$I run a small business and I worry about regulation costs too. But I also grew up next to a factory that poisoned our water. There's got to be a middle ground between no rules and overreach.$lch$, $lch$2026-03-07T08:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-10$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_003$lch$, u.id, $lch$Courts shouldn't be making energy policy — that's Congress's job. I respect the legal precedent, but 19 years later we still don't have legislation. That's the real failure.$lch$, $lch$2026-03-07T06:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-01$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_003$lch$, u.id, $lch$The science was clear in 2007 and it's only gotten clearer since. At some point we have to stop debating whether the problem exists and start debating solutions.$lch$, $lch$2026-03-07T06:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-06$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_003$lch$, u.id, $lch$As a first responder, I've seen wildfire devastation that would've been unthinkable 20 years ago. I don't care who regulates it — courts, Congress, whoever — just do something before more communities burn.$lch$, $lch$2026-03-07T07:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-05$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_004$lch$, u.id, $lch$Clean energy makes practical sense for ranchers like me — lower costs, energy independence, less reliance on volatile markets. You don't need to believe in climate models to see the practical benefits.$lch$, $lch$2026-03-07T04:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-03$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_004$lch$, u.id, $lch$The shift from ideology to pragmatism is encouraging. Energy security benefits everyone regardless of political affiliation. Maybe this is where we finally find common ground.$lch$, $lch$2026-03-07T04:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-06$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_004$lch$, u.id, $lch$Net zero was always unrealistic for farming communities — you can't electrify a combine harvester in 2035. But solar on the barn? Wind turbines leasing my back forty? That's real money in my pocket.$lch$, $lch$2026-03-07T05:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-11$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_005$lch$, u.id, $lch$86 GW of new capacity is incredible. The market is speaking — renewables are just good business now. As a small business owner, I follow the money, and the money says clean energy wins.$lch$, $lch$2026-03-07T03:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-01$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_005$lch$, u.id, $lch$My small business switched to solar last year. Cut our energy costs by 40%. This isn't about being liberal or conservative — it's about the bottom line.$lch$, $lch$2026-03-07T03:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-10$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_005$lch$, u.id, $lch$Sounds great on paper, but rural areas need reliable baseload power. Solar doesn't work when it's January in Montana and the sun sets at 4 PM. We need all-of-the-above, not one-size-fits-all.$lch$, $lch$2026-03-07T04:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-11$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_006$lch$, u.id, $lch$The EPA has been overreaching for years, especially on small farmers. Streamlining regulations isn't anti-environment — it's pro–common sense. Let us farm without a federal permission slip.$lch$, $lch$2026-03-07T02:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-03$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_006$lch$, u.id, $lch$Clean air and clean water are moral issues, not political ones. As a person of faith, I believe we're stewards of this earth. Gutting protections isn't deregulation — it's abandonment.$lch$, $lch$2026-03-07T03:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-07$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_006$lch$, u.id, $lch$My grandkids need clean air. But my neighbors need their jobs at the plant. When I hear 'deregulation,' I think of both. I wish more politicians did too.$lch$, $lch$2026-03-07T03:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-08$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_007$lch$, u.id, $lch$Elected officials should make these decisions, not unelected bureaucrats. If people want climate policy, vote for it. That's how democracy works.$lch$, $lch$2026-03-07T02:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-11$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_007$lch$, u.id, $lch$Science isn't partisan. We don't vote on gravity and we shouldn't vote on whether CO2 traps heat. Evidence-based policy shouldn't depend on which party wins an election.$lch$, $lch$2026-03-07T02:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-02$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_007$lch$, u.id, $lch$I've seen both economic hardship in dying factory towns and environmental disaster in wildfire zones. The people arguing loudest on both sides have usually experienced neither.$lch$, $lch$2026-03-07T03:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-05$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_008$lch$, u.id, $lch$I treat heat exhaustion patients every summer, and the numbers are getting worse every year. This isn't a distant future problem — it's happening in my ER right now, and the patients are getting younger.$lch$, $lch$2026-03-07T02:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-04$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_008$lch$, u.id, $lch$We've lost crops to extreme heat three of the last five summers. I don't need a scientist to tell me something's changing — I can see it from my tractor. Whatever we call it, we need to adapt.$lch$, $lch$2026-03-07T02:30:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-11$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_climate_008$lch$, u.id, $lch$My grandchildren can't play outside on the hottest summer days anymore. That wasn't the case when I was raising my own kids. Something has changed, and pretending otherwise won't protect them.$lch$, $lch$2026-03-07T03:00:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-08$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_immigration_001$lch$, u.id, $lch$My parents crossed the border with nothing in 1992. They cleaned offices at night and translated for me by day. The families in this story are the families I grew up next to — the parents picked up at the meatpacking plant could have been mine. When we treat people who built lives here for a decade as expendable, we are saying something about who counts as American and who doesn't.$lch$, $lch$2026-03-07T09:40:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-07$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_immigration_001$lch$, u.id, $lch$Whatever your view on immigration policy, leaving an autistic 11-year-old in foster care because we picked up her father at work is not enforcement — it's cruelty disguised as procedure. There has to be a way to take immigration law seriously without orphaning U.S.-citizen children to do it.$lch$, $lch$2026-03-07T09:55:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-02$lch$;
INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT $lch$rp_immigration_001$lch$, u.id, $lch$I read this and I think of my mom. She worked two jobs to put me through undergrad — grocery cashier by day, home aide at night. Nobody offered her a shortcut when the mine shut and the checks stopped. If the process doesn't apply the same way to everyone, it doesn't mean anything. I have sympathy for the kids in this story. But rules only hold when they hold for everyone.$lch$, $lch$2026-03-07T09:20:00Z$lch$::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = $lch$user-13$lch$;

COMMIT;

-- ---------- Verify: expect 13 / 76 ----------
SELECT 'profiles (with identities)' AS table, COUNT(*) AS rows
  FROM public.profiles WHERE jsonb_array_length(identities) > 0
UNION ALL SELECT 'comments', COUNT(*) FROM public.comments;
