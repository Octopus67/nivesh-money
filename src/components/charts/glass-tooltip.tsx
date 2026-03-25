'use client';

import { LIGHT_CHART_THEME } from '@/lib/chart-theme';

export function GlassTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={LIGHT_CHART_THEME.tooltip.contentStyle}>
      <p style={LIGHT_CHART_THEME.tooltip.labelStyle}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: ₹{Math.round(p.value).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
}
