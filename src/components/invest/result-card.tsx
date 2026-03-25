'use client';

import { useSpring, animated } from '@react-spring/web';
import { formatINR } from '@/lib/invest/format';

interface ResultCardProps {
  label: string;
  value: number;
  accent?: boolean;
  barPercent?: number;
  barColor?: string;
  format?: 'currency' | 'years' | 'percent';
}

function formatDisplay(value: number, format: 'currency' | 'years' | 'percent'): string {
  if (format === 'years') return value >= 40 ? '40+ years' : `${Math.round(value)} years`;
  if (format === 'percent') return `${value.toFixed(1)}%`;
  return formatINR(Math.round(value));
}

export function ResultCard({ label, value, accent, barPercent, barColor = 'var(--accent-primary)', format = 'currency' }: ResultCardProps) {
  const { val } = useSpring({
    val: value,
    config: { duration: 600 },
  });

  return (
    <div
      className="rounded-xl p-4 transition-all"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${accent ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
        boxShadow: accent ? '0 0 20px rgba(30,58,95,0.12)' : 'var(--shadow-card)',
      }}
    >
      <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <animated.p
        className="text-2xl font-bold tabular-nums"
        style={{ color: 'var(--text-primary)' }}
        aria-live="polite"
      >
        {val.to(v => formatDisplay(v, format))}
      </animated.p>
      {barPercent != null && (
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barPercent}%`, background: barColor }} />
        </div>
      )}
    </div>
  );
}
