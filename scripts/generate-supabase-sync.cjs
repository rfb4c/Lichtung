#!/usr/bin/env node

/**
 * Generate the SQL that makes Supabase serve exactly the demo's static data.
 *
 * src/data/app-data.json is the source of truth; these scripts are how the
 * Supabase-backed mode catches up to it.
 *
 * Usage: node scripts/generate-supabase-sync.cjs
 *
 * Writes two files:
 *   sync-demo-data.sql            topics + polling data + reports.
 *   sync-demo-users-comments.sql  profiles + comments.
 *
 * Live schema, as of 2026-08-15: `profiles.id` is a FK into `auth.users`, and
 * `comments.user_id` is a FK into `profiles.id`. So every demo user needs an
 * auth account behind it — see AUTH_EMAIL below.
 */

const fs = require('fs');
const path = require('path');

const appData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/app-data.json'), 'utf-8')
);

/**
 * mock user id -> the Supabase auth account whose uuid the profile row uses.
 * Confirmed present in the live project on 2026-08-15.
 *
 * app-data.json carries its own `email` field, but that one is the JSON-mode demo
 * login (see AuthContext) and is unrelated to these addresses.
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
  // Added 2026-08-15 for the Path C reversal viewer identity, after the
  // original 12 accounts already existed.
  'user-13': 'jake.miller@example.com',
};

// Dollar-quoting: the content is full of apostrophes, em-dashes and emoji, and ''
// escaping across ~100 strings is exactly where a generator like this breaks.
const q = (v) => (v === null || v === undefined ? 'NULL' : `$lch$${v}$lch$`);
const num = (v) => (v === null || v === undefined ? 'NULL' : String(v));
const bool = (v) => (v ? 'true' : 'false');
const arr = (xs) => `ARRAY[${xs.map(q).join(', ')}]::text[]`;
const intArr = (xs) => `ARRAY[${xs.map(num).join(', ')}]::integer[]`;
const jsonb = (v) => `${q(JSON.stringify(v ?? []))}::jsonb`;
const idList = (xs) => xs.map(q).join(', ');

const { topics, pollingData, reports, mockUsers, mockComments } = appData;
const pollIds = pollingData.map((p) => p.id);
const reportIds = reports.map((r) => r.id);
const pollIdSet = new Set(pollIds);

const write = (file, lines) =>
  fs.writeFileSync(path.join(__dirname, file), lines.join('\n') + '\n', 'utf-8');

// ── 1. Content: topics, polling data, reports ────────────────────────────────

const content = [];
const c = (s = '') => content.push(s);

c(`-- ========================================
-- Sync Supabase content to src/data/app-data.json
--
-- GENERATED FILE — do not hand-edit.
-- Regenerate: node scripts/generate-supabase-sync.cjs
--
-- ${topics.length} topics · ${pollingData.length} polls · ${reports.length} reports
--
-- No prerequisites. Paste into Dashboard -> SQL Editor and run.
-- Runs in one transaction and is safe to re-run: anything not in the demo data
-- is deleted, everything in it is inserted or overwritten.
-- ========================================

BEGIN;

-- Columns the demo needs, added only if the table lacks them
ALTER TABLE public.polling_data ADD COLUMN IF NOT EXISTS subtopic_id text;
ALTER TABLE public.reports      ADD COLUMN IF NOT EXISTS polling_data_id text;
ALTER TABLE public.reports      ADD COLUMN IF NOT EXISTS counter_stereotypical boolean DEFAULT false;
ALTER TABLE public.reports      ADD COLUMN IF NOT EXISTS engagement_score numeric DEFAULT 0.5;
ALTER TABLE public.reports      ADD COLUMN IF NOT EXISTS url text;

-- Path A dropped hostility scoring; these columns are no longer in app-data.json
ALTER TABLE public.reports      DROP COLUMN IF EXISTS hostility_score;
ALTER TABLE public.reports      DROP COLUMN IF EXISTS content_type;

-- Clear in FK order: comments -> reports -> polling_data.
-- Only comments left orphaned by the report deletion below are removed.
DELETE FROM public.comments     WHERE report_id NOT IN (${idList(reportIds)});
DELETE FROM public.reports      WHERE id        NOT IN (${idList(reportIds)});
DELETE FROM public.polling_data WHERE id        NOT IN (${idList(pollIds)});

-- Legacy NOT NULL column on reports, kept satisfied with one dummy row
INSERT INTO public.events (id, title, supportive, neutral, opposed)
VALUES ('ev_default', 'Default Event', 33, 34, 33)
ON CONFLICT (id) DO NOTHING;

-- ---------- Topics (${topics.length}) ----------`);

for (const t of topics) {
  c(`INSERT INTO public.topics (id, name, scope, tag_keywords) VALUES
  (${q(t.id)}, ${q(t.name)}, ${q(t.scope)}, ${arr(t.tagKeywords)})
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, scope = EXCLUDED.scope, tag_keywords = EXCLUDED.tag_keywords;`);
}

c(`
-- ---------- Polling data (${pollingData.length}) ----------`);

for (const p of pollingData) {
  c(`INSERT INTO public.polling_data (id, topic_id, subtopic_id, source, survey_year, geographic_scope, scale_labels, distribution, bridging_text) VALUES
  (${q(p.id)}, ${q(p.topicId)}, ${q(p.subtopicId ?? null)}, ${q(p.source)}, ${num(p.surveyYear)}, ${q(p.geographicScope)},
   ${arr(p.scaleLabels)}, ${intArr(p.distribution)}, ${q(p.bridgingText)})
ON CONFLICT (id) DO UPDATE SET
  topic_id = EXCLUDED.topic_id, subtopic_id = EXCLUDED.subtopic_id, source = EXCLUDED.source,
  survey_year = EXCLUDED.survey_year, geographic_scope = EXCLUDED.geographic_scope,
  scale_labels = EXCLUDED.scale_labels, distribution = EXCLUDED.distribution,
  bridging_text = EXCLUDED.bridging_text;
`);
}

c(`-- ---------- Reports (${reports.length}) ----------`);

for (const r of reports) {
  const pollRef = r.pollingDataId && pollIdSet.has(r.pollingDataId) ? q(r.pollingDataId) : 'NULL';
  c(`INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  (${q(r.id)}, 'ev_default', ${q(r.title)}, ${q(r.summary)}, ${q(r.source)}, 'neutral',
   ${q(r.url ?? null)}, ${q(r.imageUrl ?? null)}, ${q(r.publishedAt ?? null)}, ${q(r.topicId ?? null)},
   ${pollRef}, ${bool(r.counterStereotypical)}, ${num(r.engagementScore ?? 0.5)})
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;
`);
}

c(`COMMIT;

-- ---------- Verify: expect ${topics.length} / ${pollingData.length} / ${reports.length} ----------
SELECT 'topics' AS table, COUNT(*) AS rows FROM public.topics
UNION ALL SELECT 'polling_data', COUNT(*) FROM public.polling_data
UNION ALL SELECT 'reports', COUNT(*) FROM public.reports;`);

write('sync-demo-data.sql', content);

// ── 2. Optional: profiles + comments (needs auth accounts) ───────────────────

const people = [];
const p = (s = '') => people.push(s);

const unmapped = mockUsers.filter((u) => !AUTH_EMAIL[u.id]);
if (unmapped.length) {
  throw new Error(`No auth email mapped for: ${unmapped.map((u) => u.id).join(', ')}`);
}

p(`-- ========================================
-- Sync mock profiles and comments to src/data/app-data.json
--
-- GENERATED FILE — do not hand-edit.
-- Regenerate: node scripts/generate-supabase-sync.cjs
--
-- ${mockUsers.length} profiles · ${mockComments.length} comments
--
-- Run sync-demo-data.sql first: comments reference reports.
--
-- Prerequisite: the ${mockUsers.length} auth accounts listed below must exist, because
-- profiles.id is a foreign key into auth.users. The script aborts before
-- writing anything if one is missing.
--
-- Runs in one transaction and is safe to re-run: every mock comment is deleted
-- and re-inserted, profiles are overwritten in place.
-- ========================================

BEGIN;

CREATE TEMP TABLE mock_user_map (mock_id text PRIMARY KEY, profile_id uuid NOT NULL) ON COMMIT DROP;

INSERT INTO mock_user_map (mock_id, profile_id)
SELECT v.mock_id, u.id
FROM (VALUES`);

p(
  mockUsers.map((u) => `  (${q(u.id)}, ${q(AUTH_EMAIL[u.id])})`).join(',\n') +
    `\n) AS v(mock_id, email)\nJOIN auth.users u ON u.email = v.email;`
);

p(`
-- Stop before touching anything if an expected auth account is missing
DO $$
DECLARE missing text;
BEGIN
  SELECT string_agg(v.email, ', ') INTO missing
  FROM (VALUES`);

p(
  mockUsers.map((u) => `    (${q(AUTH_EMAIL[u.id])})`).join(',\n') +
    `\n  ) AS v(email)
  LEFT JOIN auth.users u ON u.email = v.email
  WHERE u.id IS NULL;

  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'No auth account for: %. Create it in Dashboard -> Authentication -> Users, then re-run.', missing;
  END IF;
END $$;

DELETE FROM public.comments WHERE user_id IN (SELECT profile_id FROM mock_user_map);

-- ---------- Profiles (${mockUsers.length}) ----------`
);

for (const u of mockUsers) {
  p(`INSERT INTO public.profiles (id, display_name, avatar_url, interests, identities)
SELECT m.profile_id, ${q(u.displayName)}, ${q(u.avatarUrl ?? null)}, '{}', ${jsonb(u.identities)}
FROM mock_user_map m WHERE m.mock_id = ${q(u.id)}
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, identities = EXCLUDED.identities;
`);
}

p(`-- ---------- Comments (${mockComments.length}) ----------`);

for (const cm of mockComments) {
  p(`INSERT INTO public.comments (report_id, user_id, content, created_at)
SELECT ${q(cm.reportId)}, m.profile_id, ${q(cm.content)}, ${q(cm.createdAt)}::timestamptz
FROM mock_user_map m WHERE m.mock_id = ${q(cm.userId)};`);
}

p(`
COMMIT;

-- ---------- Verify: expect ${mockUsers.length} / ${mockComments.length} ----------
SELECT 'profiles (with identities)' AS table, COUNT(*) AS rows
  FROM public.profiles
  WHERE jsonb_typeof(identities) = 'array' AND jsonb_array_length(identities) > 0
UNION ALL SELECT 'comments', COUNT(*) FROM public.comments;`);

write('sync-demo-users-comments.sql', people);

console.log(`sync-demo-data.sql            ${topics.length} topics, ${pollingData.length} polls, ${reports.length} reports`);
console.log(`sync-demo-users-comments.sql  ${mockUsers.length} profiles, ${mockComments.length} comments`);
