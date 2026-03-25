'use client';

import { useState, useRef, useCallback } from 'react';

interface PremiumSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  formatValue: (value: number) => string;
  snapValues?: number[];
}

export function PremiumSlider({ label, min, max, step, value, onChange, formatValue, snapValues }: PremiumSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const prevValue = useRef(value);
  const percent = ((value - min) / (max - min)) * 100;

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newVal = Number(e.target.value);
    if (snapValues) {
      const nearest = snapValues.reduce((prev, curr) =>
        Math.abs(curr - newVal) < Math.abs(prev - newVal) ? curr : prev
      );
      if (Math.abs(nearest - newVal) < step * 2) newVal = nearest;
    }
    if (newVal !== prevValue.current && 'vibrate' in navigator) {
      try { navigator.vibrate(1); } catch { /* mobile only */ }
    }
    prevValue.current = newVal;
    onChange(newVal);
  }, [onChange, snapValues, step]);

  const startEdit = () => {
    setIsEditing(true);
    setEditValue(String(value));
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const confirmEdit = () => {
    const parsed = Number(editValue.replace(/[^0-9.-]/g, ''));
    if (!isNaN(parsed)) onChange(Math.max(min, Math.min(max, parsed)));
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={confirmEdit}
            onKeyDown={e => {
              if (e.key === 'Enter') confirmEdit();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="w-32 text-right text-sm font-semibold px-2 py-1 rounded"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--accent-primary)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
            inputMode="decimal"
            autoFocus
          />
        ) : (
          <button
            onClick={startEdit}
            className="text-sm font-semibold financial-number cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-primary)', background: 'none', border: 'none', padding: 0 }}
          >
            {formatValue(value)}
          </button>
        )}
      </div>
      <div className="relative">
        {isDragging && (
          <div
            className="absolute -top-8 px-2 py-1 rounded text-xs font-semibold financial-number pointer-events-none z-10"
            style={{
              left: `${Math.max(0, Math.min(percent, 95))}%`,
              transform: 'translateX(-50%)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {formatValue(value)}
          </div>
        )}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onPointerLeave={() => setIsDragging(false)}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-blue) ${percent}%, rgba(0,0,0,0.08) ${percent}%, rgba(0,0,0,0.08) 100%)`,
          }}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={formatValue(value)}
        />
      </div>
    </div>
  );
}
