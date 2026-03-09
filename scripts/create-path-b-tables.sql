-- ========================================
-- Create Path B Tables (Topics & Polling Data)
-- Execute BEFORE import-all-data.sql
-- ========================================

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id text PRIMARY KEY,
  name text NOT NULL,
  scope text NOT NULL,
  tag_keywords text[],
  created_at timestamptz DEFAULT now()
);

-- Create polling_data table
CREATE TABLE IF NOT EXISTS polling_data (
  id text PRIMARY KEY,
  topic_id text NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  source text NOT NULL,
  survey_year integer NOT NULL,
  geographic_scope text NOT NULL,
  scale_labels text[] NOT NULL,
  distribution integer[] NOT NULL,
  bridging_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for polling_data
CREATE INDEX IF NOT EXISTS idx_polling_topic_id ON polling_data(topic_id);

-- Add topic_id column to reports table (if not exists)
DO $$
BEGIN
  -- First, add the column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'topic_id'
  ) THEN
    ALTER TABLE reports ADD COLUMN topic_id text;
  END IF;

  -- Then, add the foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_reports_topic'
  ) THEN
    ALTER TABLE reports ADD CONSTRAINT fk_reports_topic
      FOREIGN KEY (topic_id) REFERENCES topics(id);
  END IF;
END $$;

-- Verify tables created
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('topics', 'polling_data', 'reports', 'events', 'comments', 'profiles')
ORDER BY table_name;
