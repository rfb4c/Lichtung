-- ========================================
-- Sync Supabase to src/data/app-data.json
--
-- GENERATED FILE — do not hand-edit.
-- Regenerate: node scripts/generate-supabase-sync.cjs > scripts/sync-demo-data.sql
--
-- Source data: 4 topics · 2 polls · 28 reports
--              13 mock users · 76 comments
--
-- Idempotent: safe to re-run. Runs in one transaction — either the whole sync
-- lands or nothing does.
--
-- Prerequisite: the 13 auth accounts below must already exist
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
-- ----------------------------------------
INSERT INTO public.topics (id, name, scope, tag_keywords) VALUES
  ($lch$us-gun-control$lch$, $lch$Gun Control$lch$, $lch$us_domestic$lch$, ARRAY[$lch$gun$lch$, $lch$firearm$lch$, $lch$second amendment$lch$]::text[])
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, scope = EXCLUDED.scope, tag_keywords = EXCLUDED.tag_keywords;
INSERT INTO public.topics (id, name, scope, tag_keywords) VALUES
  ($lch$us-abortion$lch$, $lch$Abortion Rights$lch$, $lch$us_domestic$lch$, ARRAY[$lch$abortion$lch$, $lch$roe$lch$, $lch$reproductive$lch$, $lch$pro-choice$lch$, $lch$pro-life$lch$]::text[])
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, scope = EXCLUDED.scope, tag_keywords = EXCLUDED.tag_keywords;
INSERT INTO public.topics (id, name, scope, tag_keywords) VALUES
  ($lch$us-climate$lch$, $lch$Climate Policy$lch$, $lch$us_domestic$lch$, ARRAY[$lch$climate$lch$, $lch$carbon$lch$, $lch$renewable$lch$, $lch$environment$lch$]::text[])
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, scope = EXCLUDED.scope, tag_keywords = EXCLUDED.tag_keywords;
INSERT INTO public.topics (id, name, scope, tag_keywords) VALUES
  ($lch$us-immigration$lch$, $lch$Immigration Policy$lch$, $lch$us_domestic$lch$, ARRAY[$lch$immigration$lch$, $lch$ICE$lch$, $lch$deportation$lch$, $lch$border$lch$, $lch$undocumented$lch$, $lch$asylum$lch$]::text[])
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, scope = EXCLUDED.scope, tag_keywords = EXCLUDED.tag_keywords;

-- ----------------------------------------
-- 4. Polling data (2 kept; anything else removed)
-- ----------------------------------------
DELETE FROM public.polling_data WHERE id NOT IN ($lch$poll_abortion_legality_001$lch$, $lch$poll_climate_international_agreements_001$lch$);

INSERT INTO public.polling_data (id, topic_id, subtopic_id, source, survey_year, geographic_scope, scale_labels, distribution, bridging_text) VALUES
  ($lch$poll_abortion_legality_001$lch$, $lch$us-abortion$lch$, $lch$us-abortion-legality$lch$, $lch$Pew Research Center$lch$, 2024, $lch$US$lch$,
   ARRAY[$lch$Legal in all cases$lch$, $lch$Legal in most cases$lch$, $lch$Illegal in most cases$lch$, $lch$Illegal in all cases$lch$]::text[], ARRAY[25, 38, 28, 8]::integer[], $lch$According to an April 2024 Pew Research Center survey, the general public's stance on the legality of abortion across all circumstances is:$lch$)
ON CONFLICT (id) DO UPDATE SET
  topic_id = EXCLUDED.topic_id, subtopic_id = EXCLUDED.subtopic_id, source = EXCLUDED.source,
  survey_year = EXCLUDED.survey_year, geographic_scope = EXCLUDED.geographic_scope,
  scale_labels = EXCLUDED.scale_labels, distribution = EXCLUDED.distribution,
  bridging_text = EXCLUDED.bridging_text;

INSERT INTO public.polling_data (id, topic_id, subtopic_id, source, survey_year, geographic_scope, scale_labels, distribution, bridging_text) VALUES
  ($lch$poll_climate_international_agreements_001$lch$, $lch$us-climate$lch$, $lch$us-climate-international-agreements$lch$, $lch$Yale Program on Climate Change Communication$lch$, 2023, $lch$US$lch$,
   ARRAY[$lch$Strongly support$lch$, $lch$Somewhat support$lch$, $lch$Somewhat oppose$lch$, $lch$Strongly oppose$lch$]::text[], ARRAY[32, 36, 14, 18]::integer[], $lch$Amid polarized headlines on climate policy, a Fall 2023 Yale Program on Climate Change Communication survey shows where Americans actually stand on climate action:$lch$)
ON CONFLICT (id) DO UPDATE SET
  topic_id = EXCLUDED.topic_id, subtopic_id = EXCLUDED.subtopic_id, source = EXCLUDED.source,
  survey_year = EXCLUDED.survey_year, geographic_scope = EXCLUDED.geographic_scope,
  scale_labels = EXCLUDED.scale_labels, distribution = EXCLUDED.distribution,
  bridging_text = EXCLUDED.bridging_text;

-- ----------------------------------------
-- 5. Reports (28)
--    event_id is a legacy NOT NULL column from the v0.1.0 schema.
--    0 report(s) referenced a poll that is no longer in the demo
--    set; polling_data_id is written as NULL for those.
-- ----------------------------------------
INSERT INTO public.events (id, title, supportive, neutral, opposed)
VALUES ('ev_default', 'Default Event', 33, 34, 33)
ON CONFLICT (id) DO NOTHING;

DELETE FROM public.reports WHERE id NOT IN ($lch$rp_gun_001$lch$, $lch$rp_gun_002$lch$, $lch$rp_gun_003$lch$, $lch$rp_gun_004$lch$, $lch$rp_gun_005$lch$, $lch$rp_gun_006$lch$, $lch$rp_gun_007$lch$, $lch$rp_gun_008$lch$, $lch$rp_abortion_001$lch$, $lch$rp_abortion_002$lch$, $lch$rp_abortion_003$lch$, $lch$rp_abortion_004$lch$, $lch$rp_abortion_005$lch$, $lch$rp_abortion_006$lch$, $lch$rp_abortion_007$lch$, $lch$rp_abortion_008$lch$, $lch$rp_climate_001$lch$, $lch$rp_climate_002$lch$, $lch$rp_climate_003$lch$, $lch$rp_climate_004$lch$, $lch$rp_climate_005$lch$, $lch$rp_climate_006$lch$, $lch$rp_climate_007$lch$, $lch$rp_climate_008$lch$, $lch$rp_gun_010$lch$, $lch$rp_abortion_010$lch$, $lch$rp_climate_010$lch$, $lch$rp_immigration_001$lch$);

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_gun_001$lch$, 'ev_default', $lch$Austin bar shooting kills 3, injures 14 - FBI investigating terrorism$lch$, $lch$A mass shooting outside Buford's Backyard Beer Garden in downtown Austin killed three people and injured 14 others on March 1, 2026. The FBI is investigating the attack as potential terrorism after the gunman was found wearing clothing with Islamic references.$lch$, $lch$CBS Austin$lch$, 'neutral',
   $lch$https://cbsaustin.com/news/local/multiple-people-injured-in-mass-shooting-on-6th-st-austin-police-investigating$lch$, $lch$https://media.nbcdfw.com/2026/03/AP26060561690822.jpg?quality=85&strip=all$lch$, $lch$2h$lch$, $lch$us-gun-control$lch$,
   NULL, false, 0.9)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_gun_002$lch$, 'ev_default', $lch$Federal appeals court upholds Maryland gun control restrictions$lch$, $lch$A federal appeals court upheld Maryland's law banning guns in sensitive public places including schools, hospitals, parks and government buildings. The Fourth Circuit ruling said states can restrict firearms without violating the Supreme Court's recent Second Amendment decisions.$lch$, $lch$Maryland Matters$lch$, 'neutral',
   $lch$https://marylandmatters.org/2026/01/21/appeals-court-upholds-most-of-maryland-ban-on-weapons-in-schools-parks-other-public-places/$lch$, $lch$https://foxbaltimore.com/resources/media2/16x9/6000/986/0x313/90/9ede23ec-c9c5-4bc5-8658-fe6ed97ad0ac-GettyImages2211996655.jpg$lch$, $lch$4h$lch$, $lch$us-gun-control$lch$,
   NULL, false, 0.55)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_gun_003$lch$, 'ev_default', $lch$Federal court rules California's open carry ban unconstitutional$lch$, $lch$The 9th Circuit Court of Appeals struck down California's ban on openly carrying firearms in most counties, ruling 2-1 that it violates the Second Amendment. The decision affects 95% of California's population living in counties with over 200,000 residents.$lch$, $lch$CNN$lch$, 'neutral',
   $lch$https://www.cnn.com/2026/01/03/us/california-ban-openly-carrying-gun-unconstitutional-hnk$lch$, $lch$https://media-cldnry.s-nbcnews.com/image/upload/t_fit-560w,f_auto,q_auto:best/rockcms/2026-01/250102-open-carry-aa-640-182ab3.png$lch$, $lch$6h$lch$, $lch$us-gun-control$lch$,
   NULL, false, 0.65)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_gun_004$lch$, 'ev_default', $lch$Trump's inconsistent stance scrambles America's gun debate$lch$, $lch$President Trump broke with pro-gun groups by suggesting federal agents were justified in the Minneapolis shooting, saying the protester 'shouldn't have had a gun.' After NRA backlash, the administration reversed course, leaving both sides confused about the White House's gun policy.$lch$, $lch$CNN$lch$, 'neutral',
   $lch$https://www.cnn.com/2026/02/01/politics/gun-politics-trump-second-amendment$lch$, $lch$https://www.motherjones.com/wp-content/uploads/trump-rifle2000.jpg?w=990$lch$, $lch$8h$lch$, $lch$us-gun-control$lch$,
   NULL, true, 0.45)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_gun_005$lch$, 'ev_default', $lch$Supreme Court weighs marijuana users' gun rights$lch$, $lch$The Supreme Court is hearing arguments on whether marijuana users can be prohibited from owning guns under federal law. The case tests whether the 1968 Gun Control Act's restrictions meet strict Second Amendment standards in light of recent pro-gun rulings.$lch$, $lch$Washington Post$lch$, 'neutral',
   $lch$https://www.washingtonpost.com/politics/2026/03/02/supreme-court-marijuana-gun-hemani/$lch$, $lch$https://static.wixstatic.com/media/0eb7a4_62b29f11d642449099bb2659ac5774ca~mv2.png/v1/fill/w_1000,h_563,al_c,q_90,usm_0.66_1.00_0.01/0eb7a4_62b29f11d642449099bb2659ac5774ca~mv2.png$lch$, $lch$10h$lch$, $lch$us-gun-control$lch$,
   NULL, false, 0.5)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_gun_006$lch$, 'ev_default', $lch$Justice Department weighs rollback of gun regulations$lch$, $lch$The Trump administration's Justice Department is considering rolling back ATF regulations on firearms, including rules on ghost guns and pistol braces. Gun rights advocates welcome the move while gun safety groups warn it will make weapons more accessible to dangerous individuals.$lch$, $lch$Washington Post$lch$, 'neutral',
   $lch$https://www.washingtonpost.com/national-security/2026/01/19/trump-justice-department-gun-regulations-atf/$lch$, $lch$https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtAaHVJBeAZ-X9O7blOVBGiHlxvmlXpMpIrg&s$lch$, $lch$12h$lch$, $lch$us-gun-control$lch$,
   NULL, false, 0.8)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_gun_007$lch$, 'ev_default', $lch$Liberal gun groups see membership surge after Minneapolis shooting$lch$, $lch$Left-leaning gun advocacy groups report overwhelming demand for firearms training following the fatal shooting of a protester by federal agents in Minneapolis. Groups like Socialist Rifle Association say membership inquiries have tripled as progressives reconsider gun ownership.$lch$, $lch$CNN$lch$, 'neutral',
   $lch$https://www.cnn.com/2026/02/01/us/gun-rights-politics-alex-pretti-killing-cec$lch$, $lch$https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-2257847778.jpg?c=16x9&q=w_800,c_fill$lch$, $lch$1d$lch$, $lch$us-gun-control$lch$,
   NULL, true, 0.55)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_gun_008$lch$, 'ev_default', $lch$Gun rights groups question Trump's Second Amendment stance$lch$, $lch$The NRA and other gun rights organizations are criticizing the Trump administration's claims that a Minneapolis protester had no right to possess a firearm. Legal experts and Second Amendment advocates say the administration's rhetoric contradicts established gun rights principles.$lch$, $lch$CNN$lch$, 'neutral',
   $lch$https://www.cnn.com/2026/01/27/politics/gun-alex-pretti-ice-nra$lch$, $lch$https://media.cnn.com/api/v1/images/stellar/prod/ap26027626289799.jpg?c=16x9&q=w_800,c_fill$lch$, $lch$1d$lch$, $lch$us-gun-control$lch$,
   NULL, false, 0.6)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_abortion_001$lch$, 'ev_default', $lch$Wyoming Supreme Court strikes down abortion pill ban$lch$, $lch$Wyoming's Supreme Court struck down the state's near-total abortion ban and first-in-nation prohibition on abortion pills, ruling they violate the state constitution's 2012 healthcare amendment. The 4-1 decision protects residents' right to make their own healthcare decisions.$lch$, $lch$Washington Post$lch$, 'neutral',
   $lch$https://www.washingtonpost.com/nation/2026/01/06/wyoming-court-abortion-pill-ban/$lch$, $lch$https://i.guim.co.uk/img/media/3544713542f43a3803afa036936efc54785046dc/0_0_4749_3166/master/4749.jpg?width=465&dpr=1&s=none&crop=none$lch$, $lch$1h$lch$, $lch$us-abortion$lch$,
   $lch$poll_abortion_legality_001$lch$, false, 0.6)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_abortion_002$lch$, 'ev_default', $lch$Abortion clinics closing even in states with access$lch$, $lch$According to the Guttmacher Institute, there were 753 abortion clinics in the US at the end of 2025, a net loss of 54 since 2020 and 12 since March 2024. Clinic closures are occurring even in states where abortion remains legal, straining access nationwide.$lch$, $lch$CNN$lch$, 'neutral',
   $lch$https://edition.cnn.com/2026/02/18/health/abortion-clinic-closures-guttmacher$lch$, $lch$https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-1237884449.jpg?c=original$lch$, $lch$3h$lch$, $lch$us-abortion$lch$,
   $lch$poll_abortion_legality_001$lch$, true, 0.55)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_abortion_003$lch$, 'ev_default', $lch$Veterans Affairs imposes near-total abortion ban$lch$, $lch$The Trump administration's Department of Veterans Affairs quietly imposed a near-total abortion ban, eliminating abortion care even in cases of rape, incest, or to save the pregnant person's health. The policy affects over 2 million women veterans across the United States.$lch$, $lch$CNN$lch$, 'neutral',
   $lch$https://www.cnn.com/2026/01/28/politics/abortion-ban-veterans-affairs-roe-wade$lch$, $lch$https://media.cnn.com/api/v1/images/stellar/prod/2025-02-20t173249z-1567173878-rc2gycaqrf5j-rtrmadp-3-usa-trump-workers.JPG?c=16x9&q=w_800,c_fill$lch$, $lch$5h$lch$, $lch$us-abortion$lch$,
   $lch$poll_abortion_legality_001$lch$, false, 0.85)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_abortion_004$lch$, 'ev_default', $lch$Abortion rights poised to drive 2026 midterm turnout$lch$, $lch$Abortion-related ballot measures are heading to voters in Missouri, Idaho, Virginia, Oregon, Montana and Nebraska this November. Both abortion advocates and opponents say the 2026 midterm elections could significantly reshape the legal landscape for reproductive rights nationwide.$lch$, $lch$Washington Post$lch$, 'neutral',
   $lch$https://statecourtreport.org/our-work/analysis-opinion/2026-abortion-related-ballot-measures$lch$, $lch$https://i.guim.co.uk/img/media/99c7607862dd92362e006ac75b19ac0119568e40/0_0_6000_4000/master/6000.jpg?width=465&dpr=1&s=none&crop=none$lch$, $lch$7h$lch$, $lch$us-abortion$lch$,
   $lch$poll_abortion_legality_001$lch$, false, 0.52)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_abortion_005$lch$, 'ev_default', $lch$Abortion laws don't align with public opinion, analysis shows$lch$, $lch$A Washington Post analysis reveals stark disconnects between abortion laws and public sentiment in many states. While most Americans favor abortion access with some restrictions, state policies often reflect more extreme positions, either total bans or unrestricted access.$lch$, $lch$Washington Post$lch$, 'neutral',
   $lch$https://www.washingtonpost.com/ripple/2026/02/25/abortion-laws-show-that-public-policy-doesnt-always-line-up-with-public-opinion/$lch$, $lch$https://www.pewresearch.org/wp-content/uploads/sites/20/2026/03/PP_2026.3.12_abortion_0-01.png?w=640$lch$, $lch$9h$lch$, $lch$us-abortion$lch$,
   $lch$poll_abortion_legality_001$lch$, true, 0.5)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_abortion_006$lch$, 'ev_default', $lch$Anti-abortion movement escalates clashes over blue state 'shield' laws$lch$, $lch$The anti-abortion movement is testing new legal strategies to challenge 'shield laws' in Democratic-led states that protect abortion providers and patients. These confrontations could force a Supreme Court showdown over interstate abortion access and enforcement.$lch$, $lch$CNN$lch$, 'neutral',
   $lch$https://www.cnn.com/2026/01/17/politics/abortion-shield-laws-louisiana-california-texas$lch$, $lch$https://media.cnn.com/api/v1/images/stellar/prod/c-ap23103847076018.jpg?c=original&q=w_860,c_fill$lch$, $lch$11h$lch$, $lch$us-abortion$lch$,
   $lch$poll_abortion_legality_001$lch$, false, 0.75)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_abortion_007$lch$, 'ev_default', $lch$Trump expands ban on aid to groups discussing abortion abroad$lch$, $lch$President Trump expanded the Mexico City Policy, cutting off upwards of $30 billion in non-military foreign assistance to organizations that discuss or provide abortion services. The policy now also targets groups that embrace diversity, equity and inclusion initiatives.$lch$, $lch$NPR$lch$, 'neutral',
   $lch$https://www.npr.org/2026/01/23/nx-s1-5683204/abortion-trump-mexico-city-policy$lch$, $lch$https://npr.brightspotcdn.com/dims3/default/strip/false/crop/2572x1716+0+0/resize/1100/quality/50/format/png/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2F5a%2F5e%2F77c5292f48f1bb7aca17bdd22469%2Fmexico-city-madagascar.png$lch$, $lch$13h$lch$, $lch$us-abortion$lch$,
   NULL, false, 0.67)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_abortion_008$lch$, 'ev_default', $lch$Missouri voters to decide on abortion ban in November 2026$lch$, $lch$Missouri's Amendment 3 would overturn the 2024 voter-approved constitutional right to reproductive freedom and reinstate abortion restrictions. The measure allows abortion only for medical emergencies, fetal anomalies, or rape/incest before 12 weeks, while also prohibiting gender transition procedures for minors.$lch$, $lch$Ballotpedia$lch$, 'neutral',
   $lch$https://ballotpedia.org/Missouri_Amendment_3,_Prohibit_Abortion_and_Gender_Transition_Procedures_for_Minors_Amendment_(2026)$lch$, $lch$https://statecourtreport.org/sites/default/files/2023-11/2023_09_SCR_Abortion_Rights%20%282%29.png$lch$, $lch$15h$lch$, $lch$us-abortion$lch$,
   $lch$poll_abortion_legality_001$lch$, false, 0.55)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_climate_001$lch$, 'ev_default', $lch$Trump EPA repeals greenhouse gas endangerment finding$lch$, $lch$On February 12, 2026, the EPA finalized repeal of its 2009 'endangerment finding' that greenhouse gases endanger public health. This eliminates the legal foundation for federal climate regulations on power plants, vehicles, and the oil and gas industry, marking the largest deregulatory action in U.S. history.$lch$, $lch$Washington Post$lch$, 'neutral',
   $lch$https://www.washingtonpost.com/climate-environment/2026/02/12/endangerment-finding-repeal/$lch$, $lch$https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/BI3TX7QLYMI6DDYI6MJ5WGVRHA&w=1440$lch$, $lch$2h$lch$, $lch$us-climate$lch$,
   $lch$poll_climate_international_agreements_001$lch$, false, 0.85)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_climate_002$lch$, 'ev_default', $lch$EPA will no longer consider health costs in pollution regulations$lch$, $lch$The Trump administration EPA announced it will no longer factor the economic costs of public health impacts when creating pollution regulations. Environmental groups warn this will lead to more toxic air and water pollution, while the administration says it removes regulatory burdens on industry.$lch$, $lch$Washington Post$lch$, 'neutral',
   $lch$https://www.washingtonpost.com/climate-environment/2026/01/12/epa-public-health-pollution-costs/$lch$, $lch$https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/SXYZX7WFTOPBIZGAEYV44ETMTA_size-normalized.JPG&w=1800&h=1800$lch$, $lch$4h$lch$, $lch$us-climate$lch$,
   $lch$poll_climate_international_agreements_001$lch$, false, 0.8)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_climate_003$lch$, 'ev_default', $lch$19 years ago, Supreme Court told EPA it could regulate climate pollution$lch$, $lch$In 2007's Massachusetts v. EPA, the Supreme Court ruled that greenhouse gases are air pollutants under the Clean Air Act and the EPA has authority to regulate them. Trump's 2026 repeal of the endangerment finding directly contradicts this landmark decision, setting up major legal battles.$lch$, $lch$CNN$lch$, 'neutral',
   $lch$https://supreme.justia.com/cases/federal/us/549/497/$lch$, $lch$https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-2261037765.jpg?c=16x9&q=w_800,c_fill$lch$, $lch$6h$lch$, $lch$us-climate$lch$,
   $lch$poll_climate_international_agreements_001$lch$, false, 0.5)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_climate_004$lch$, 'ev_default', $lch$Climate policy shift: Net zero is dead, clean energy lives on$lch$, $lch$Bloomberg analysis finds that 'net zero' has effectively died as a diplomatic priority globally. Instead, countries are pivoting to industrial policy focused on energy security, resilience, and clean technology competitiveness, with less emphasis on emissions targets.$lch$, $lch$Bloomberg$lch$, 'neutral',
   $lch$https://www.bloomberg.com/opinion/articles/2026-02-25/climate-change-net-zero-is-dead-long-live-renewable-energy$lch$, $lch$https://assets.bwbx.io/images/users/iqjWHBFdfxIU/iMvcUDmdpH48/v0/-1x-1.webp$lch$, $lch$8h$lch$, $lch$us-climate$lch$,
   $lch$poll_climate_international_agreements_001$lch$, true, 0.58)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_climate_005$lch$, 'ev_default', $lch$US set to add record 86 GW of renewable energy capacity in 2026$lch$, $lch$The U.S. Energy Information Administration reports developers plan to add 86 gigawatts of new utility-scale capacity in 2026, a record if realized. Solar will provide 51% of new capacity, batteries 28%, and wind 14%. Renewable energy will surpass natural gas capacity for the first time.$lch$, $lch$EIA$lch$, 'neutral',
   $lch$https://www.eia.gov/todayinenergy/detail.php?id=67205$lch$, $lch$https://www.eia.gov/todayinenergy/images/2026.02.20/main.svg$lch$, $lch$10h$lch$, $lch$us-climate$lch$,
   $lch$poll_climate_international_agreements_001$lch$, true, 0.6)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_climate_006$lch$, 'ev_default', $lch$EPA's shock and awe deregulatory strategy learns from past$lch$, $lch$The Washington Post reports the Trump EPA is using lessons from failed first-term rollbacks to craft legally defensible deregulation. The strategy includes repealing the endangerment finding, weakening power plant emissions standards, and reducing Clean Water Act protections.$lch$, $lch$Washington Post$lch$, 'neutral',
   $lch$https://www.washingtonpost.com/climate-environment/2026/01/05/epa-rollbacks-strategy-courts/$lch$, $lch$https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/WVYSWUC5NJHYFHXT6YOIQSLFJI_size-normalized.jpg&w=1800&h=1800$lch$, $lch$12h$lch$, $lch$us-climate$lch$,
   $lch$poll_climate_international_agreements_001$lch$, false, 0.75)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_climate_007$lch$, 'ev_default', $lch$Opinion: EPA emissions reversal is a responsible move$lch$, $lch$A Washington Post opinion piece argues the EPA's reversal on climate regulations restores proper constitutional order by returning policy decisions to elected officials rather than unelected bureaucrats. The author contends climate science uncertainties don't justify sweeping federal mandates.$lch$, $lch$Washington Post$lch$, 'neutral',
   $lch$https://www.washingtonpost.com/opinions/2026/02/18/epa-emissions-reversal-energy-steven-koonin/$lch$, $lch$https://tse4.mm.bing.net/th/id/OIP.8ohl1DvIBnds0Aup2GHB_wHaE8?rs=1&pid=ImgDetMain&o=7&rm=3$lch$, $lch$14h$lch$, $lch$us-climate$lch$,
   NULL, false, 0.6)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_climate_008$lch$, 'ev_default', $lch$Heat-related deaths climb 53% as climate change intensifies$lch$, $lch$Deaths associated with high temperatures in the United States climbed 53% between 2000-2009 and 2010-2020, rising from 2,670 to over 4,000 annually. A 2023 JAMA study recorded 2,325 heat-related deaths, the highest total since 1999, as extreme heat becomes the deadliest form of weather.$lch$, $lch$NBC News$lch$, 'neutral',
   $lch$https://www.nbcnews.com/weather/heat/deadliest-extreme-weather-event-not-think-rcna219702$lch$, $lch$https://i.guim.co.uk/img/media/358ee9c0b3517f0b5f1a887c5291d0e896e08bea/0_77_1200_720/master/1200.jpg?width=1200&height=900&quality=85&auto=format&fit=crop&s=6568abbaa0ee544c76a13e8096489b2e$lch$, $lch$16h$lch$, $lch$us-climate$lch$,
   $lch$poll_climate_international_agreements_001$lch$, false, 0.52)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_gun_010$lch$, 'ev_default', $lch$A quiet bipartisan effort on gun background checks may have a path to a deal$lch$, $lch$Republican Sen. John Cornyn and Democratic Sen. Chris Murphy have been quietly negotiating a bipartisan expansion of gun background check rules, in a rare cross-party collaboration on one of America's most polarized policy issues.$lch$, $lch$NBC News$lch$, 'neutral',
   $lch$https://www.nbcnews.com/politics/congress/quiet-bipartisan-effort-gun-background-checks-may-be-verge-deal-n1268630$lch$, $lch$https://media-cldnry.s-nbcnews.com/image/upload/t_nbcnews-fp-1200-630,f_auto,q_auto:best/newscms/2021_21/3477890/210526-background-checks-mb-1637.jpg$lch$, $lch$18h$lch$, $lch$us-gun-control$lch$,
   NULL, true, 0.65)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_abortion_010$lch$, 'ev_default', $lch$These Republican Lawmakers Challenged Abortion Bans. Then They Faced Backlash.$lch$, $lch$At least four Republican state legislators who sought to add exceptions to abortion bans — including Louisiana's Mary DuBuisson and Tennessee's Richard Briggs — lost support from anti-abortion groups and faced primary challenges for breaking with party orthodoxy.$lch$, $lch$ProPublica$lch$, 'neutral',
   $lch$https://www.propublica.org/article/republicans-face-backlash-after-challenging-abortion-bans$lch$, $lch$https://www.propublica.org/wp-content/uploads/2026/06/20260603-abortion-reforms-punished-murphy-campaign.jpg?w=1149$lch$, $lch$20h$lch$, $lch$us-abortion$lch$,
   NULL, true, 0.63)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_climate_010$lch$, 'ev_default', $lch$America's largest coal miners' union supports clean energy$lch$, $lch$The United Mine Workers of America, representing the country's largest cohort of coal miners, announced support for a clean energy transition — provided that federal investment guarantees well-paying jobs and retraining funds for displaced workers in coalfield communities.$lch$, $lch$Grist$lch$, 'neutral',
   $lch$https://grist.org/energy/americas-largest-coal-miners-union-supports-clean-energy-with-conditions/$lch$, $lch$https://grist.org/wp-content/uploads/2021/04/UMWA-coal-miner-workers-energy-e1618871598667.jpg?quality=75&strip=all$lch$, $lch$22h$lch$, $lch$us-climate$lch$,
   NULL, true, 0.61)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

INSERT INTO public.reports (id, event_id, title, summary, source, stance, url, image_url, published_at, topic_id, polling_data_id, counter_stereotypical, engagement_score) VALUES
  ($lch$rp_immigration_001$lch$, 'ev_default', $lch$'The new family separation crisis': More than 100 US citizen kids left stranded by ICE enforcement actions, CNN finds$lch$, $lch$A CNN investigation has identified over 100 U.S.-citizen children who have been left without their primary caregivers as ICE expands workplace and home raids under the administration's quota of 3,000 daily arrests. Many of the detained parents had lived in the country for over a decade with no criminal record, attended immigration appointments, and held valid work permits.$lch$, $lch$CNN$lch$, 'neutral',
   $lch$https://www.cnn.com/2025/09/23/politics/us-citizen-children-separated-parents-deported-ice-invs$lch$, $lch$https://www.worldpressphoto.org/getmedia/5eb76235-1b1e-43c0-9427-e2007edd868d/WPP-2026Contest-POY-CarolGuzy.jpg?maxsidesize=1920&resizemode=force$lch$, $lch$6h$lch$, $lch$us-immigration$lch$,
   NULL, false, 0.82)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  url = EXCLUDED.url, image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at,
  topic_id = EXCLUDED.topic_id, polling_data_id = EXCLUDED.polling_data_id,
  counter_stereotypical = EXCLUDED.counter_stereotypical, engagement_score = EXCLUDED.engagement_score;

-- ----------------------------------------
-- 6. Profiles (13) — display name, avatar, Path C identities
-- ----------------------------------------

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

-- ----------------------------------------
-- 7. Comments (76)
-- ----------------------------------------
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

-- ----------------------------------------
-- 8. Verify (expected: topics=4, polls=2, reports=28, profiles=13, comments=76)
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
-- ALTER TABLE public.reports DROP COLUMN IF EXISTS content_type;
