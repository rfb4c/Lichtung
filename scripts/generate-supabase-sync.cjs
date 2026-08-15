#!/usr/bin/env node

/**
 * Generate an idempotent SQL script that makes Supabase match src/data/app-data.json.
 *
 * The static JSON is the source of truth for the demo; this script exists so the
 * Supabase-backed mode serves exactly the same content.
 *
 * Usage: node scripts/generate-supabase-sync.cjs > scripts/sync-demo-data.sql
 */

const fs = require('fs');
const path = require('path');

const appData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/app-data.json'), 'utf-8')
);

/**
 * mock user id -> Supabase auth account email.
 *
 * app-data.json carries its own `email` field, but that one is the JSON-mode
 * demo login (see AuthContext) and is NOT the address the auth accounts were
 * created with. Edit the right-hand side if your Dashboard accounts differ;
 * the generated script aborts before writing anything if one is missing.
 */
const AUTH_EMAIL = {
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
  'user-13': 'jake.miller@example.com',
};

// Dollar-quoting: content holds apostrophes, em-dashes and emoji, and '' escaping
// across ~100 strings is exactly where a generator like this usually breaks.
const q = (v) => (v === null || v === undefined ? 'NULL' : `$lch$${v}$lch$`);
const num = (v) => (v === null || v === undefined ? 'NULL' : String(v));
const bool = (v) => (v ? 'true' : 'false');
const arr = (xs) => `ARRAY[${xs.map(q).join(', ')}]::text[]`;
const intArr = (xs) => `ARRAY[${xs.map(num).join(', ')}]::integer[]`;
const jsonb = (v) => `${q(JSON.stringify(v ?? []))}::jsonb`;

const { topics, pollingData, reports, mockUsers, mockComments } = appData;
const pollIds = new Set(pollingData.map((p) => p.id));

// Reports still carry pollingDataId values pointing at polls that were removed
// from the demo set. They are inert in JSON mode (lookup goes through topicId),
// but they would violate the FK on insert, so they are nulled here.
const dangling = reports.filter((r) => r.pollingDataId && !pollIds.has(r.pollingDataId));

const out = [];
const w = (s = '') => out.push(s);

w(`-- ========================================
-- Sync Supabase to src/data/app-data.json
--
-- GENERATED FILE — do not hand-edit.
-- Regenerate: node scripts/generate-supabase-sync.cjs > scripts/sync-demo-data.sql
--
-- Source data: ${topics.length} topics · ${pollingData.length} polls · ${reports.length} reports
--              ${mockUsers.length} mock users · ${mockComments.length} comments
--
-- Idempotent: safe to re-run. Runs in one transaction — either the whole sync
-- lands or nothing does.
--
-- Prerequisite: the ${mockUsers.length} auth accounts below must already exist
-- (Dashboard -> Authentication -> Users). The script aborts with the missing
-- addresses listed if any is absent.
-- ========================================

BEGIN;

-- ----------------------------------------
-- 0. Schema guards
-- ----------------------------------------
ALTER TABLE public.polling_data ADD COLUMN IF NOT EXISTS subtopic_id text;
ALTER TABLE public.reports      ADD COLUMN IF NOT EXISTS polling_data_id text;
ALTER TABLE public.reports      ADD COLUMN IF NOT EXISTS counter_stereotypical boolean DEFAULT false;
ALTER TABLE public.reports      ADD COLUMN IF NOT EXISTS engagement_score numeric DEFAULT 0.5;
ALTER TABLE public.reports      ADD COLUMN IF NOT EXISTS url text;

-- ----------------------------------------
-- 1. mock user id -> auth account
-- ----------------------------------------
CREATE TEMP TABLE mock_user_map (mock_id text PRIMARY KEY, auth_email text NOT NULL) ON COMMIT DROP;
INSERT INTO mock_user_map (mock_id, auth_email) VALUES`);

w(
  mockUsers
    .map((u) => `  (${q(u.id)}, ${q(AUTH_EMAIL[u.id] ?? `MISSING-MAPPING-${u.id}`)})`)
    .join(',\n') + ';'
);

w(`
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

-- ----------------------------------------
-- 2. Comments cleared first (FK: comments -> reports)
-- ----------------------------------------
DELETE FROM public.comments
WHERE user_id IN (SELECT u.id FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email);

-- ----------------------------------------
-- 3. Topics
-- ----------------------------------------`);

for (const t of topics) {
  w(`INSERT INTO public.topics (id, name, scope, tag_keywords) VALUES
  (${q(t.id)}, ${q(t.name)}, ${q(t.scope)}, ${arr(t.tagKeywords)})
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, scope = EXCLUDED.scope, tag_keywords = EXCLUDED.tag_keywords;`);
}

w(`
-- ----------------------------------------
-- 4. Polling data (${pollingData.length} kept; anything else removed)
-- ----------------------------------------
DELETE FROM public.polling_data WHERE id NOT IN (${[...pollIds].map(q).join(', ')});`);

for (const p of pollingData) {
  w(`
INSERT INTO public.polling_data (id, topic_id, subtopic_id, source, survey_year, geographic_scope, scale_labels, distribution, bridging_text) VALUES
  (${q(p.id)}, ${q(p.topicId)}, ${q(p.subtopicId ?? null)}, ${q(p.source)}, ${num(p.surveyYear)}, ${q(p.geographicScope)},
   ${arr(p.scaleLabels)}, ${intArr(p.distribution)}, ${q(p.bridgingText)})
ON CONFLICT (id) DO UPDATE SET
  topic_id = EXCLUDED.topic_id, subtopic_id = EXCLUDED.subtopic_id, source = EXCLUDED.source,
  survey_year = EXCLUDED.survey_year, geographic_scope = EXCLUDED.geographic_scope,
  scale_labels = EXCLUDED.scale_labels, distribution = EXCLUDED.distribution,
  bridging_text = EXCLUDED.bridging_text;`);
}

w(`
-- ----------------------------------------
-- 5. Reports (${reports.length})
--    event_id is a legacy NOT NULL column from the v0.1.0 schema.
--    ${dangling.length} report(s) referenced a poll that is no longer in the demo
--    set; polling_data_id is written as NULL for those.
-- ----------------------------------------
INSERT INTO public.events (id, title, supportive, neutral, opposed)
VALUES ('ev_default', 'Default Event', 33, 34, 33)
ON CONFLICT (id) DO NOTHING;

DELETE FROM public.reports WHERE id NOT IN (${reports.map((r) => q(r.id)).join(', ')});`);

for (const r of reports) {
  const pollRef = r.pollingDataId && pollIds.has(r.pollingDataId) ? q(r.pollingDataId) : 'NULL';
  w(`
INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  (${q(r.id)}, 'ev_default', ${q(r.title)}, ${q(r.summary)}, ${q(r.source)}, 'neutral',
   ${q(r.url ?? null)}, ${q(r.imageUrl ?? null)}, ${q(r.publishedAt ?? null)}, ${q(r.topicId ?? null)},
   ${pollRef}, ${bool(r.counterStereotypical)}, ${num(r.engagementScore ?? 0.5)})
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;`);
}

w(`
-- ----------------------------------------
-- 6. Profiles (${mockUsers.length}) — display name, avatar, Path C identities
-- ----------------------------------------`);

for (const u of mockUsers) {
  w(`
UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || ${q(JSON.stringify({ display_name: u.displayName }))}::jsonb
WHERE email = (SELECT auth_email FROM mock_user_map WHERE mock_id = ${q(u.id)});

INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT u.id, ${q(u.displayName)}, ${q(u.avatarUrl ?? null)}, '{}', ${jsonb(u.identities)}
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = ${q(u.id)}
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, identities = EXCLUDED.identities;`);
}

w(`
-- ----------------------------------------
-- 7. Comments (${mockComments.length})
-- ----------------------------------------`);

for (const c of mockComments) {
  w(`INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT ${q(c.reportId)}, u.id, ${q(c.content)}, ${q(c.createdAt)}::timestamptz
FROM auth.users u JOIN mock_user_map m ON m.auth_email = u.email
WHERE m.mock_id = ${q(c.userId)};`);
}

w(`
COMMIT;

-- ----------------------------------------
-- 8. Verify (expected: topics=${topics.length}, polls=${pollingData.length}, reports=${reports.length}, profiles=${mockUsers.length}, comments=${mockComments.length})
-- ----------------------------------------
SELECT 'topics' AS table, COUNT(*) AS rows FROM public.topics
UNION ALL SELECT 'polling_data', COUNT(*) FROM public.polling_data
UNION ALL SELECT 'reports', COUNT(*) FROM public.reports
UNION ALL SELECT 'reports (counter-stereotypical)', COUNT(*) FROM public.reports WHERE counter_stereotypical
UNION ALL SELECT 'profiles (with identities)', COUNT(*) FROM public.profiles WHERE jsonb_array_length(identities) > 0
UNION ALL SELECT 'comments', COUNT(*) FROM public.comments;

-- Optional cleanup, run only when you are sure nothing else reads these:
-- Path A no longer uses hostility scoring, so the columns are dead weight.
-- ALTER TABLE public.reports DROP COLUMN IF EXISTS hostility_score;
-- ALTER TABLE public.reports DROP COLUMN IF EXISTS content_type;`);

process.stdout.write(out.join('\n') + '\n');
