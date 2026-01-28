'use client';

import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useSurveyStore } from '@/lib/store';
import { loadNewsData, selectNewsItems, shuffleModels, MODEL_NAMES } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { setSessionId, setSelectedNews, setShuffledModels } = useSurveyStore();

  const handleStart = async () => {
    try {
      // Generate session ID
      const sessionId = uuidv4();
      setSessionId(sessionId);

      // Load and select news (always 5 items)
      const newsData = await loadNewsData();
      const selected = selectNewsItems(newsData);
      setSelectedNews(selected);

      // Shuffle models for each news item
      selected.forEach((news) => {
        const shuffled = shuffleModels([...MODEL_NAMES]);
        setShuffledModels(news.id, shuffled);
      });

      // Navigate to rating page
      router.push('/rate');
    } catch (error) {
      console.error('Error starting survey:', error);
      alert('เกิดข้อผิดพลาดในการเริ่มแบบทดสอบ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-4xl mx-auto">
        <Card className="p-8 md:p-12 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              แบบทดสอบประเมินคุณภาพ<br />สรุปข่าวจาก AI
            </h1>
            <p className="text-lg text-muted-foreground">
              ช่วยเราประเมินประสิทธิภาพของโมเดล AI ในการสรุปข่าว
            </p>
          </div>

          {/* Description */}
          <div className="mb-8 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">📋 วิธีการทำแบบทดสอบ</h2>
              <p className="text-base text-foreground leading-relaxed">
                คุณจะได้ดูคลิปข่าวทั้งหมด <span className="font-semibold text-primary">5 คลิป</span> โดยแต่ละคลิปจะมีสรุปข่าวจาก AI 4 แบบที่แตกต่างกัน
                คุณจะต้องดูคลิปและอ่านสรุปทั้ง 4 แบบ จากนั้นให้คะแนนแต่ละสรุปตามเกณฑ์ที่กำหนด
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">⭐ เกณฑ์การให้คะแนน (1-5 ดาว)</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">ความถูกต้อง (Accuracy)</h3>
                    <p className="text-sm text-muted-foreground">
                      ข้อมูลในสรุปตรงกับเนื้อหาในคลิปข่าวหรือไม่
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">ความครบถ้วน (Completeness)</h3>
                    <p className="text-sm text-muted-foreground">
                      สรุปครอบคลุมประเด็นสำคัญทั้งหมดในข่าวหรือไม่
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">ความกระชับ (Conciseness)</h3>
                    <p className="text-sm text-muted-foreground">
                      สรุปได้ใจความโดยไม่ซ้ำซ้อนหรือยืดยาว
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">ความอ่านง่าย (Readability)</h3>
                    <p className="text-sm text-muted-foreground">
                      ใช้ภาษาที่เข้าใจง่าย ไม่สับสนหรือซับซ้อน
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">💡 หมายเหตุ</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• สรุปแต่ละแบบจะแสดงด้วยสีต่างกัน เพื่อให้แยกแยะได้ง่าย</li>
                <li>• คุณไม่จำเป็นต้องรู้ว่าสรุปไหนมาจากโมเดลใด</li>
                <li>• ใช้เวลาประมาณ 10-15 นาทีในการทำแบบทดสอบทั้งหมด</li>
                <li>• ข้อมูลของคุณจะถูกเก็บเป็นความลับและใช้เพื่อการวิจัยเท่านั้น</li>
              </ul>
            </div>
          </div>

          {/* Start Button */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleStart}
              size="lg"
              className="w-full md:w-auto px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              เริ่มทำแบบทดสอบ
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
