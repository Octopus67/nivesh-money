'use client';

import { useMemo, useCallback, useState } from 'react';
import { LinePath, Bar, Line } from '@visx/shape';
import { scaleLinear, scaleTime } from '@visx/scale';
import { LinearGradient } from '@visx/gradient';
import { curveMonotoneX } from '@visx/curve';
import { ParentSize } from '@visx/responsive';
import { localPoint } from '@visx/event';
import type { NAVDataPoint } from '@/lib/invest/types';

interface ComparisonChartProps {
  dataA: NAVDataPoint[];
  dataB: NAVDataPoint[];
  nameA: string;
  nameB: string;
  height?: number;
}

function normalize(data: NAVDataPoint[], startDate: Date): { date: Date; value: number }[] {
  const filtered = data.filter(d => d.date >= startDate).sort((a, b) => a.date.getTime() - b.date.getTime());
  if (!filtered.length) return [];
  const base = filtered[0].nav;
  return filtered.map(d => ({ date: d.date, value: (d.nav / base) * 100 }));
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

function ChartInner({ dataA, dataB, nameA, nameB, width, height }: ComparisonChartProps & { width: number; height: number }) {
  const [hover, setHover] = useState<{ x: number; idxA: number; idxB: number } | null>(null);
  const margin = { top: 20, right: 16, bottom: 30, left: 44 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const startDate = useMemo(() => {
    const firstA = dataA.length ? dataA.reduce((m, d) => d.date < m ? d.date : m, dataA[0].date) : new Date();
    const firstB = dataB.length ? dataB.reduce((m, d) => d.date < m ? d.date : m, dataB[0].date) : new Date();
    return firstA > firstB ? firstA : firstB;
  }, [dataA, dataB]);

  const normA = useMemo(() => normalize(dataA, startDate), [dataA, startDate]);
  const normB = useMemo(() => normalize(dataB, startDate), [dataB, startDate]);

  const xScale = useMemo(() => {
    const allDates = [...normA, ...normB].map(d => d.date);
    return scaleTime({
      domain: [new Date(Math.min(...allDates.map(d => d.getTime()))), new Date(Math.max(...allDates.map(d => d.getTime())))],
      range: [0, innerW],
    });
  }, [normA, normB, innerW]);

  const yScale = useMemo(() => {
    const allVals = [...normA, ...normB].map(d => d.value);
    return scaleLinear({
      domain: [Math.min(...allVals, 80), Math.max(...allVals) * 1.05],
      range: [innerH, 0],
      nice: true,
    });
  }, [normA, normB, innerH]);

  const handleHover = useCallback(
    (e: React.MouseEvent<SVGRectElement> | React.TouchEvent<SVGRectElement>) => {
      const point = localPoint(e) || { x: 0 };
      const x0 = xScale.invert(point.x - margin.left).getTime();
      const findNearest = (arr: typeof normA) =>
        arr.reduce((best, d, i) => Math.abs(d.date.getTime() - x0) < Math.abs(arr[best].date.getTime() - x0) ? i : best, 0);
      if (!normA.length || !normB.length) return;
      const idxA = findNearest(normA);
      const idxB = findNearest(normB);
      setHover({ x: xScale(normA[idxA].date), idxA, idxB });
    },
    [normA, normB, xScale, margin.left]
  );

  const yTicks = useMemo(() => {
    const [lo, hi] = yScale.domain();
    return Array.from({ length: 5 }, (_, i) => Math.round(lo + ((hi - lo) / 4) * i));
  }, [yScale]);

  const xTicks = useMemo(() => {
    const [lo, hi] = xScale.domain() as [Date, Date];
    const count = Math.min(6, Math.floor(innerW / 80));
    return Array.from({ length: count }, (_, i) => new Date(lo.getTime() + ((hi.getTime() - lo.getTime()) / (count - 1)) * i));
  }, [xScale, innerW]);

  if (!normA.length || !normB.length) return null;

  return (
    <svg width={width} height={height} role="img" aria-label="Fund comparison chart">
      <LinearGradient id="comp-grad-a" from="#1e3a5f" to="#1e3a5f" fromOpacity={0.15} toOpacity={0} />
      <LinearGradient id="comp-grad-b" from="#047857" to="#047857" fromOpacity={0.15} toOpacity={0} />
      <g transform={`translate(${margin.left},${margin.top})`}>
        {yTicks.map(t => (
          <text key={t} x={-6} y={yScale(t)} dy="0.32em" textAnchor="end" fill="var(--text-muted)" fontSize={10} fontFamily="inherit">{t}</text>
        ))}
        {xTicks.map((d, i) => (
          <text key={i} x={xScale(d)} y={innerH + 20} textAnchor="middle" fill="var(--text-muted)" fontSize={10} fontFamily="inherit">{formatDate(d)}</text>
        ))}

        <LinePath data={normA} x={d => xScale(d.date)} y={d => yScale(d.value)} stroke="#1e3a5f" strokeWidth={2} curve={curveMonotoneX} />
        <LinePath data={normB} x={d => xScale(d.date)} y={d => yScale(d.value)} stroke="#047857" strokeWidth={2} curve={curveMonotoneX} />

        {hover && (
          <>
            <Line from={{ x: hover.x, y: 0 }} to={{ x: hover.x, y: innerH }} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
            <circle cx={xScale(normA[hover.idxA].date)} cy={yScale(normA[hover.idxA].value)} r={4} fill="#1e3a5f" stroke="var(--bg-surface)" strokeWidth={2} />
            <circle cx={xScale(normB[hover.idxB].date)} cy={yScale(normB[hover.idxB].value)} r={4} fill="#047857" stroke="var(--bg-surface)" strokeWidth={2} />
            <g transform={`translate(${Math.min(hover.x, innerW - 90)},${8})`}>
              <rect x={-4} y={-12} width={88} height={36} rx={6} fill="var(--bg-surface)" stroke="var(--glass-border)" />
              <text x={4} y={0} fill="#1e3a5f" fontSize={10} fontWeight={600} fontFamily="inherit">{normA[hover.idxA].value.toFixed(1)}</text>
              <text x={4} y={14} fill="#047857" fontSize={10} fontWeight={600} fontFamily="inherit">{normB[hover.idxB].value.toFixed(1)}</text>
            </g>
          </>
        )}

        <Bar x={0} y={0} width={innerW} height={innerH} fill="transparent"
          onMouseMove={handleHover} onTouchMove={handleHover}
          onMouseLeave={() => setHover(null)} onTouchEnd={() => setHover(null)} />
      </g>
      {/* Legend removed from SVG — rendered as HTML below */}
    </svg>
  );
}

export default function ComparisonChart(props: ComparisonChartProps) {
  return (
    <ParentSize>
      {({ width }) => width > 0 && (
        <div>
          <ChartInner {...props} width={width} height={props.height ?? 300} />
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#1e3a5f' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{props.nameA}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#047857' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{props.nameB}</span>
            </div>
          </div>
        </div>
      )}
    </ParentSize>
  );
}
