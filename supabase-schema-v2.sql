-- Survey App Schema v2
-- Updated schema with demographics and rating-only mode

-- Drop ALL existing views first (to avoid column conflicts)
DROP VIEW IF EXISTS model_performance_by_demographics;
DROP VIEW IF EXISTS demographics_stats;
DROP VIEW IF EXISTS category_rating_stats;
DROP VIEW IF EXISTS rating_model_stats;
DROP VIEW IF EXISTS compare_model_stats;
DROP VIEW IF EXISTS category_compare_stats;

-- Drop old compare-related table
DROP TABLE IF EXISTS compare_answers;

-- Update survey_responses table
-- Remove mode column and add demographics fields
ALTER TABLE survey_responses
DROP COLUMN IF EXISTS mode;

-- Drop old check constraint if exists
ALTER TABLE survey_responses
DROP CONSTRAINT IF EXISTS survey_responses_news_count_check;

-- Delete old test data that doesn't match new constraint (optional - comment out if you want to keep old data)
DELETE FROM rating_answers WHERE session_id IN (
  SELECT session_id FROM survey_responses WHERE news_count != 5
);
DELETE FROM survey_responses WHERE news_count != 5;

-- Add new check constraint for exactly 5 news items
ALTER TABLE survey_responses
ADD CONSTRAINT survey_responses_news_count_check CHECK (news_count = 5);

ALTER TABLE survey_responses
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS occupation TEXT;

-- rating_answers table remains the same
-- No changes needed to this table

-- Create updated views for rating statistics

-- View: Rating statistics by model
CREATE VIEW rating_model_stats AS
SELECT
  ra.model_name,
  COUNT(DISTINCT ra.session_id) as total_responses,
  ROUND(AVG(ra.accuracy_score)::numeric, 2) as avg_accuracy,
  ROUND(AVG(ra.completeness_score)::numeric, 2) as avg_completeness,
  ROUND(AVG(ra.conciseness_score)::numeric, 2) as avg_conciseness,
  ROUND(AVG(ra.readability_score)::numeric, 2) as avg_readability,
  ROUND(
    (AVG(ra.accuracy_score) +
     AVG(ra.completeness_score) +
     AVG(ra.conciseness_score) +
     AVG(ra.readability_score)) / 4::numeric,
    2
  ) as avg_overall
FROM rating_answers ra
GROUP BY ra.model_name
ORDER BY avg_overall DESC;

-- View: Rating statistics by category
CREATE VIEW category_rating_stats AS
SELECT
  ra.news_category,
  ra.model_name,
  COUNT(*) as rating_count,
  ROUND(AVG(ra.accuracy_score)::numeric, 2) as avg_accuracy,
  ROUND(AVG(ra.completeness_score)::numeric, 2) as avg_completeness,
  ROUND(AVG(ra.conciseness_score)::numeric, 2) as avg_conciseness,
  ROUND(AVG(ra.readability_score)::numeric, 2) as avg_readability,
  ROUND(
    (AVG(ra.accuracy_score) +
     AVG(ra.completeness_score) +
     AVG(ra.conciseness_score) +
     AVG(ra.readability_score)) / 4::numeric,
    2
  ) as avg_overall
FROM rating_answers ra
GROUP BY ra.news_category, ra.model_name
ORDER BY ra.news_category, avg_overall DESC;

-- View: Demographics statistics
CREATE VIEW demographics_stats AS
SELECT
  age,
  gender,
  occupation,
  COUNT(*) as response_count
FROM survey_responses
WHERE age IS NOT NULL
GROUP BY age, gender, occupation
ORDER BY response_count DESC;

-- View: Model performance by demographics
CREATE VIEW model_performance_by_demographics AS
SELECT
  sr.age,
  sr.gender,
  sr.occupation,
  ra.model_name,
  COUNT(*) as rating_count,
  ROUND(AVG(ra.accuracy_score)::numeric, 2) as avg_accuracy,
  ROUND(AVG(ra.completeness_score)::numeric, 2) as avg_completeness,
  ROUND(AVG(ra.conciseness_score)::numeric, 2) as avg_conciseness,
  ROUND(AVG(ra.readability_score)::numeric, 2) as avg_readability,
  ROUND(
    (AVG(ra.accuracy_score) +
     AVG(ra.completeness_score) +
     AVG(ra.conciseness_score) +
     AVG(ra.readability_score)) / 4::numeric,
    2
  ) as avg_overall
FROM survey_responses sr
JOIN rating_answers ra ON sr.session_id = ra.session_id
WHERE sr.age IS NOT NULL
GROUP BY sr.age, sr.gender, sr.occupation, ra.model_name
ORDER BY avg_overall DESC;

-- Grant permissions (adjust role name as needed)
GRANT SELECT ON rating_model_stats TO anon, authenticated;
GRANT SELECT ON category_rating_stats TO anon, authenticated;
GRANT SELECT ON demographics_stats TO anon, authenticated;
GRANT SELECT ON model_performance_by_demographics TO anon, authenticated;
