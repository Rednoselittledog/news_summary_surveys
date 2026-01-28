'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import VideoEmbed from '@/components/VideoEmbed';
import ProgressIndicator from '@/components/ProgressIndicator';
import { useSurveyStore } from '@/lib/store';
import { shuffleModels, MODEL_NAMES } from '@/lib/data';
import { ModelName } from '@/lib/types';
import { saveCompareResponse } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';

export default function ComparePage() {
  const router = useRouter();
  const {
    selectedNews,
    currentIndex,
    newsCount,
    sessionId,
    shuffledModels,
    setShuffledModels,
    compareAnswers,
    addCompareAnswer,
    nextNews,
    isLastNews,
    getCurrentNews
  } = useSurveyStore();

  const [selectedModel, setSelectedModel] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentNews = getCurrentNews();

  // Shuffle models for current news if not already shuffled
  useEffect(() => {
    if (currentNews && !shuffledModels[currentNews.id]) {
      const shuffled = shuffleModels([...MODEL_NAMES]);
      setShuffledModels(currentNews.id, shuffled);
    }
  }, [currentNews, shuffledModels, setShuffledModels]);

  // Reset selection when news changes
  useEffect(() => {
    setSelectedModel('');
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

  const currentShuffledModels = shuffledModels[currentNews.id] || MODEL_NAMES;

  const handleNext = () => {
    if (!selectedModel) {
      setError('กรุณาเลือกสรุปข่าวที่คุณคิดว่าดีที่สุด');
      return;
    }

    // Save answer
    addCompareAnswer({
      newsId: currentNews.id,
      category: currentNews.category,
      selectedModel: selectedModel as ModelName
    });

    setError('');

    if (!isLastNews()) {
      nextNews();
    }
  };

  const handleSubmit = async () => {
    if (!selectedModel) {
      setError('กรุณาเลือกสรุปข่าวที่คุณคิดว่าดีที่สุด');
      return;
    }

    // Add last answer
    const finalAnswer = {
      newsId: currentNews.id,
      category: currentNews.category,
      selectedModel: selectedModel as ModelName
    };

    const allAnswers = [...compareAnswers, finalAnswer];

    if (!sessionId) {
      setError('เกิดข้อผิดพลาด: ไม่พบ session ID');
      return;
    }

    setIsSubmitting(true);

    try {
      await saveCompareResponse(sessionId, newsCount, allAnswers);
      router.push('/thank-you');
    } catch (err) {
      console.error('Error saving response:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองอีกครั้ง');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Progress */}
        <ProgressIndicator current={currentIndex + 1} total={selectedNews.length} />

        {/* Video */}
        <Card>
          <CardContent className="p-6">
            <VideoEmbed url={currentNews.url} />
          </CardContent>
        </Card>

        {/* Summaries */}
        <Card>
          <CardHeader>
            <CardTitle>เลือกสรุปข่าวที่คุณคิดว่าดีที่สุด</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={selectedModel} onValueChange={setSelectedModel}>
              <div className="space-y-4">
                {currentShuffledModels.map((model, index) => (
                  <div key={model}>
                    <RadioGroupItem
                      value={model}
                      id={`model-${index}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`model-${index}`}
                      className="flex cursor-pointer rounded-lg border-2 border-muted bg-card p-6 hover:bg-accent/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all duration-200"
                    >
                      <div className="space-y-2 w-full">
                        <div className="font-semibold text-sm text-muted-foreground">
                          ตัวเลือก {index + 1}
                        </div>
                        <p className="body-text whitespace-pre-wrap">
                          {currentNews.summaries[model]}
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

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
