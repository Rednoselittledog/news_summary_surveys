'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VideoEmbed from '@/components/VideoEmbed';
import ProgressIndicator from '@/components/ProgressIndicator';
import StarRating from '@/components/StarRating';
import { useSurveyStore } from '@/lib/store';
import { MODEL_NAMES } from '@/lib/data';
import { ModelName } from '@/lib/types';
import { saveRatingResponse } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';

const CRITERIA = [
  { key: 'accuracy', label: 'ความแม่นยำ (Accuracy)' },
  { key: 'completeness', label: 'ความครบถ้วน (Completeness)' },
  { key: 'conciseness', label: 'ความกระชับ (Conciseness)' },
  { key: 'readability', label: 'ความอ่านง่าย (Readability)' }
] as const;

type CriteriaKey = typeof CRITERIA[number]['key'];

export default function RatePage() {
  const router = useRouter();
  const {
    selectedNews,
    currentIndex,
    newsCount,
    sessionId,
    ratingAnswers,
    addRatingAnswer,
    nextNews,
    isLastNews,
    getCurrentNews
  } = useSurveyStore();

  const [ratings, setRatings] = useState<
    Record<ModelName, Record<CriteriaKey, number>>
  >({
    gpt: { accuracy: 0, completeness: 0, conciseness: 0, readability: 0 },
    pathumma: { accuracy: 0, completeness: 0, conciseness: 0, readability: 0 },
    qwen: { accuracy: 0, completeness: 0, conciseness: 0, readability: 0 },
    typhoon: { accuracy: 0, completeness: 0, conciseness: 0, readability: 0 }
  });

  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentNews = getCurrentNews();

  // Reset ratings when news changes
  useEffect(() => {
    setRatings({
      gpt: { accuracy: 0, completeness: 0, conciseness: 0, readability: 0 },
      pathumma: { accuracy: 0, completeness: 0, conciseness: 0, readability: 0 },
      qwen: { accuracy: 0, completeness: 0, conciseness: 0, readability: 0 },
      typhoon: { accuracy: 0, completeness: 0, conciseness: 0, readability: 0 }
    });
    setError('');
  }, [currentIndex]);

  // Redirect if no news selected
  useEffect(() => {
    if (selectedNews.length === 0) {
      router.push('/');
    }
  }, [selectedNews, router]);

  if (!currentNews) {
    return null;
  }

  const handleRatingChange = (
    model: ModelName,
    criteria: CriteriaKey,
    value: number
  ) => {
    setRatings((prev) => ({
      ...prev,
      [model]: {
        ...prev[model],
        [criteria]: value
      }
    }));
  };

  const validateRatings = (): boolean => {
    for (const model of MODEL_NAMES) {
      for (const { key } of CRITERIA) {
        if (ratings[model][key] === 0) {
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateRatings()) {
      setError('กรุณาให้คะแนนครบทุกโมเดลและทุกหัวข้อ');
      return;
    }

    // Save answer
    addRatingAnswer({
      newsId: currentNews.id,
      category: currentNews.category,
      modelRatings: ratings
    });

    setError('');

    if (!isLastNews()) {
      nextNews();
    }
  };

  const handleSubmit = async () => {
    if (!validateRatings()) {
      setError('กรุณาให้คะแนนครบทุกโมเดลและทุกหัวข้อ');
      return;
    }

    // Add last answer
    const finalAnswer = {
      newsId: currentNews.id,
      category: currentNews.category,
      modelRatings: ratings
    };

    const allAnswers = [...ratingAnswers, finalAnswer];

    if (!sessionId) {
      setError('เกิดข้อผิดพลาด: ไม่พบ session ID');
      return;
    }

    setIsSubmitting(true);

    try {
      await saveRatingResponse(sessionId, newsCount, allAnswers);
      router.push('/thank-you');
    } catch (err) {
      console.error('Error saving response:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองอีกครั้ง');
      setIsSubmitting(false);
    }
  };

  const getModelDisplayName = (model: ModelName): string => {
    const names: Record<ModelName, string> = {
      gpt: 'GPT',
      pathumma: 'Pathumma',
      qwen: 'Qwen',
      typhoon: 'Typhoon'
    };
    return names[model];
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Progress */}
        <ProgressIndicator current={currentIndex + 1} total={selectedNews.length} />

        {/* Video */}
        <Card>
          <CardContent className="p-6">
            <VideoEmbed url={currentNews.url} />
          </CardContent>
        </Card>

        {/* Ratings */}
        <Card>
          <CardHeader>
            <CardTitle>ให้คะแนนสรุปข่าวของแต่ละโมเดล</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {MODEL_NAMES.map((model) => (
              <div key={model} className="space-y-4 pb-6 border-b last:border-b-0">
                {/* Model Name */}
                {/*
                <h3 className="text-xl font-bold text-primary">
                  โมเดล: {getModelDisplayName(model)}
                </h3>
                */}

                {/* Summary */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="body-text whitespace-pre-wrap">
                    {currentNews.summaries[model]}
                  </p>
                </div>

                {/* Rating Criteria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {CRITERIA.map(({ key, label }) => (
                    <StarRating
                      key={key}
                      label={label}
                      value={ratings[model][key]}
                      onChange={(value) => handleRatingChange(model, key, value)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              {!isLastNews() ? (
                <Button onClick={handleNext} className="w-full" size="lg">
                  ถัดไป
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งคำตอบ'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
