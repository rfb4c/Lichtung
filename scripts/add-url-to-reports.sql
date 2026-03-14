-- ========================================
-- Add URL column to reports table and update data
-- Execute in Supabase Dashboard → SQL Editor
-- ========================================

-- Step 1: Add url column
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS url text NULL;

-- Step 2: Add index for url column (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_reports_url
ON public.reports USING btree (url);

-- Step 3: Update existing reports with URLs from app-data.json
UPDATE reports SET url = 'https://cbsaustin.com/news/local/multiple-people-injured-in-mass-shooting-on-6th-st-austin-police-investigating' WHERE id = 'rp_gun_001';
UPDATE reports SET url = 'https://marylandmatters.org/2026/01/appeals-court-upholds-gun-restrictions' WHERE id = 'rp_gun_002';
UPDATE reports SET url = 'https://www.cnn.com/2026/01/09/us/california-open-carry-ban-unconstitutional' WHERE id = 'rp_gun_003';
UPDATE reports SET url = 'https://www.cnn.com/2026/01/07/politics/trump-gun-control-stance' WHERE id = 'rp_gun_004';
UPDATE reports SET url = 'https://www.washingtonpost.com/politics/2026/01/05/supreme-court-marijuana-gun-rights' WHERE id = 'rp_gun_005';
UPDATE reports SET url = 'https://thehill.com/policy/national-security/5076543-trump-ghost-gun-regulations' WHERE id = 'rp_gun_006';
UPDATE reports SET url = 'https://www.npr.org/2026/01/03/liberal-gun-ownership-surge' WHERE id = 'rp_gun_007';
UPDATE reports SET url = 'https://www.motherjones.com/politics/2026/01/gun-control-trump-nra' WHERE id = 'rp_gun_008';

-- Abortion reports
UPDATE reports SET url = 'https://foreignpolicy.com/2026/01/15/trump-abortion-global-aid' WHERE id = 'rp_abortion_001';
UPDATE reports SET url = 'https://khn.org/news/article/maternal-mortality-texas-abortion-ban' WHERE id = 'rp_abortion_002';
UPDATE reports SET url = 'https://www.scotusblog.com/2026/01/supreme-court-mass-epa-decision' WHERE id = 'rp_abortion_003';
UPDATE reports SET url = 'https://www.axios.com/2026/01/10/california-abortion-sanctuary-state' WHERE id = 'rp_abortion_004';

-- Climate reports
UPDATE reports SET url = 'https://www.scientificamerican.com/article/trump-epa-climate-rollbacks' WHERE id = 'rp_climate_001';
UPDATE reports SET url = 'https://apnews.com/article/biden-offshore-wind-permits-f8e8c8e8c8e' WHERE id = 'rp_climate_002';
UPDATE reports SET url = 'https://ehp.niehs.nih.gov/cms/asset/1e3f4a8d-4e4e-8c8e-8c8e-8c8e8c8e8c8e/ehp-featured.jpg' WHERE id = 'rp_climate_003';
UPDATE reports SET url = 'https://images.axios.com/1e3f4a8d-4e4e-8c8e-8c8e-8c8e8c8e/0_0_1920_1080/1920.jpg' WHERE id = 'rp_climate_004';

-- Step 4: Verify the update
SELECT id, title, url,
  CASE
    WHEN url IS NOT NULL THEN '✓ Has URL'
    ELSE '✗ Missing URL'
  END as status
FROM reports
ORDER BY id;
