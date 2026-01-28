'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSurveyStore } from '@/lib/store';
import { loadNewsData, selectNewsItems } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';
import { ArrowRight, CheckCircle2, Star } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [selectedCount, setSelectedCount] = useState<string>('6');
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const { setNewsCount, setMode, setSelectedNews, setSessionId } = useSurveyStore();

  const newsCountOptions = [
    { value: '3', label: '3 ข่าว (1 ข่าว/หมวด)' },
    { value: '6', label: '6 ข่าว (2 ข่าว/หมวด)' },
    { value: '9', label: '9 ข่าว (3 ข่าว/หมวด)' },
    { value: '12', label: '12 ข่าว (4 ข่าว/หมวด)' },
    { value: '15', label: '15 ข่าว (5 ข่าว/หมวด - ทั้งหมด)' }
  ];

  const handleStart = async (mode: 'compare' | 'rate') => {
    const count = parseInt(selectedCount);
    const sessionId = uuidv4();

    // Load news data
    const newsData = await loadNewsData();
    const selected = selectNewsItems(newsData, count);

    // Update store
    setNewsCount(count);
    setMode(mode);
    setSelectedNews(selected);
    setSessionId(sessionId);

    // Navigate to appropriate page
    router.push(`/${mode}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-3xl">
        {/* Header with animation */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4 animate-pulse">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="heading-primary bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            แบบสำรวจการประเมินสรุปข่าว
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ช่วยเราประเมินคุณภาพการสรุปข่าวจาก AI โมเดลต่างๆ
            เพื่อพัฒนาระบบสรุปข่าวให้ดียิ่งขึ้น
          </p>
        </div>

        <Card className="shadow-xl border-primary/20 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="text-center border-b bg-primary/5">
            <CardTitle className="text-2xl">เริ่มต้นการประเมิน</CardTitle>
            <CardDescription className="text-base">
              เลือกจำนวนข่าวและรูปแบบการประเมินที่คุณต้องการ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            {/* News Count Selection with Dropdown */}
            <div className="space-y-4">
              <label className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                เลือกจำนวนข่าว
              </label>
              <Select value={selectedCount} onValueChange={setSelectedCount}>
                <SelectTrigger className="h-14 text-lg border-2 hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="เลือกจำนวนข่าว" />
                </SelectTrigger>
                <SelectContent>
                  {newsCountOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-base py-3 cursor-pointer"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground pl-10">
                ข่าวจะมาจาก 3 หมวด:{' '}
                <span className="font-semibold text-foreground">สังคม</span>,{' '}
                <span className="font-semibold text-foreground">เศรษฐกิจ</span>, และ{' '}
                <span className="font-semibold text-foreground">เทคโนโลยี</span>
              </p>
            </div>

            {/* Mode Selection with Enhanced Cards */}
            <div className="space-y-4">
              <label className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                เลือกรูปแบบการประเมิน
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Compare Mode Card */}
                <button
                  onClick={() => handleStart('compare')}
                  onMouseEnter={() => setHoveredMode('compare')}
                  onMouseLeave={() => setHoveredMode(null)}
                  className="group relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-left transition-all duration-300 hover:border-primary hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                          <CheckCircle2 className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            เลือกโมเดลที่ดีที่สุด
                          </h3>
                        </div>
                      </div>
                      <ArrowRight className={`w-6 h-6 text-primary transition-transform duration-300 ${hoveredMode === 'compare' ? 'translate-x-1' : ''}`} />
                    </div>
                    <p className="text-muted-foreground">
                      เปรียบเทียบและเลือกสรุปที่คุณคิดว่าดีที่สุดจาก 4 โมเดล
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        เลือก 1 จาก 4
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                        ⚡ รวดเร็ว
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                {/* Rating Mode Card */}
                <button
                  onClick={() => handleStart('rate')}
                  onMouseEnter={() => setHoveredMode('rate')}
                  onMouseLeave={() => setHoveredMode(null)}
                  className="group relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-left transition-all duration-300 hover:border-primary hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                          <Star className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            ให้คะแนนแต่ละโมเดล
                          </h3>
                        </div>
                      </div>
                      <ArrowRight className={`w-6 h-6 text-primary transition-transform duration-300 ${hoveredMode === 'rate' ? 'translate-x-1' : ''}`} />
                    </div>
                    <p className="text-muted-foreground">
                      ให้คะแนนทุกโมเดลใน 4 หัวข้อ เพื่อประเมินแบบละเอียด
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                        <Star className="w-3 h-3" />
                        4 หัวข้อ
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                        📊 ละเอียด
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </div>

            {/* Info Footer */}
            <div className="pt-6 border-t border-primary/20">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-bold">!</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    ใช้เวลาประมาณ {selectedCount === '3' ? '5-10' : selectedCount === '6' ? '10-15' : selectedCount === '9' ? '15-20' : selectedCount === '12' ? '20-25' : '25-30'} นาที
                  </p>
                  <p className="text-sm text-muted-foreground">
                    คุณสามารถดูวิดีโอข่าวและอ่านสรุปจากแต่ละโมเดลก่อนตัดสินใจ
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
