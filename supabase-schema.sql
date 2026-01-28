-- ============================================
-- News Survey Database Schema for Supabase
-- ============================================
--
-- This schema supports two survey modes:
-- 1. Compare Mode: Users select the best summary from multiple models
-- 2. Rating Mode: Users rate each model on 4 criteria (accuracy, completeness, conciseness, readability)
--

-- Table 1: Survey Responses (Main tracking table)
-- Stores high-level information about each survey session
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL UNIQUE,
    mode TEXT NOT NULL CHECK (mode IN ('compare', 'rate')),
    news_count INTEGER NOT NULL CHECK (news_count IN (3, 6, 9, 12, 15)),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster session lookups
CREATE INDEX idx_survey_responses_session_id ON survey_responses(session_id);
CREATE INDEX idx_survey_responses_created_at ON survey_responses(created_at);

-- Table 2: Compare Answers (For Compare Mode)
-- Stores which model was selected as best for each news item
CREATE TABLE IF NOT EXISTS compare_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES survey_responses(session_id) ON DELETE CASCADE,
    news_category TEXT NOT NULL CHECK (news_category IN ('social', 'economy', 'technology')),
    news_id TEXT NOT NULL,
    selected_model TEXT NOT NULL CHECK (selected_model IN ('gpt', 'pathumma', 'qwen', 'typhoon')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analysis queries
CREATE INDEX idx_compare_answers_session_id ON compare_answers(session_id);
CREATE INDEX idx_compare_answers_selected_model ON compare_answers(selected_model);
CREATE INDEX idx_compare_answers_news_category ON compare_answers(news_category);

-- Table 3: Rating Answers (For Rating Mode)
-- Stores ratings for each model on 4 criteria
CREATE TABLE IF NOT EXISTS rating_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES survey_responses(session_id) ON DELETE CASCADE,
    news_category TEXT NOT NULL CHECK (news_category IN ('social', 'economy', 'technology')),
    news_id TEXT NOT NULL,
    model_name TEXT NOT NULL CHECK (model_name IN ('gpt', 'pathumma', 'qwen', 'typhoon')),
    accuracy_score INTEGER NOT NULL CHECK (accuracy_score BETWEEN 1 AND 5),
    completeness_score INTEGER NOT NULL CHECK (completeness_score BETWEEN 1 AND 5),
    conciseness_score INTEGER NOT NULL CHECK (conciseness_score BETWEEN 1 AND 5),
    readability_score INTEGER NOT NULL CHECK (readability_score BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analysis queries
CREATE INDEX idx_rating_answers_session_id ON rating_answers(session_id);
CREATE INDEX idx_rating_answers_model_name ON rating_answers(model_name);
CREATE INDEX idx_rating_answers_news_category ON rating_answers(news_category);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- Enable RLS on all tables
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE compare_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_answers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for survey submissions)
CREATE POLICY "Allow anonymous inserts" ON survey_responses
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON compare_answers
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON rating_answers
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow authenticated users to read all data (for analysis)
CREATE POLICY "Allow authenticated reads" ON survey_responses
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated reads" ON compare_answers
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated reads" ON rating_answers
    FOR SELECT TO authenticated
    USING (true);

-- ============================================
-- Useful Views for Analysis
-- ============================================

-- View: Model Performance in Compare Mode
CREATE OR REPLACE VIEW compare_model_stats AS
SELECT
    selected_model,
    COUNT(*) as selection_count,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as selection_percentage
FROM compare_answers
GROUP BY selected_model
ORDER BY selection_count DESC;

-- View: Model Performance in Rating Mode
CREATE OR REPLACE VIEW rating_model_stats AS
SELECT
    model_name,
    ROUND(AVG(accuracy_score), 2) as avg_accuracy,
    ROUND(AVG(completeness_score), 2) as avg_completeness,
    ROUND(AVG(conciseness_score), 2) as avg_conciseness,
    ROUND(AVG(readability_score), 2) as avg_readability,
    ROUND(AVG((accuracy_score + completeness_score + conciseness_score + readability_score) / 4.0), 2) as avg_overall,
    COUNT(*) as total_ratings
FROM rating_answers
GROUP BY model_name
ORDER BY avg_overall DESC;

-- View: Category Performance
CREATE OR REPLACE VIEW category_compare_stats AS
SELECT
    news_category,
    selected_model,
    COUNT(*) as selection_count
FROM compare_answers
GROUP BY news_category, selected_model
ORDER BY news_category, selection_count DESC;

COMMENT ON TABLE survey_responses IS 'Stores high-level information about each survey session';
COMMENT ON TABLE compare_answers IS 'Stores selected best models for compare mode';
COMMENT ON TABLE rating_answers IS 'Stores detailed ratings for each model in rating mode';
