'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSurveyStore } from '@/lib/store';
import { OCCUPATIONS, Demographics } from '@/lib/types';
import { saveRatingResponse } from '@/lib/supabase';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function DemographicsPage() {
  const router = useRouter();
  const {
    sessionId,
    ratingAnswers,
    selectedNews,
    setDemographics,
    demographics
  } = useSurveyStore();

  const [age, setAge] = useState<string>(demographics?.age.toString() || '');
  const [gender, setGender] = useState<string>(demographics?.gender || '');
  const [occupation, setOccupation] = useState<string>(demographics?.occupation || '');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if no answers
  useEffect(() => {
    if (ratingAnswers.length === 0) {
      router.push('/');
    }
  }, [ratingAnswers, router]);

  const validateForm = (): string | null => {
    if (!age || parseInt(age) < 1 || parseInt(age) > 120) {
      return 'กรุณากรอกอายุที่ถูกต้อง (1-120 ปี)';
    }
    if (!gender) {
      return 'กรุณาเลือกเพศ';
    }
    if (!occupation) {
      return 'กรุณาเลือกอาชีพ';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const demographicsData: Demographics = {
        age: parseInt(age),
        gender: gender as 'male' | 'female' | 'lgbtq' | 'other',
        occupation
      };

      // Save to store
      setDemographics(demographicsData);

      // Save to Supabase
      await saveRatingResponse(
        sessionId!,
        selectedNews.length,
        ratingAnswers,
        demographicsData
      );

      // Navigate to thank you page
      router.push('/thank-you');
    } catch (err) {
      console.error('Error saving survey:', err);
      setError(
        err instanceof Error
          ? `เกิดข้อผิดพลาด: ${err.message}`
          : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center border-b bg-primary/5">
            <CardTitle className="text-3xl">ข้อมูลส่วนบุคคล</CardTitle>
            <CardDescription className="text-base">
              กรุณากรอกข้อมูลเพื่อช่วยในการวิเคราะห์ผลการทดสอบ
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-base font-semibold">
                  อายุ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  placeholder="กรอกอายุของคุณ (เช่น 25)"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="h-12 text-base"
                  disabled={isSubmitting}
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-base font-semibold">
                  เพศ <span className="text-destructive">*</span>
                </Label>
                <Select value={gender} onValueChange={setGender} disabled={isSubmitting}>
                  <SelectTrigger id="gender" className="h-12 text-base">
                    <SelectValue placeholder="เลือกเพศ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ชาย</SelectItem>
                    <SelectItem value="female">หญิง</SelectItem>
                    <SelectItem value="lgbtq">LGBTQ+</SelectItem>
                    <SelectItem value="other">ไม่ระบุ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Occupation */}
              <div className="space-y-2">
                <Label htmlFor="occupation" className="text-base font-semibold">
                  อาชีพ <span className="text-destructive">*</span>
                </Label>
                <Select value={occupation} onValueChange={setOccupation} disabled={isSubmitting}>
                  <SelectTrigger id="occupation" className="h-12 text-base">
                    <SelectValue placeholder="เลือกอาชีพ" />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCUPATIONS.map((occ) => (
                      <SelectItem key={occ} value={occ}>
                        {occ}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Error Message */}
              {error && (
                <Card className="p-4 bg-destructive/10 border-destructive">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </Card>
              )}

              {/* Info */}
              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">หมายเหตุ:</span>{' '}
                  ข้อมูลของผู้เข้าร่วมแบบสอบถามจะถูกเก็บเป็นความลับและใช้เพื่อการวิจัยเท่านั้น
                  เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของคุณต่อบุคคลที่สาม
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full text-lg font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    กำลังบันทึกข้อมูล...
                  </>
                ) : (
                  'ส่งแบบทดสอบ'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
