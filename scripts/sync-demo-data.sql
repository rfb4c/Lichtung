-- ========================================
-- Sync Supabase content to src/data/app-data.json
--
-- GENERATED FILE — do not hand-edit.
-- Regenerate: node scripts/generate-supabase-sync.cjs
--
-- 4 topics · 2 polls · 28 reports
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

-- Path A dropped hostility scoring; hostility_score / content_type are no longer
-- in app-data.json and no longer read by the app. Dropping them is irreversible,
-- so it is left as a deliberate manual step rather than part of the sync:
--   ALTER TABLE public.reports DROP COLUMN IF EXISTS hostility_score;
--   ALTER TABLE public.reports DROP COLUMN IF EXISTS content_type;

-- Clear in FK order: comments -> reports -> polling_data.
-- Only comments left orphaned by the report deletion below are removed.
DELETE FROM public.comments     WHERE report_id NOT IN ($lch$rp_gun_001$lch$, $lch$rp_gun_002$lch$, $lch$rp_gun_003$lch$, $lch$rp_gun_004$lch$, $lch$rp_gun_005$lch$, $lch$rp_gun_006$lch$, $lch$rp_gun_007$lch$, $lch$rp_gun_008$lch$, $lch$rp_abortion_001$lch$, $lch$rp_abortion_002$lch$, $lch$rp_abortion_003$lch$, $lch$rp_abortion_004$lch$, $lch$rp_abortion_005$lch$, $lch$rp_abortion_006$lch$, $lch$rp_abortion_007$lch$, $lch$rp_abortion_008$lch$, $lch$rp_climate_001$lch$, $lch$rp_climate_002$lch$, $lch$rp_climate_003$lch$, $lch$rp_climate_004$lch$, $lch$rp_climate_005$lch$, $lch$rp_climate_006$lch$, $lch$rp_climate_007$lch$, $lch$rp_climate_008$lch$, $lch$rp_gun_010$lch$, $lch$rp_abortion_010$lch$, $lch$rp_climate_010$lch$, $lch$rp_immigration_001$lch$);
DELETE FROM public.reports      WHERE id        NOT IN ($lch$rp_gun_001$lch$, $lch$rp_gun_002$lch$, $lch$rp_gun_003$lch$, $lch$rp_gun_004$lch$, $lch$rp_gun_005$lch$, $lch$rp_gun_006$lch$, $lch$rp_gun_007$lch$, $lch$rp_gun_008$lch$, $lch$rp_abortion_001$lch$, $lch$rp_abortion_002$lch$, $lch$rp_abortion_003$lch$, $lch$rp_abortion_004$lch$, $lch$rp_abortion_005$lch$, $lch$rp_abortion_006$lch$, $lch$rp_abortion_007$lch$, $lch$rp_abortion_008$lch$, $lch$rp_climate_001$lch$, $lch$rp_climate_002$lch$, $lch$rp_climate_003$lch$, $lch$rp_climate_004$lch$, $lch$rp_climate_005$lch$, $lch$rp_climate_006$lch$, $lch$rp_climate_007$lch$, $lch$rp_climate_008$lch$, $lch$rp_gun_010$lch$, $lch$rp_abortion_010$lch$, $lch$rp_climate_010$lch$, $lch$rp_immigration_001$lch$);
DELETE FROM public.polling_data WHERE id        NOT IN ($lch$poll_abortion_legality_001$lch$, $lch$poll_climate_international_agreements_001$lch$);

-- Legacy NOT NULL column on reports, kept satisfied with one dummy row
INSERT INTO public.events (id, title, supportive, neutral, opposed)
VALUES ('ev_default', 'Default Event', 33, 34, 33)
ON CONFLICT (id) DO NOTHING;

-- ---------- Topics (4) ----------
INSERT INTO public.topics (id, name, scope, tag_keywords) VALUES
  ($lch$us-gun-control$lch$, $lch$Gun Control$lch$, $lch$us_domestic$lch$, ARRAY[$lch$gun$lch$, $lch$firearm$lch$, $lch$second amendment$lch$]::text[])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, scope = EXCLUDED.scope, tag_keywords = EXCLUDED.tag_keywords;
INSERT INTO public.topics (id, name, scope, tag_keywords) VALUES
  ($lch$us-abortion$lch$, $lch$Abortion Rights$lch$, $lch$us_domestic$lch$, ARRAY[$lch$abortion$lch$, $lch$roe$lch$, $lch$reproductive$lch$, $lch$pro-choice$lch$, $lch$pro-life$lch$]::text[])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, scope = EXCLUDED.scope, tag_keywords = EXCLUDED.tag_keywords;
INSERT INTO public.topics (id, name, scope, tag_keywords) VALUES
  ($lch$us-climate$lch$, $lch$Climate Policy$lch$, $lch$us_domestic$lch$, ARRAY[$lch$climate$lch$, $lch$carbon$lch$, $lch$renewable$lch$, $lch$environment$lch$]::text[])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, scope = EXCLUDED.scope, tag_keywords = EXCLUDED.tag_keywords;
INSERT INTO public.topics (id, name, scope, tag_keywords) VALUES
  ($lch$us-immigration$lch$, $lch$Immigration Policy$lch$, $lch$us_domestic$lch$, ARRAY[$lch$immigration$lch$, $lch$ICE$lch$, $lch$deportation$lch$, $lch$border$lch$, $lch$undocumented$lch$, $lch$asylum$lch$]::text[])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, scope = EXCLUDED.scope, tag_keywords = EXCLUDED.tag_keywords;

-- ---------- Polling data (2) ----------
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

-- ---------- Reports (28) ----------
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

COMMIT;

-- ---------- Verify: expect 4 / 2 / 28 ----------
SELECT 'topics' AS table, COUNT(*) AS rows FROM public.topics
UNION ALL SELECT 'polling_data', COUNT(*) FROM public.polling_data
UNION ALL SELECT 'reports', COUNT(*) FROM public.reports;
