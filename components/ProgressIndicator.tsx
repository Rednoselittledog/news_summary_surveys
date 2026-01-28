'use client';

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export default function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  return (
    <div className="text-center py-4">
      <p className="text-lg font-medium text-muted-foreground">
        ข่าวที่ <span className="text-primary font-bold">{current}</span> จาก{' '}
        <span className="font-bold">{total}</span>
      </p>
    </div>
  );
}
