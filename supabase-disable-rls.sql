-- ============================================
-- Disable RLS for Development
-- ============================================
-- Use this ONLY for development/testing
-- For production, you should fix the RLS policies instead

ALTER TABLE survey_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE compare_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE rating_answers DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('survey_responses', 'compare_answers', 'rating_answers');

-- Expected result: rowsecurity = false for all tables
