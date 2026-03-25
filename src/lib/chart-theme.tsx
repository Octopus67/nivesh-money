import React from 'react';

export const LIGHT_CHART_THEME = {
  grid: { stroke: 'rgba(0,0,0,0.05)', strokeDasharray: '3 3' },
  axis: { stroke: 'rgba(0,0,0,0.1)', fontSize: 12, fill: '#6b7280' },
  tooltip: {
    contentStyle: {
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: '12px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
      padding: '12px 16px',
    },
    labelStyle: { color: '#111827', fontWeight: 600, marginBottom: 4 },
    itemStyle: { color: '#374151', fontSize: 13 },
  },
  colors: {
    emerald: '#047857',
    blue: '#3b82f6',
    amber: '#d97706',
    violet: '#7c3aed',
    rose: '#e11d48',
    cyan: '#0891b2',
    invested: '#3b82f6',
    returns: '#047857',
    projected: '#60a5fa',
    warning: '#e11d48',
    savings: '#9ca3af',
    income: '#d97706',
  },
  area: { fillOpacity: 0.15, strokeWidth: 2 },
  line: { strokeWidth: 2, dot: { r: 3, fill: '#fff', strokeWidth: 2 }, activeDot: { r: 5, strokeWidth: 2 } },
  animation: { duration: 1200, easing: 'ease-out' },
} as const;

export function ChartGradient({ id, color }: { id: string; color: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity={0.3} />
      <stop offset="100%" stopColor={color} stopOpacity={0.02} />
    </linearGradient>
  );
}
