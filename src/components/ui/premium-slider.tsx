'use client';

import { useState, useCallback, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface PremiumSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  label: string;
  className?: string;
}

export function PremiumSlider({
  min, max, step, value, onChange, formatValue, label, className,
}: PremiumSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayValue = formatValue ? formatValue(value) : String(value);
  const percent = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (newValue: number | readonly number[]) => {
      setIsDragging(true);
      if (dragTimeout.current) clearTimeout(dragTimeout.current);
      dragTimeout.current = setTimeout(() => setIsDragging(false), 150);
      onChange(Array.isArray(newValue) ? newValue[0] : newValue);
    },
    [onChange]
  );

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
        <span className="text-sm font-mono font-semibold text-[var(--color-navy)] tabular-nums">
          {displayValue}
        </span>
      </div>
      <div className="relative">
        {isDragging && (
          <div
            className="absolute -top-8 px-2 py-1 bg-white rounded-lg shadow-md text-xs font-mono font-semibold text-[var(--color-navy)] pointer-events-none z-10 tabular-nums"
            style={{ left: `calc(${percent}% - 20px)` }}
          >
            {displayValue}
          </div>
        )}
        <Slider
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={handleChange}
          aria-label={label}
          aria-valuetext={displayValue}
          className="[&_[data-slot=slider-track]]:bg-[var(--bg-muted)] [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-[var(--color-emerald)] [&_[data-slot=slider-range]]:to-[var(--color-blue)] [&_[data-slot=slider-thumb]]:border-[var(--color-emerald)] [&_[data-slot=slider-thumb]]:shadow-[var(--shadow-emerald)] [&_[data-slot=slider-thumb]]:h-5 [&_[data-slot=slider-thumb]]:w-5"
        />
      </div>
    </div>
  );
}
