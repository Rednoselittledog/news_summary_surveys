'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

export default function StarRating({ value, onChange, label }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number>(0);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= (hoverValue || value);
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverValue(star)}
              onMouseLeave={() => setHoverValue(0)}
              className="transition-all duration-150 hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors duration-150 ${
                  isActive
                    ? 'fill-primary text-primary'
                    : 'fill-none text-muted-foreground hover:text-primary/50'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
