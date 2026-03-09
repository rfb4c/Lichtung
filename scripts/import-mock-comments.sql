-- ========================================
-- Import Mock Comments to Supabase
-- Generated from app-data.json
-- Total comments: 73
-- Execute in Supabase Dashboard → SQL Editor
-- ========================================

-- Clear existing comments (optional - uncomment if you want to start fresh)
-- DELETE FROM comments;

-- Import comments (each INSERT...SELECT auto-maps email to UUID)

-- mc-001 (user-01)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_001',
  id,
  'I''ve owned firearms my entire adult life and taught both my kids to handle them safely. The problem isn''t responsible gun owners — it''s that we keep having this same debate while ignoring the real gaps in mental health support and enforcement.',
  '2026-03-07T08:15:00Z'::timestamptz
FROM auth.users
WHERE email = 'mike.thompson@example.com';

-- mc-002 (user-07)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_001',
  id,
  'I''m a father too, and last week I had to explain active shooter drills to my 7-year-old. No parent should have to rehearse what to do when someone starts shooting at school. At some point, ''thoughts and prayers'' isn''t enough — we need action.',
  '2026-03-07T08:45:00Z'::timestamptz
FROM auth.users
WHERE email = 'carlos.ramirez@example.com';

-- mc-003 (user-05)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_001',
  id,
  'I''ve been on the other end of these calls. You never forget the sound, the chaos, the families arriving at the scene. I carried a rifle overseas for this country, and I still believe some weapons have no place on our streets.',
  '2026-03-07T09:10:00Z'::timestamptz
FROM auth.users
WHERE email = 'robert.hayes@example.com';

-- mc-004 (user-12)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_001',
  id,
  'Three GSW patients came through my ER last month alone, and two of them were under 20. I don''t have a political opinion on this anymore — I just have a body count that keeps going up.',
  '2026-03-07T09:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'rachel.kim@example.com';

-- mc-005 (user-03)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_002',
  id,
  'I live in rural Maryland. Out here, a firearm isn''t a political statement — it''s how I protect my livestock from coyotes. Blanket bans on carrying in ''public places'' ignore that a county road isn''t the same as a shopping mall.',
  '2026-03-07T07:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'james.walker@example.com';

-- mc-006 (user-06)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_002',
  id,
  'As a teacher, I think about school safety every single day. My students deserve to learn without fear. I''m glad courts are upholding protections for schools and hospitals — these should be spaces where everyone feels safe.',
  '2026-03-07T08:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'emily.nguyen@example.com';

-- mc-007 (user-11)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_002',
  id,
  'My kids go to school in a small town. I hunt every season. And honestly? I''m fine with keeping guns out of schools and hospitals. That''s not tyranny — that''s common sense. We can protect both rights and our kids.',
  '2026-03-07T08:20:00Z'::timestamptz
FROM auth.users
WHERE email = 'tom.bradley@example.com';

-- mc-008 (user-10)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_003',
  id,
  'About time. I''m a woman who carries, and I shouldn''t need bureaucratic permission to protect myself. Growing up poor taught me nobody''s coming to save you — you have to save yourself.',
  '2026-03-07T06:20:00Z'::timestamptz
FROM auth.users
WHERE email = 'lisa.johnson@example.com';

-- mc-009 (user-12)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_003',
  id,
  'I see gun violence patients in the ER every week. More guns in public spaces means more patients on my table — that''s not an opinion, it''s eleven years of data from my own shift logs.',
  '2026-03-07T06:55:00Z'::timestamptz
FROM auth.users
WHERE email = 'rachel.kim@example.com';

-- mc-010 (user-09)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_003',
  id,
  'I lost my brother to a shooting five years ago. Every time a court makes it easier to carry, I relive that day. I know this is about rights. But rights didn''t bring him back.',
  '2026-03-07T07:10:00Z'::timestamptz
FROM auth.users
WHERE email = 'david.park@example.com';

-- mc-011 (user-11)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_004',
  id,
  'I voted for him. I own guns. And I can''t figure out what he actually believes about the Second Amendment. If even our own side can''t get a straight answer, what are we even fighting for?',
  '2026-03-07T05:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'tom.bradley@example.com';

-- mc-012 (user-02)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_004',
  id,
  'The inconsistency is the point. This was never about principles for him — it''s about whatever gets applause that day. Gun policy deserves serious, consistent leadership.',
  '2026-03-07T06:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'sarah.chen@example.com';

-- mc-013 (user-01)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_004',
  id,
  'I''m a veteran and a gun owner, and I''m tired of politicians using the Second Amendment as a campaign prop. Both sides do it. We need people who''ll actually sit down and solve problems.',
  '2026-03-07T06:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'mike.thompson@example.com';

-- mc-014 (user-09)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_005',
  id,
  'I depend on medical marijuana for chronic pain. Forcing me to choose between pain management and self-defense is cruel. Constitutional rights shouldn''t come with a prescription check.',
  '2026-03-07T05:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'david.park@example.com';

-- mc-015 (user-07)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_005',
  id,
  'This case is more nuanced than people think. You can support responsible gun ownership AND medical freedom. Why are we forcing people to pick one right over another?',
  '2026-03-07T06:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'carlos.ramirez@example.com';

-- mc-016 (user-06)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_005',
  id,
  'As an educator, I teach my students that the Constitution is a living document. Cases like this show exactly why — 1968 lawmakers never imagined legal marijuana states.',
  '2026-03-07T06:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'emily.nguyen@example.com';

-- mc-017 (user-03)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_006',
  id,
  'Ghost guns are a real issue, but the ATF has been overreaching for years. Rolling back blanket regulations and replacing them with targeted enforcement makes more sense for rural communities like mine.',
  '2026-03-07T04:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'james.walker@example.com';

-- mc-018 (user-04)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_006',
  id,
  'I''m a single mother in a city where gun violence is a daily reality. Untraceable ghost guns terrify me. My kid deserves to play outside without me wondering if today''s the day.',
  '2026-03-07T05:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'diana.morales@example.com';

-- mc-019 (user-05)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_006',
  id,
  'As a first responder, I''ve seen what ghost guns do to investigations. When we can''t trace a weapon, cases go cold and families never get answers. Some regulations exist for good reason.',
  '2026-03-07T05:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'robert.hayes@example.com';

-- mc-020 (user-10)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_007',
  id,
  'Welcome to the club. Gun rights have never been partisan — they''re human rights. Glad more people on the left are realizing that protecting yourself isn''t a conservative value.',
  '2026-03-07T03:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'lisa.johnson@example.com';

-- mc-021 (user-07)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_007',
  id,
  'Never thought I''d consider owning a gun. But when federal agents shoot unarmed protestors, what choice do we have? This isn''t about politics anymore — it''s about survival.',
  '2026-03-07T04:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'carlos.ramirez@example.com';

-- mc-022 (user-08)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_007',
  id,
  'I''ve lived long enough to see this cycle repeat. More fear, more guns, more violence, more fear. From either side, more guns isn''t the answer. We need to break the cycle, not arm both sides of it.',
  '2026-03-07T04:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'karen.mitchell@example.com';

-- mc-023 (user-11)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_008',
  id,
  'Second Amendment rights aren''t negotiable — not for a Democrat, not for a Republican, not for anyone. If our own guy won''t stand firm, we''ll find someone who will.',
  '2026-03-07T02:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'tom.bradley@example.com';

-- mc-024 (user-02)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_008',
  id,
  'Maybe when even the NRA pushes back against a Republican president, it''s time to admit this issue is more complicated than ''us vs. them.'' We''re all just parents trying to keep our kids safe.',
  '2026-03-07T03:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'sarah.chen@example.com';

-- mc-025 (user-01)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_gun_008',
  id,
  'I''m a veteran, a father, and a gun owner who''s increasingly frustrated with both sides treating this like a football game. Real people are dying while politicians score points.',
  '2026-03-07T03:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'mike.thompson@example.com';

-- mc-026 (user-04)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_001',
  id,
  'As a healthcare worker, I''ve seen what happens when people can''t access safe medical care. Back-alley alternatives don''t stop abortions — they kill women. This ruling saves lives.',
  '2026-03-07T09:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'diana.morales@example.com';

-- mc-027 (user-03)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_001',
  id,
  'I believe life begins at conception. My faith tells me that, and so does my experience watching my own children grow. I respect the court''s process, but I think they got this one wrong.',
  '2026-03-07T09:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'james.walker@example.com';

-- mc-028 (user-08)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_001',
  id,
  'I raised my grandchildren because their mother couldn''t care for them. These decisions are never simple. Compassion should come before politics — from any direction.',
  '2026-03-07T10:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'karen.mitchell@example.com';

-- mc-029 (user-12)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_002',
  id,
  'I''m a nurse, and I''ve watched patients drive four hours to reach our clinic because everything closer has shut down. Access isn''t a political talking point — it''s a healthcare emergency.',
  '2026-03-07T08:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'rachel.kim@example.com';

-- mc-030 (user-11)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_002',
  id,
  'Fewer clinics means more women making desperate decisions. I''m pro-life, but I''m also a father. I''d want my daughter to have safe options if she ever faced that situation.',
  '2026-03-07T09:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'tom.bradley@example.com';

-- mc-031 (user-06)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_002',
  id,
  'Whatever your stance, women deserve access to accurate information and safe medical care. Closing clinics doesn''t change minds — it just removes options for the most vulnerable.',
  '2026-03-07T09:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'emily.nguyen@example.com';

-- mc-032 (user-05)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_003',
  id,
  'I served this country and nearly lost my life doing it. Veterans earned full healthcare access — that includes reproductive care. Politicians who never wore the uniform shouldn''t be making these calls for us.',
  '2026-03-07T05:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'robert.hayes@example.com';

-- mc-033 (user-01)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_003',
  id,
  'I''m a veteran too, and I believe in protecting life at every stage. The VA should reflect that. This isn''t about taking away healthcare — it''s about what kind of procedures taxpayers should fund.',
  '2026-03-07T05:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'mike.thompson@example.com';

-- mc-034 (user-10)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_003',
  id,
  'As a military family, we''ve always had our healthcare decided by bureaucrats. This is just the latest example. We deserve better than being political footballs.',
  '2026-03-07T06:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'lisa.johnson@example.com';

-- mc-035 (user-02)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_004',
  id,
  'Ballot measures give voters a direct voice. My mother''s generation fought for these rights. If we lose them because people stay home on election day, that''s on all of us.',
  '2026-03-07T04:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'sarah.chen@example.com';

-- mc-036 (user-03)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_004',
  id,
  'Voters in conservative states will show up to protect life — don''t underestimate us. My community has deep convictions and we vote on them.',
  '2026-03-07T05:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'james.walker@example.com';

-- mc-037 (user-07)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_004',
  id,
  'As a person of faith, I genuinely struggle with this issue. I believe in the sanctity of life AND in a woman''s dignity. I wish our political system allowed for that kind of nuance.',
  '2026-03-07T05:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'carlos.ramirez@example.com';

-- mc-038 (user-06)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_005',
  id,
  'This is exactly what I try to teach my students — look at the data, not just the loudest voices. When 63% of Americans want abortion legal in most cases, laws banning it completely don''t represent the people.',
  '2026-03-07T04:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'emily.nguyen@example.com';

-- mc-039 (user-11)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_005',
  id,
  'In my small town, opinions on this are far more varied than outsiders assume. Not everyone at church agrees, and not everyone at the diner disagrees. Real life isn''t cable news.',
  '2026-03-07T04:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'tom.bradley@example.com';

-- mc-040 (user-09)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_005',
  id,
  'As a healthcare worker, I''ve learned that policy works best when it follows evidence, not emotion. This analysis shows we''re doing neither.',
  '2026-03-07T05:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'david.park@example.com';

-- mc-041 (user-04)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_006',
  id,
  'Shield laws exist because patients were being criminalized for seeking legal care. As a healthcare worker, I''ve seen the fear in patients'' eyes. These protections are literally saving lives.',
  '2026-03-07T03:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'diana.morales@example.com';

-- mc-042 (user-11)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_006',
  id,
  'I''m pro-life and I don''t like these shield laws. But I also don''t want the government tracking which state my daughter drives to for medical care. Privacy matters regardless of your politics.',
  '2026-03-07T04:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'tom.bradley@example.com';

-- mc-043 (user-08)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_006',
  id,
  'I''ve seen families torn apart by both unwanted pregnancies and by abortions. There''s pain on every side of this. I wish we could argue with more compassion.',
  '2026-03-07T04:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'karen.mitchell@example.com';

-- mc-044 (user-01)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_007',
  id,
  'I served overseas. I saw how American aid saves lives in places with nothing. Cutting healthcare funding to score political points back home is wrong, regardless of where you stand on abortion.',
  '2026-03-07T03:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'mike.thompson@example.com';

-- mc-045 (user-02)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_007',
  id,
  'My parents came here with nothing and received help from aid organizations. Cutting $30 billion in aid doesn''t just affect policy — it affects real mothers and children overseas who have no voice.',
  '2026-03-07T03:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'sarah.chen@example.com';

-- mc-046 (user-07)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_007',
  id,
  'Foreign aid should support basic healthcare everywhere. Tying billions in humanitarian assistance to a single domestic political issue punishes the world''s poorest people.',
  '2026-03-07T04:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'carlos.ramirez@example.com';

-- mc-047 (user-12)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_008',
  id,
  'Missouri voters already chose reproductive freedom in 2024. Putting it back on the ballot a year later is an insult to democracy. The people spoke — listen.',
  '2026-03-07T02:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'rachel.kim@example.com';

-- mc-048 (user-10)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_008',
  id,
  'The 2024 measure was confusingly worded. This new amendment is clearer about what''s actually being decided. People deserve to vote on language they can understand.',
  '2026-03-07T03:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'lisa.johnson@example.com';

-- mc-049 (user-08)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_abortion_008',
  id,
  'I''ve raised children who weren''t mine because life is complicated. I''ve also buried friends who died from unsafe procedures decades ago. Both things are true, and both deserve respect.',
  '2026-03-07T03:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'karen.mitchell@example.com';

-- mc-050 (user-11)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_001',
  id,
  'I''m a farmer. I see the weather changing with my own eyes — drought, floods, heat waves. But repealing regulations without replacing them with anything isn''t a climate policy. It''s just politics.',
  '2026-03-07T08:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'tom.bradley@example.com';

-- mc-051 (user-09)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_001',
  id,
  'I have a respiratory condition. Air quality regulations aren''t abstract policy for me — they''re the difference between a good day and an ER visit. Repealing the endangerment finding puts lives like mine at risk.',
  '2026-03-07T08:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'david.park@example.com';

-- mc-052 (user-02)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_001',
  id,
  'Repealing the scientific basis for regulation doesn''t change the science. It just removes our ability to respond to it. My students will inherit these decisions.',
  '2026-03-07T09:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'sarah.chen@example.com';

-- mc-053 (user-03)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_002',
  id,
  'Regulations cost money, and those costs get passed straight to families like mine. I care about clean air, but I also need to feed my kids. Not everyone can afford to be an environmentalist.',
  '2026-03-07T07:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'james.walker@example.com';

-- mc-054 (user-04)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_002',
  id,
  'I treat children with asthma worsened by pollution in my ER every week. The health costs of pollution are real — I see them in tiny lungs struggling to breathe. Ignoring those costs doesn''t make them disappear.',
  '2026-03-07T07:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'diana.morales@example.com';

-- mc-055 (user-10)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_002',
  id,
  'I run a small business and I worry about regulation costs too. But I also grew up next to a factory that poisoned our water. There''s got to be a middle ground between no rules and overreach.',
  '2026-03-07T08:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'lisa.johnson@example.com';

-- mc-056 (user-01)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_003',
  id,
  'Courts shouldn''t be making energy policy — that''s Congress''s job. I respect the legal precedent, but 19 years later we still don''t have legislation. That''s the real failure.',
  '2026-03-07T06:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'mike.thompson@example.com';

-- mc-057 (user-06)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_003',
  id,
  'The science was clear in 2007 and it''s only gotten clearer since. At some point we have to stop debating whether the problem exists and start debating solutions.',
  '2026-03-07T06:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'emily.nguyen@example.com';

-- mc-058 (user-05)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_003',
  id,
  'As a first responder, I''ve seen wildfire devastation that would''ve been unthinkable 20 years ago. I don''t care who regulates it — courts, Congress, whoever — just do something before more communities burn.',
  '2026-03-07T07:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'robert.hayes@example.com';

-- mc-059 (user-03)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_004',
  id,
  'Clean energy makes practical sense for ranchers like me — lower costs, energy independence, less reliance on volatile markets. You don''t need to believe in climate models to see the practical benefits.',
  '2026-03-07T04:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'james.walker@example.com';

-- mc-060 (user-06)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_004',
  id,
  'The shift from ideology to pragmatism is encouraging. Energy security benefits everyone regardless of political affiliation. Maybe this is where we finally find common ground.',
  '2026-03-07T04:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'emily.nguyen@example.com';

-- mc-061 (user-11)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_004',
  id,
  'Net zero was always unrealistic for farming communities — you can''t electrify a combine harvester in 2035. But solar on the barn? Wind turbines leasing my back forty? That''s real money in my pocket.',
  '2026-03-07T05:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'tom.bradley@example.com';

-- mc-062 (user-01)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_005',
  id,
  '86 GW of new capacity is incredible. The market is speaking — renewables are just good business now. As a small business owner, I follow the money, and the money says clean energy wins.',
  '2026-03-07T03:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'mike.thompson@example.com';

-- mc-063 (user-10)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_005',
  id,
  'My small business switched to solar last year. Cut our energy costs by 40%. This isn''t about being liberal or conservative — it''s about the bottom line.',
  '2026-03-07T03:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'lisa.johnson@example.com';

-- mc-064 (user-11)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_005',
  id,
  'Sounds great on paper, but rural areas need reliable baseload power. Solar doesn''t work when it''s January in Montana and the sun sets at 4 PM. We need all-of-the-above, not one-size-fits-all.',
  '2026-03-07T04:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'tom.bradley@example.com';

-- mc-065 (user-03)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_006',
  id,
  'The EPA has been overreaching for years, especially on small farmers. Streamlining regulations isn''t anti-environment — it''s pro–common sense. Let us farm without a federal permission slip.',
  '2026-03-07T02:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'james.walker@example.com';

-- mc-066 (user-07)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_006',
  id,
  'Clean air and clean water are moral issues, not political ones. As a person of faith, I believe we''re stewards of this earth. Gutting protections isn''t deregulation — it''s abandonment.',
  '2026-03-07T03:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'carlos.ramirez@example.com';

-- mc-067 (user-08)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_006',
  id,
  'My grandkids need clean air. But my neighbors need their jobs at the plant. When I hear ''deregulation,'' I think of both. I wish more politicians did too.',
  '2026-03-07T03:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'karen.mitchell@example.com';

-- mc-068 (user-11)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_007',
  id,
  'Elected officials should make these decisions, not unelected bureaucrats. If people want climate policy, vote for it. That''s how democracy works.',
  '2026-03-07T02:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'tom.bradley@example.com';

-- mc-069 (user-02)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_007',
  id,
  'Science isn''t partisan. We don''t vote on gravity and we shouldn''t vote on whether CO2 traps heat. Evidence-based policy shouldn''t depend on which party wins an election.',
  '2026-03-07T02:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'sarah.chen@example.com';

-- mc-070 (user-05)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_007',
  id,
  'I''ve seen both economic hardship in dying factory towns and environmental disaster in wildfire zones. The people arguing loudest on both sides have usually experienced neither.',
  '2026-03-07T03:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'robert.hayes@example.com';

-- mc-071 (user-04)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_008',
  id,
  'I treat heat exhaustion patients every summer, and the numbers are getting worse every year. This isn''t a distant future problem — it''s happening in my ER right now, and the patients are getting younger.',
  '2026-03-07T02:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'diana.morales@example.com';

-- mc-072 (user-11)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_008',
  id,
  'We''ve lost crops to extreme heat three of the last five summers. I don''t need a scientist to tell me something''s changing — I can see it from my tractor. Whatever we call it, we need to adapt.',
  '2026-03-07T02:30:00Z'::timestamptz
FROM auth.users
WHERE email = 'tom.bradley@example.com';

-- mc-073 (user-08)
INSERT INTO comments (report_id, user_id, content, created_at)
SELECT
  'rp_climate_008',
  id,
  'My grandchildren can''t play outside on the hottest summer days anymore. That wasn''t the case when I was raising my own kids. Something has changed, and pretending otherwise won''t protect them.',
  '2026-03-07T03:00:00Z'::timestamptz
FROM auth.users
WHERE email = 'karen.mitchell@example.com';


-- ========================================
-- Verify import results
-- ========================================

SELECT
  COUNT(*) as total_comments,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT report_id) as unique_reports
FROM comments;

-- Expected output:
-- total_comments: 73
-- unique_users: 12

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

