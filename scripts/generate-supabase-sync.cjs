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
 * Both run without prerequisites. Verified against the live schema on 2026-08-15:
 * `profiles` carries no foreign key at all, and `comments.user_id` points at
 * `profiles.id` rather than `auth.users` — so demo profiles do not need auth
 * accounts behind them.
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
};

/**
 * mock user id -> fixed profile uuid, for demo users with no auth account.
 *
 * Jake Miller is the viewer identity in the Path C reversal and was added after
 * the original 12 accounts were created. `profiles` has no FK to `auth.users`,
 * so his profile just takes a fixed synthetic uuid — stable across re-runs, and
 * obviously not a real account at a glance.
 *
 * Only consequence: he cannot *log in* in Supabase mode. Create an auth account
 * and move him into AUTH_EMAIL if that is ever needed.
 */
const STANDALONE_PROFILE_ID = {
  'user-13': '00000000-0000-4000-8000-000000000013',
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
UNION ALL SELECT 'reports', COUNT(*) FROM public.reports;

-- Path A no longer uses hostility scoring. Drop the dead columns if you want:
-- ALTER TABLE public.reports DROP COLUMN IF EXISTS hostility_score;
-- ALTER TABLE public.reports DROP COLUMN IF EXISTS content_type;`);

write('sync-demo-data.sql', content);

// ── 2. Optional: profiles + comments (needs auth accounts) ───────────────────

const people = [];
const p = (s = '') => people.push(s);

const mappedByEmail = mockUsers.filter((u) => AUTH_EMAIL[u.id]);
const mappedStandalone = mockUsers.filter((u) => STANDALONE_PROFILE_ID[u.id]);
const unmapped = mockUsers.filter((u) => !AUTH_EMAIL[u.id] && !STANDALONE_PROFILE_ID[u.id]);
if (unmapped.length) {
  throw new Error(`No profile mapping for: ${unmapped.map((u) => u.id).join(', ')}`);
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
-- No prerequisites otherwise. ${mappedByEmail.length} profiles reuse the uuid of an
-- existing auth account; ${mappedStandalone.length} (${mappedStandalone.map((u) => u.displayName).join(', ')}) has no account and takes a
-- fixed synthetic uuid, which the profiles table allows: it carries no foreign key.
--
-- Runs in one transaction and is safe to re-run: every mock comment is deleted
-- and re-inserted, profiles are overwritten in place.
-- ========================================

BEGIN;

CREATE TEMP TABLE mock_user_map (mock_id text PRIMARY KEY, profile_id uuid NOT NULL) ON COMMIT DROP;

-- Profiles that ride on an existing auth account
INSERT INTO mock_user_map (mock_id, profile_id)
SELECT v.mock_id, u.id
FROM (VALUES`);

p(
  mappedByEmail.map((u) => `  (${q(u.id)}, ${q(AUTH_EMAIL[u.id])})`).join(',\n') +
    `\n) AS v(mock_id, email)\nJOIN auth.users u ON u.email = v.email;`
);

p(`
-- Profiles with no auth account behind them`);
p(
  `INSERT INTO mock_user_map (mock_id, profile_id) VALUES\n` +
    mappedStandalone
      .map((u) => `  (${q(u.id)}, ${q(STANDALONE_PROFILE_ID[u.id])}::uuid)`)
      .join(',\n') +
    ';'
);

p(`
-- Stop before touching anything if an expected auth account has gone missing
DO $$
DECLARE mapped int;
BEGIN
  SELECT COUNT(*) INTO mapped FROM mock_user_map;
  IF mapped <> ${mockUsers.length} THEN
    RAISE EXCEPTION 'Mapped % of ${mockUsers.length} demo users — an auth account listed in this script no longer exists. Check AUTH_EMAIL in scripts/generate-supabase-sync.cjs.', mapped;
  END IF;
END $$;

DELETE FROM public.comments WHERE user_id IN (SELECT profile_id FROM mock_user_map);

-- ---------- Profiles (${mockUsers.length}) ----------`);

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
