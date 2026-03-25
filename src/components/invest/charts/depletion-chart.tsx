'use client';

import { useMemo, useCallback, useState } from 'react';
import { AreaClosed, LinePath, Bar, Line } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { ParentSize } from '@visx/responsive';
import { localPoint } from '@visx/event';
import { formatCompact } from '@/lib/invest/format';

interface DataPoint { x: number; y: number; label?: string }

interface DepletionChartProps {
  data: DataPoint[];
  withdrawal: number;
  height?: number;
}

function getColor(corpus: number, initial: number): string {
  const ratio = corpus / initial;
  if (ratio > 0.5) return '#047857';
  if (ratio > 0.2) return '#d97706';
  return '#dc2626';
}

function ChartInner({ data, withdrawal, width, height }: DepletionChartProps & { width: number; height: number }) {
  const [hover, setHover] = useState<{ x: number; idx: number } | null>(null);
  const margin = { top: 20, right: 16, bottom: 30, left: 56 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const initial = data[0]?.y ?? 1;
  const redZoneThreshold = withdrawal * 6;

  const xScale = useMemo(
    () => scaleLinear({ domain: [data[0]?.x ?? 0, data[data.length - 1]?.x ?? 1], range: [0, innerW] }),
    [data, innerW]
  );
  const yMax = Math.max(...data.map(d => d.y)) * 1.1;
  const yScale = useMemo(
    () => scaleLinear({ domain: [0, yMax], range: [innerH, 0], nice: true }),
    [yMax, innerH]
  );

  const handleHover = useCallback(
    (e: React.MouseEvent<SVGRectElement> | React.TouchEvent<SVGRectElement>) => {
      const point = localPoint(e) || { x: 0 };
      const x0 = xScale.invert(point.x - margin.left);
      const idx = data.reduce((best, d, i) =>
        Math.abs(d.x - x0) < Math.abs(data[best].x - x0) ? i : best, 0);
      setHover({ x: xScale(data[idx].x), idx });
    },
    [data, xScale, margin.left]
  );

  const yTicks = useMemo(() => {
    const count = 4;
    return Array.from({ length: count + 1 }, (_, i) => Math.round((yMax / count) * i));
  }, [yMax]);

  const redZoneStart = data.find(d => d.y > 0 && d.y < redZoneThreshold);

  return (
    <svg width={width} height={height} role="img" aria-label="Withdrawal depletion chart">
      <defs>
        <linearGradient id="depletion-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#047857" stopOpacity={0.15} />
          <stop offset="60%" stopColor="#d97706" stopOpacity={0.10} />
          <stop offset="100%" stopColor="#dc2626" stopOpacity={0.08} />
        </linearGradient>
      </defs>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {yTicks.map(t => (
          <text key={t} x={-8} y={yScale(t)} dy="0.32em" textAnchor="end"
            fill="var(--text-muted)" fontSize={10} fontFamily="inherit">
            {formatCompact(t)}
          </text>
        ))}
        {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0 || i === data.length - 1).map(d => (
          <text key={d.x} x={xScale(d.x)} y={innerH + 20} textAnchor="middle"
            fill="var(--text-muted)" fontSize={10} fontFamily="inherit">
            {d.label ?? `${Math.round(d.x / 12)}Y`}
          </text>
        ))}

        {redZoneStart && (
          <rect x={xScale(redZoneStart.x)} y={0} width={innerW - xScale(redZoneStart.x)} height={innerH}
            fill="rgba(220,38,38,0.04)" />
        )}

        <AreaClosed data={data} x={d => xScale(d.x)} y={d => yScale(d.y)}
          yScale={yScale} fill="url(#depletion-grad)" curve={curveMonotoneX} />
        <LinePath data={data} x={d => xScale(d.x)} y={d => yScale(d.y)}
          stroke={getColor(data[data.length - 1]?.y ?? 0, initial)}
          strokeWidth={2} curve={curveMonotoneX} />

        {hover && (
          <>
            <Line from={{ x: hover.x, y: 0 }} to={{ x: hover.x, y: innerH }}
              stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
            <circle cx={hover.x} cy={yScale(data[hover.idx].y)} r={5}
              fill={getColor(data[hover.idx].y, initial)} stroke="var(--bg-surface)" strokeWidth={2} />
            <g transform={`translate(${hover.x},${Math.max(yScale(data[hover.idx].y) - 36, 0)})`}>
              <rect x={-40} y={-12} width={80} height={24} rx={6}
                fill="var(--bg-surface)" stroke="var(--glass-border)" />
              <text textAnchor="middle" dy="0.35em" fill="var(--text-primary)" fontSize={11}
                fontWeight={600} fontFamily="inherit">
                {formatCompact(data[hover.idx].y)}
              </text>
            </g>
          </>
        )}

        <Bar x={0} y={0} width={innerW} height={innerH} fill="transparent"
          onMouseMove={handleHover} onTouchMove={handleHover}
          onMouseLeave={() => setHover(null)} onTouchEnd={() => setHover(null)} />
      </g>
    </svg>
  );
}

export default function DepletionChart(props: DepletionChartProps) {
  return (
    <ParentSize>
      {({ width }) => width > 0 && (
        <ChartInner {...props} width={width} height={props.height ?? 280} />
      )}
    </ParentSize>
  );
}
