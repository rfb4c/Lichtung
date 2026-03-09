-- ========================================
-- Complete Data Import for Lichtung
-- Imports topics, events, reports, and polling data from app-data.json
-- Execute in Supabase Dashboard → SQL Editor
-- ========================================

-- Step 1: Clear existing data (only if tables exist)
-- ========================================
-- Note: If you get "relation does not exist" errors, run create-path-b-tables.sql first

DO $$
BEGIN
  -- Delete in dependency order (child tables first)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comments') THEN
    DELETE FROM comments;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'polling_data') THEN
    DELETE FROM polling_data;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reports') THEN
    DELETE FROM reports;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'topics') THEN
    DELETE FROM topics;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') THEN
    DELETE FROM events;
  END IF;
END $$;

-- Step 2: Import Topics
-- ========================================
INSERT INTO topics (id, name, scope, tag_keywords) VALUES
('us-gun-control', 'Gun Control', 'us_domestic', ARRAY['gun', 'firearm', 'second amendment']),
('us-abortion', 'Abortion Rights', 'us_domestic', ARRAY['abortion', 'roe', 'reproductive', 'pro-choice', 'pro-life']),
('us-climate', 'Climate Policy', 'us_domestic', ARRAY['climate', 'carbon', 'renewable', 'environment']);

-- Step 3: Create dummy event for reports table (legacy requirement)
-- ========================================
-- Note: event_id is a legacy field from v0.1.0 design
-- We create a single dummy event to satisfy the NOT NULL constraint
INSERT INTO events (id, title, supportive, neutral, opposed) VALUES
('ev_default', 'Default Event', 33, 34, 33);

-- Step 4: Import Reports
-- ========================================
-- Gun Control Reports (8 reports)
INSERT INTO reports (id, event_id, title, summary, source, stance, topic_id, image_url, published_at) VALUES
('rp_gun_001', 'ev_default',
 'Austin bar shooting kills 3, injures 14 - FBI investigating terrorism',
 'A mass shooting outside Buford''s Backyard Beer Garden in downtown Austin killed three people and injured 14 others on March 1, 2026. The FBI is investigating the attack as potential terrorism after the gunman was found wearing clothing with Islamic references.',
 'CBS Austin', 'neutral', 'us-gun-control',
 'https://media.nbcdfw.com/2026/03/AP26060561690822.jpg?quality=85&strip=all',
 '2h'),

('rp_gun_002', 'ev_default',
 'Federal appeals court upholds Maryland gun control restrictions',
 'A federal appeals court upheld Maryland''s law banning guns in sensitive public places including schools, hospitals, parks and government buildings. The Fourth Circuit ruling said states can restrict firearms without violating the Supreme Court''s recent Second Amendment decisions.',
 'Maryland Matters', 'neutral', 'us-gun-control',
 'https://marylandmatters.org/wp-content/uploads/2026/01/2417294-1536x1024.png',
 '4h'),

('rp_gun_003', 'ev_default',
 'Federal court rules California''s open carry ban unconstitutional',
 'The 9th Circuit Court of Appeals struck down California''s ban on openly carrying firearms in most counties, ruling 2-1 that it violates the Second Amendment. The decision affects 95% of California''s population living in counties with over 200,000 residents.',
 'CNN', 'neutral', 'us-gun-control',
 'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-560w,f_auto,q_auto:best/rockcms/2026-01/250102-open-carry-aa-640-182ab3.png',
 '6h'),

('rp_gun_004', 'ev_default',
 'Trump''s inconsistent stance scrambles America''s gun debate',
 'President Trump broke with pro-gun groups by suggesting federal agents were justified in the Minneapolis shooting, saying the protester ''shouldn''t have had a gun.'' After NRA backlash, the administration reversed course, leaving both sides confused about the White House''s gun policy.',
 'CNN', 'neutral', 'us-gun-control',
 'https://www.motherjones.com/wp-content/uploads/trump-rifle2000.jpg?w=990',
 '8h'),

('rp_gun_005', 'ev_default',
 'Supreme Court weighs marijuana users'' gun rights',
 'The Supreme Court is hearing arguments on whether marijuana users can be prohibited from owning guns under federal law. The case tests whether the 1968 Gun Control Act''s restrictions meet strict Second Amendment standards in light of recent pro-gun rulings.',
 'Washington Post', 'neutral', 'us-gun-control',
 'https://static.wixstatic.com/media/0eb7a4_62b29f11d642449099bb2659ac5774ca~mv2.png/v1/fill/w_1000,h_563,al_c,q_90,usm_0.66_1.00_0.01/0eb7a4_62b29f11d642449099bb2659ac5774ca~mv2.png',
 '10h'),

('rp_gun_006', 'ev_default',
 'Trump administration rolls back ghost gun regulations',
 'The ATF announced it will repeal Biden-era rules requiring serial numbers on build-it-yourself firearms. Gun rights groups praised the move, while law enforcement agencies warned that untraceable ghost guns hinder criminal investigations.',
 'The Hill', 'neutral', 'us-gun-control',
 'https://www.gannett-cdn.com/-mm-/3b69c6c88b4d87a1c94f1c2a42c3c5b3e2b0e2b0/c=0-104-2121-1302/local/-/media/2021/04/12/USATODAY/usatsports/ghost-guns.jpg',
 '12h'),

('rp_gun_007', 'ev_default',
 'Liberal gun ownership surges after Portland protest shooting',
 'Firearm sales among left-leaning Americans have jumped 47% following the Portland federal building shooting, according to NSSF data. First-time buyers cite political violence and distrust of law enforcement as key motivations.',
 'NPR', 'neutral', 'us-gun-control',
 'https://npr.brightspotcdn.com/dims4/default/5c1b2f2/2147483647/strip/true/crop/6000x4000+0+0/resize/880x587!/quality/90/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2F7b%2F2e%2F1e3f4a8d4e4e8c8e8c8e8c8e8c8e%2Fgunshop.jpg',
 '14h'),

('rp_gun_008', 'ev_default',
 'Trump backtracks on gun control comments after NRA backlash',
 'President Trump walked back his suggestion that federal agents were justified shooting an armed protester in Minneapolis. After the NRA and allied groups criticized the remarks, the White House issued a statement reaffirming support for Second Amendment rights.',
 'Politico', 'neutral', 'us-gun-control',
 'https://static.politico.com/dims4/default/1c7d6c3/2147483647/strip/true/crop/4500x3000+0+0/resize/630x420!/quality/90/?url=https%3A%2F%2Fstatic.politico.com%2F0e%2Fd7%2F1e3f4a8d4e4e8c8e8c8e8c8e8c8e%2Ftrump-nra.jpg',
 '16h');

-- Abortion Reports (8 reports)
INSERT INTO reports (id, event_id, title, summary, source, stance, topic_id, image_url, published_at) VALUES
('rp_abortion_001', 'ev_default',
 'Federal judge blocks Mississippi abortion ban enforcement',
 'A federal district court issued a temporary restraining order halting Mississippi''s near-total abortion ban. The judge ruled that plaintiffs demonstrated a likelihood of success on constitutional grounds, despite the state''s appeal to the 5th Circuit.',
 'Associated Press', 'neutral', 'us-abortion',
 'https://dims.apnews.com/dims4/default/1e3f4a8/2147483647/strip/true/crop/5472x3648+0+0/resize/599x399!/quality/90/?url=https%3A%2F%2Fstorage.googleapis.com%2Fafs-prod%2Fmedia%2F1e3f4a8d4e4e8c8e8c8e8c8e8c8e%2F5472.jpeg',
 '2h'),

('rp_abortion_002', 'ev_default',
 'Over 100 abortion clinics have closed since 2023',
 'A Guttmacher Institute report found that 127 abortion clinics have shut down across 15 states since mid-2023. The closures have created ''abortion deserts'' where women must travel 200+ miles to access care.',
 'Guttmacher Institute', 'neutral', 'us-abortion',
 'https://www.guttmacher.org/sites/default/files/article_images/4914_16x9.jpg',
 '4h'),

('rp_abortion_003', 'ev_default',
 'VA hospitals resume abortion services after policy reversal',
 'The Department of Veterans Affairs announced it will reinstate abortion services at VA medical centers for cases involving rape, incest, or life-threatening conditions. The policy shift reverses a Trump administration ban implemented in early 2025.',
 'Military Times', 'neutral', 'us-abortion',
 'https://www.militarytimes.com/resizer/1e3f4a8d4e4e8c8e8c8e8c8e8c8e/arc-anglerfish-arc2-prod-mco.s3.amazonaws.com/public/1e3f4a8d4e4e8c8e8c8e8c8e8c8e.jpg',
 '6h'),

('rp_abortion_004', 'ev_default',
 'Abortion rights on ballot in 7 states this November',
 'Voters in Arizona, Colorado, Florida, Maryland, Missouri, Nevada, and South Dakota will decide on abortion-related ballot measures in 2026. Polling suggests pro-choice measures lead in 5 of 7 states.',
 'Ballotpedia', 'neutral', 'us-abortion',
 'https://ballotpedia.s3.amazonaws.com/images/thumb/1/1e/Abortion_ballot.jpg/300px-Abortion_ballot.jpg',
 '8h'),

('rp_abortion_005', 'ev_default',
 'New polling: 63% of Americans want abortion legal in most cases',
 'A Pew Research Center survey found 63% of Americans believe abortion should be legal in all or most cases, while 36% say it should be illegal in all or most cases. The findings show public opinion has remained stable since the Dobbs decision.',
 'Pew Research Center', 'neutral', 'us-abortion',
 'https://www.pewresearch.org/wp-content/uploads/2024/04/SR_24.04.15_abortion-views_featured.png',
 '10h'),

('rp_abortion_006', 'ev_default',
 'Blue states pass ''shield laws'' to protect abortion providers',
 'California, New York, and Massachusetts enacted legislation protecting doctors who mail abortion pills to patients in states with bans. The laws aim to prevent extradition and legal liability for providers serving out-of-state patients.',
 'Kaiser Health News', 'neutral', 'us-abortion',
 'https://khn.org/wp-content/uploads/sites/2/2024/03/GettyImages-1e3f4a8d4e4e8c8e8c8e8c8e8c8e.jpg',
 '12h'),

('rp_abortion_007', 'ev_default',
 'Trump proposes $30B cut to foreign aid over abortion funding',
 'The White House budget proposal would slash $30 billion in international health assistance, citing opposition to foreign NGOs that provide abortion referrals. Critics warn the cuts would devastate maternal health programs in developing nations.',
 'Foreign Policy', 'neutral', 'us-abortion',
 'https://foreignpolicy.com/wp-content/uploads/2026/03/trump-foreign-aid-abortion.jpg',
 '14h'),

('rp_abortion_008', 'ev_default',
 'Missouri voters to decide on abortion amendment — again',
 'Missouri lawmakers placed a new abortion restriction amendment on the 2026 ballot, just two years after voters approved a measure enshrining reproductive rights. Advocacy groups called the move an attempt to overturn the 2024 result.',
 'St. Louis Post-Dispatch', 'neutral', 'us-abortion',
 'https://www.stltoday.com/image_1e3f4a8d4e4e8c8e8c8e8c8e8c8e.jpg',
 '16h');

-- Climate Reports (8 reports)
INSERT INTO reports (id, event_id, title, summary, source, stance, topic_id, image_url, published_at) VALUES
('rp_climate_001', 'ev_default',
 'EPA proposes to repeal CO2 endangerment finding',
 'The Environmental Protection Agency announced plans to reverse its 2009 endangerment finding that classified carbon dioxide as a pollutant. Environmental groups called the move legally dubious and scientifically indefensible.',
 'The Guardian', 'neutral', 'us-climate',
 'https://i.guim.co.uk/img/media/1e3f4a8d4e4e8c8e8c8e8c8e8c8e/0_0_5472_3283/master/5472.jpg?width=620&quality=85&auto=format&fit=max&s=1e3f4a8d4e4e8c8e8c8e8c8e8c8e',
 '2h'),

('rp_climate_002', 'ev_default',
 'Study: Climate regulations saved $1.9 trillion in health costs',
 'An EPA-commissioned study found that air quality improvements from climate regulations between 2010-2025 prevented 230,000 premature deaths and avoided $1.9 trillion in healthcare costs, far exceeding compliance expenses.',
 'Environmental Health Perspectives', 'neutral', 'us-climate',
 'https://ehp.niehs.nih.gov/cms/asset/1e3f4a8d-4e4e-8c8e-8c8e-8c8e8c8e8c8e/ehp-featured.jpg',
 '4h'),

('rp_climate_003', 'ev_default',
 'Supreme Court''s Massachusetts v. EPA turns 19 years old',
 'Legal scholars marked the 19th anniversary of the landmark Massachusetts v. EPA ruling, which affirmed the EPA''s authority to regulate greenhouse gases. The decision remains the legal foundation for federal climate policy.',
 'SCOTUSblog', 'neutral', 'us-climate',
 'https://www.scotusblog.com/wp-content/uploads/2026/04/scotus-mass-epa.jpg',
 '6h'),

('rp_climate_004', 'ev_default',
 'Conservative states embrace clean energy for "energy security"',
 'Republican governors in Texas, Wyoming, and Montana are promoting wind and solar projects under the banner of ''energy independence'' rather than climate action. Industry analysts note the rhetorical shift avoids political polarization while achieving similar outcomes.',
 'E&E News', 'neutral', 'us-climate',
 'https://www.eenews.net/assets/2026/03/wind-farm-texas.jpg',
 '8h'),

('rp_climate_005', 'ev_default',
 'US renewable energy capacity hits record 86 GW in 2025',
 'The Energy Information Administration reported that renewables accounted for 86 gigawatts of new electricity capacity in 2025, surpassing fossil fuel additions for the fifth straight year. Solar led with 54 GW, followed by wind at 22 GW.',
 'U.S. EIA', 'neutral', 'us-climate',
 'https://www.eia.gov/todayinenergy/images/2026.03.15/main.svg',
 '10h'),

('rp_climate_006', 'ev_default',
 'Trump administration plans sweeping EPA deregulation',
 'The White House outlined plans to rescind or weaken 47 environmental regulations, including clean air standards, wetlands protections, and fuel efficiency requirements. Officials framed the moves as reducing burdens on businesses.',
 'Reuters', 'neutral', 'us-climate',
 'https://cloudfront-us-east-2.images.arcpublishing.com/reuters/1e3f4a8d4e4e8c8e8c8e8c8e8c8e.jpg',
 '12h'),

('rp_climate_007', 'ev_default',
 'Poll: Americans split on who should decide climate policy',
 'A new survey found 48% of Americans believe climate policy should be set by elected officials, while 47% prefer decisions based on scientific agency expertise. The divide largely tracks partisan affiliation.',
 'Yale Climate Opinion Maps', 'neutral', 'us-climate',
 'https://climatecommunication.yale.edu/wp-content/uploads/2026/03/poll-climate-governance.png',
 '14h'),

('rp_climate_008', 'ev_default',
 'Record heat waves prompt rethinking of climate adaptation',
 'After three consecutive summers with temperatures exceeding 110°F in Phoenix, Tucson, and Las Vegas, city planners are prioritizing heat resilience infrastructure over long-term emissions targets. Public health officials cite immediate mortality risks.',
 'Axios', 'neutral', 'us-climate',
 'https://images.axios.com/1e3f4a8d4e4e8c8e8c8e8c8e8c8e/0_0_1920_1080/1920.jpg',
 '16h');

-- Step 5: Import Polling Data
-- ========================================
INSERT INTO polling_data (id, topic_id, source, survey_year, geographic_scope, scale_labels, distribution, bridging_text) VALUES
-- Gun Control Polls
('poll_gun_control_background_checks_001', 'us-gun-control',
 'Pew Research Center', 2023, 'US',
 ARRAY['Strongly favor', 'Somewhat favor', 'Somewhat oppose', 'Strongly oppose'],
 ARRAY[61, 27, 7, 5],
 'According to Pew Research Center polling in 2023, the American public''s sentiment regarding making private gun sales and sales at gun shows subject to background checks is distributed as follows:'),

('poll_gun_control_assault_weapons_001', 'us-gun-control',
 'Pew Research Center', 2023, 'US',
 ARRAY['Strongly favor', 'Somewhat favor', 'Somewhat oppose', 'Strongly oppose'],
 ARRAY[46, 18, 16, 20],
 'Pew Research Center''s 2023 survey recorded the following national distribution regarding opinions on banning assault-style weapons:'),

('poll_gun_control_concealed_carry_001', 'us-gun-control',
 'Pew Research Center', 2023, 'US',
 ARRAY['Strongly favor', 'Somewhat favor', 'Somewhat oppose', 'Strongly oppose'],
 ARRAY[11, 16, 22, 51],
 'When asked about allowing people to carry concealed guns without a permit, a 2023 Pew Research Center poll showed these attitudes among US adults:'),

-- Abortion Polls
('poll_abortion_legality_001', 'us-abortion',
 'Pew Research Center', 2024, 'US',
 ARRAY['Legal in all cases', 'Legal in most cases', 'Illegal in most cases', 'Illegal in all cases'],
 ARRAY[25, 38, 25, 12],
 'According to an April 2024 Pew Research Center survey, the general public''s stance on the legality of abortion across all circumstances is:'),

('poll_abortion_medication_001', 'us-abortion',
 'Pew Research Center', 2024, 'US',
 ARRAY['Strongly favor availability', 'Somewhat favor availability', 'Somewhat oppose availability', 'Strongly oppose availability'],
 ARRAY[45, 18, 15, 22],
 'Regarding access to medication abortion like mifepristone, a 2024 Pew Research survey revealed the following breakdown of opinions:'),

('poll_abortion_federal_ban_001', 'us-abortion',
 'Kaiser Family Foundation', 2024, 'US',
 ARRAY['Strongly support', 'Somewhat support', 'Somewhat oppose', 'Strongly oppose'],
 ARRAY[25, 23, 16, 36],
 'A February 2024 KFF tracking poll measured American views on a proposed 16-week federal abortion ban with the following results:'),

-- Climate Polls
('poll_climate_carbon_emissions_001', 'us-climate',
 'Pew Research Center', 2023, 'US',
 ARRAY['Strongly favor', 'Somewhat favor', 'Somewhat oppose', 'Strongly oppose'],
 ARRAY[24, 30, 24, 22],
 'On the issue of requiring power plants to eliminate all carbon emissions by 2040, a 2023 Pew Research survey highlighted the following voter split:'),

('poll_climate_ev_transition_001', 'us-climate',
 'Pew Research Center', 2023, 'US',
 ARRAY['Strongly favor', 'Somewhat favor', 'Somewhat oppose', 'Strongly oppose'],
 ARRAY[15, 25, 21, 39],
 'When considering a phase-out of the production of new gas-powered cars and trucks by 2035, Pew Research polling in 2023 captured these sentiments:'),

('poll_climate_international_agreements_001', 'us-climate',
 'Pew Research Center', 2023, 'US',
 ARRAY['Strongly favor', 'Somewhat favor', 'Somewhat oppose', 'Strongly oppose'],
 ARRAY[33, 29, 18, 20],
 'Regarding U.S. participation in international climate agreements like the Paris Climate Accord, a 2023 Pew Research poll found:');

-- ========================================
-- Verify Import
-- ========================================
SELECT
  'Topics' as table_name,
  COUNT(*) as count
FROM topics
UNION ALL
SELECT 'Events', COUNT(*) FROM events
UNION ALL
SELECT 'Reports', COUNT(*) FROM reports
UNION ALL
SELECT 'Polling Data', COUNT(*) FROM polling_data;

-- Expected output:
-- Topics: 3
-- Events: 1
-- Reports: 24
-- Polling Data: 9
