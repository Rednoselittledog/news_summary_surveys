import { createClient } from './supabase/client';
import { RatingAnswer, Demographics } from './types';

// Get Supabase client instance
function getSupabaseClient() {
  return createClient();
}

export async function saveRatingResponse(
  sessionId: string,
  newsCount: number,
  answers: RatingAnswer[],
  demographics: Demographics
) {
  const supabase = getSupabaseClient();

  console.log('Saving rating response:', {
    sessionId,
    newsCount,
    answersCount: answers.length,
    demographics
  });

  // Insert survey response with demographics
  const { data: surveyData, error: surveyError } = await supabase
    .from('survey_responses')
    .insert({
      session_id: sessionId,
      news_count: newsCount,
      age: demographics.age,
      gender: demographics.gender,
      occupation: demographics.occupation
    })
    .select()
    .single();

  if (surveyError) {
    console.error('Survey response error:', surveyError);
    throw new Error(`Failed to save survey response: ${surveyError.message || JSON.stringify(surveyError)}`);
  }

  // Flatten rating answers for database
  const ratingsToInsert = answers.flatMap((answer) =>
    Object.entries(answer.modelRatings).map(([modelName, ratings]) => ({
      session_id: sessionId,
      news_category: answer.category,
      news_id: answer.newsId,
      model_name: modelName,
      accuracy_score: ratings.accuracy,
      completeness_score: ratings.completeness,
      conciseness_score: ratings.conciseness,
      readability_score: ratings.readability
    }))
  );

  console.log('Inserting ratings:', ratingsToInsert.length, 'records');

  const { error: ratingsError } = await supabase
    .from('rating_answers')
    .insert(ratingsToInsert);

  if (ratingsError) {
    console.error('Rating answers error:', ratingsError);
    throw new Error(`Failed to save ratings: ${ratingsError.message || JSON.stringify(ratingsError)}`);
  }

  console.log('Successfully saved rating response');
  return surveyData;
}
