'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import VideoEmbed from '@/components/VideoEmbed';
import StarRating from '@/components/StarRating';
import { useSurveyStore } from '@/lib/store';
import { ModelName } from '@/lib/types';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const CRITERIA = [
  { key: 'accuracy', label: 'ความถูกต้อง' },
  { key: 'completeness', label: 'ความครบถ้วน' },
  { key: 'conciseness', label: 'ความกระชับ' },
  { key: 'readability', label: 'ความอ่านง่าย' }
] as const;

type CriteriaKey = typeof CRITERIA[number]['key'];

const MODEL_COLORS = [
  'var(--model-color-1)', // เขียว
  'var(--model-color-2)', // น้ำเงิน
  'var(--model-color-3)', // ส้ม
  'var(--model-color-4)'  // ม่วง
];

export default function RatePage() {
  const router = useRouter();
  const {
    selectedNews,
    currentIndex,
    sessionId,
    shuffledModels,
    addRatingAnswer,
    nextNews,
    previousNews,
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

  const currentNews = getCurrentNews();
  const modelsOrder = currentNews ? shuffledModels[currentNews.id] || [] : [];

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
    setError('');
  };

  const validateRatings = (): boolean => {
    for (const model of modelsOrder) {
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
      setError('กรุณาให้คะแนนทุกหัวข้อของทุกสรุปก่อนดำเนินการต่อ');
      return;
    }

    // Save answer
    addRatingAnswer({
      newsId: currentNews.id,
      category: currentNews.category,
      modelRatings: ratings
    });

    // Navigate
    if (isLastNews()) {
      // Go to demographics form
      router.push('/demographics');
    } else {
      nextNews();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      previousNews();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-foreground">
              ข่าวที่ {currentIndex + 1} จาก {selectedNews.length}
            </h2>
            <div className="text-sm text-muted-foreground">
              เซสชัน: {sessionId?.slice(0, 8)}...
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / selectedNews.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Video */}
        <Card className="mb-6 overflow-hidden">
          <VideoEmbed url={currentNews.url} />
        </Card>

        {/* Summaries with Ratings */}
        <div className="space-y-6">
          {modelsOrder.map((model, index) => {
            const color = MODEL_COLORS[index];
            const summary = currentNews.summaries[model];

            return (
              <Card
                key={model}
                className="overflow-hidden border-2 transition-all hover:shadow-lg"
                style={{ borderColor: color }}
              >
                {/* All Layouts: Flex for responsive layout */}
                <div className="flex flex-col md:flex-row">
                  {/* Summary - Left on Desktop, Top on Mobile */}
                  <div
                    className="p-6 md:flex-[2]"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${color} 5%, white)`
                    }}
                  >
                    <div
                      className="inline-block px-3 py-1 rounded-full text-white text-sm font-semibold mb-4"
                      style={{ backgroundColor: color }}
                    >
                      สรุปที่ {index + 1}
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {summary}
                    </p>
                  </div>

                  {/* Ratings - Right on Desktop, Bottom on Mobile */}
                  <div className="border-t-2 md:border-t-0 md:border-l-2 p-6 bg-card md:flex-[1] md:min-w-[400px]" style={{ borderColor: color }}>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">
                      ให้คะแนน
                    </h3>
                    <div className="space-y-4">
                      {CRITERIA.map(({ key, label }) => (
                        <div key={key}>
                          <label className="text-sm font-medium text-foreground block mb-2">
                            {label}
                          </label>
                          <StarRating
                            value={ratings[model][key]}
                            onChange={(value) => handleRatingChange(model, key, value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mt-6 p-4 bg-destructive/10 border-destructive">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            ก่อนหน้า
          </Button>

          <Button
            onClick={handleNext}
            size="lg"
            className="gap-2 min-w-[200px]"
          >
            {isLastNews() ? 'ถัดไป: กรอกข้อมูล' : 'ข่าวถัดไป'}
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
