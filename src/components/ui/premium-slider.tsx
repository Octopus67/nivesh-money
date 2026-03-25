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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
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

  const startEdit = () => {
    setIsEditing(true);
    setEditValue(String(value));
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const confirmEdit = () => {
    const parsed = Number(editValue.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed) && parsed >= min) {
      // Allow typed values up to 10x slider max for flexibility, but cap to prevent overflow
      onChange(Math.min(Math.max(min, parsed), max * 10));
    }
    setIsEditing(false);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={confirmEdit}
            onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') setIsEditing(false); }}
            className="w-28 text-right text-sm font-mono font-semibold px-2 py-0.5 rounded border border-[var(--color-emerald)] bg-white text-[var(--color-navy)] outline-none"
            inputMode="decimal"
            aria-label={label}
            autoFocus
          />
        ) : (
          <button
            onClick={startEdit}
            className="text-sm font-mono font-semibold text-[var(--color-navy)] tabular-nums hover:text-[var(--color-emerald)] hover:underline underline-offset-2 cursor-text transition-colors"
            title="Click to type a value"
          >
            {displayValue}
          </button>
        )}
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
