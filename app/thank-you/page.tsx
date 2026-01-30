'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useSurveyStore } from '@/lib/store';

export default function ThankYouPage() {
  const router = useRouter();
  const { reset } = useSurveyStore();

  const handleBackToHome = () => {
    reset();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-20 h-20 text-primary" />
          </div>
          <CardTitle className="heading-primary">ขอบคุณสำหรับการทำแบบสำรวจ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-lg text-muted-foreground">
            ข้อมูลได้รับการบันทึกเรียบร้อย
            <br />
            
          </p>

          <div className="pt-4">
            <Button onClick={handleBackToHome} size="lg" className="w-full md:w-auto px-8">
              กลับหน้าแรก
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
