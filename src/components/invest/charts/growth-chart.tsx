'use client';

import { useMemo, useCallback, useState } from 'react';
import { AreaClosed, LinePath, Bar, Line } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { LinearGradient } from '@visx/gradient';
import { curveMonotoneX } from '@visx/curve';
import { ParentSize } from '@visx/responsive';
import { localPoint } from '@visx/event';
import { formatCompact } from '@/lib/invest/format';

interface DataPoint { x: number; y: number; label?: string }

interface GrowthChartProps {
  data: DataPoint[];
  secondaryData?: DataPoint[];
  gradientFrom?: string;
  gradientTo?: string;
  lineColor?: string;
  secondaryLineColor?: string;
  milestones?: { value: number; label: string }[];
  height?: number;
}

function ChartInner({
  data, secondaryData, gradientFrom = '#1e3a5f', gradientTo = '#1e3a5f',
  lineColor = '#1e3a5f', secondaryLineColor = '#9ca3af',
  milestones, width, height,
}: GrowthChartProps & { width: number; height: number }) {
  const [hover, setHover] = useState<{ x: number; idx: number } | null>(null);
  const margin = { top: 20, right: 16, bottom: 30, left: 56 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const allY = useMemo(() => {
    const ys = data.map(d => d.y);
    if (secondaryData) ys.push(...secondaryData.map(d => d.y));
    return ys;
  }, [data, secondaryData]);

  const xScale = useMemo(
    () => scaleLinear({ domain: [data[0]?.x ?? 0, data[data.length - 1]?.x ?? 1], range: [0, innerW] }),
    [data, innerW]
  );
  const yScale = useMemo(
    () => scaleLinear({ domain: [0, Math.max(...allY) * 1.1], range: [innerH, 0], nice: true }),
    [allY, innerH]
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
    const max = Math.max(...allY) * 1.1;
    const count = 4;
    return Array.from({ length: count + 1 }, (_, i) => Math.round((max / count) * i));
  }, [allY]);

  return (
    <svg width={width} height={height} role="img" aria-label="Investment growth chart">
      <LinearGradient id="area-grad" from={gradientFrom} to={gradientTo} fromOpacity={0.15} toOpacity={0} />
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
            {d.label ?? `${d.x}Y`}
          </text>
        ))}

        <AreaClosed data={data} x={d => xScale(d.x)} y={d => yScale(d.y)}
          yScale={yScale} fill="url(#area-grad)" curve={curveMonotoneX} />
        <LinePath data={data} x={d => xScale(d.x)} y={d => yScale(d.y)}
          stroke={lineColor} strokeWidth={2} curve={curveMonotoneX} />

        {secondaryData && (
          <LinePath data={secondaryData} x={d => xScale(d.x)} y={d => yScale(d.y)}
            stroke={secondaryLineColor} strokeWidth={1.5} strokeDasharray="6,4" curve={curveMonotoneX} />
        )}

        {milestones?.map(m => {
          const dp = data.find(d => d.y >= m.value);
          if (!dp) return null;
          return (
            <g key={m.label}>
              <circle cx={xScale(dp.x)} cy={yScale(dp.y)} r={4} fill={lineColor} stroke="var(--bg-surface)" strokeWidth={2} />
              <text x={xScale(dp.x)} y={yScale(dp.y) - 10} textAnchor="middle"
                fill="var(--text-secondary)" fontSize={9} fontFamily="inherit">
                {m.label}
              </text>
            </g>
          );
        })}

        {hover && (
          <>
            <Line from={{ x: hover.x, y: 0 }} to={{ x: hover.x, y: innerH }}
              stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
            <circle cx={hover.x} cy={yScale(data[hover.idx].y)} r={5}
              fill={lineColor} stroke="var(--bg-surface)" strokeWidth={2} />
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

export default function GrowthChart(props: GrowthChartProps) {
  return (
    <ParentSize>
      {({ width }) => width > 0 && (
        <ChartInner {...props} width={width} height={props.height ?? 280} />
      )}
    </ParentSize>
  );
}
