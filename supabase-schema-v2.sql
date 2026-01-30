-- Survey App Schema v2
-- Complete schema with demographics and rating-only mode

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  news_count INTEGER NOT NULL CHECK (news_count = 5),
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'lgbtq', 'other')),
  occupation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rating_answers table
CREATE TABLE IF NOT EXISTS rating_answers (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES survey_responses(session_id) ON DELETE CASCADE,
  news_id TEXT NOT NULL,
  news_category TEXT NOT NULL,
  model_name TEXT NOT NULL,
  accuracy_score INTEGER NOT NULL CHECK (accuracy_score BETWEEN 1 AND 5),
  completeness_score INTEGER NOT NULL CHECK (completeness_score BETWEEN 1 AND 5),
  conciseness_score INTEGER NOT NULL CHECK (conciseness_score BETWEEN 1 AND 5),
  readability_score INTEGER NOT NULL CHECK (readability_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rating_answers_session_id ON rating_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_rating_answers_model_name ON rating_answers(model_name);
CREATE INDEX IF NOT EXISTS idx_rating_answers_category ON rating_answers(news_category);
CREATE INDEX IF NOT EXISTS idx_survey_responses_session_id ON survey_responses(session_id);

-- View: Rating statistics by model
CREATE OR REPLACE VIEW rating_model_stats AS
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
CREATE OR REPLACE VIEW category_rating_stats AS
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
CREATE OR REPLACE VIEW demographics_stats AS
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
CREATE OR REPLACE VIEW model_performance_by_demographics AS
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

-- Enable Row Level Security (RLS)
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_answers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public insert on survey_responses" ON survey_responses
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public select on survey_responses" ON survey_responses
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on rating_answers" ON rating_answers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public select on rating_answers" ON rating_answers
  FOR SELECT TO anon, authenticated
  USING (true);

-- Grant permissions on views
GRANT SELECT ON rating_model_stats TO anon, authenticated;
GRANT SELECT ON category_rating_stats TO anon, authenticated;
GRANT SELECT ON demographics_stats TO anon, authenticated;
GRANT SELECT ON model_performance_by_demographics TO anon, authenticated;
