'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Share2, Printer } from 'lucide-react';
import { PremiumSlider } from '@/components/ui/premium-slider';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassTooltip } from '@/components/charts/glass-tooltip';
import { calculateInflation, generateInflationChartData } from '@/lib/calculators';
import { LIGHT_CHART_THEME, ChartGradient } from '@/lib/chart-theme';
import { formatINR, formatINRCompact } from '@/lib/utils';
import { shareCalculator, decodeCalcParams } from '@/lib/share';
import { PrintHeader } from '@/components/shared/print-header';
import { PrintDisclaimer } from '@/components/shared/print-disclaimer';
import { PrintInputSummary } from '@/components/shared/print-input-summary';

export function InflationCalculator() {
  const searchParams = useSearchParams();
  const defaults = decodeCalcParams(
    Object.fromEntries(searchParams.entries()),
    { cost: 50000, rate: 6, years: 20 }
  );

  const [currentCost, setCurrentCost] = useState(defaults.cost);
  const [inflationRate, setInflationRate] = useState(defaults.rate);
  const [years, setYears] = useState(defaults.years);

  const result = useMemo(() => calculateInflation(currentCost, inflationRate, years), [currentCost, inflationRate, years]);
  const chartData = useMemo(() => generateInflationChartData(currentCost, inflationRate, years), [currentCost, inflationRate, years]);

  const [showTable, setShowTable] = useState(false);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <PrintHeader />
      <PrintInputSummary inputs={{ 'Current Monthly Cost': formatINR(currentCost), 'Inflation Rate': `${inflationRate}%`, 'Time Period': `${years} years` }} />
      {/* Inputs */}
      <div className="space-y-6">
        <PremiumSlider label="Current Monthly Cost" min={1000} max={500000} step={1000} value={currentCost} onChange={setCurrentCost} formatValue={formatINR} />
        <PremiumSlider label="Inflation Rate (%)" min={3} max={12} step={0.5} value={inflationRate} onChange={setInflationRate} formatValue={(v) => `${v}%`} />
        <PremiumSlider label="Years" min={1} max={40} step={1} value={years} onChange={setYears} formatValue={(v) => `${v} yr`} />

        {/* Results */}
        <div className="space-y-4 pt-4">
          <GlassCard variant="subtle" className="text-center">
            <p className="text-xs text-[var(--text-secondary)] mb-1">Future Monthly Cost</p>
            <AnimatedNumber value={result.futureCost} className="text-2xl md:text-3xl text-[var(--color-emerald)]" />
          </GlassCard>

          <GlassCard variant="subtle" className="text-center">
            <p className="text-xs text-[var(--text-secondary)] mb-1">₹1,00,000 today will be worth</p>
            <AnimatedNumber value={Math.round(result.purchasingPower)} className="text-xl text-amber-600" />
            <p className="text-xs text-[var(--text-muted)] mt-1">in {years} years</p>
          </GlassCard>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
            <p className="text-sm text-amber-800">
              Your <span className="font-semibold">{formatINR(currentCost)}/month</span> today will cost{' '}
              <span className="font-semibold">{formatINR(result.futureCost)}/month</span> in {years} years
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button onClick={() => shareCalculator('/calculators/inflation', { cost: currentCost, rate: inflationRate, years })} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-black/10 hover:bg-black/5 transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-black/10 hover:bg-black/5 transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Chart */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Cost Growth Over Time</h3>
          <button onClick={() => setShowTable(!showTable)} aria-pressed={showTable} className="text-xs text-[var(--color-navy)] underline">
            {showTable ? 'View Chart' : 'View as Table'}
          </button>
        </div>

        {showTable ? (
          <div className="overflow-auto max-h-[350px] rounded-lg border border-[var(--border-default)]">
            <table className="w-full text-sm">
              <caption className="sr-only">Inflation impact on monthly cost over {years} years</caption>
              <thead className="bg-[var(--bg-soft)] sticky top-0">
                <tr>
                  <th scope="col" className="text-left p-3 text-[var(--text-secondary)]">Year</th>
                  <th scope="col" className="text-right p-3 text-[var(--text-secondary)]">Monthly Cost</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, i) => (
                  <tr key={row.year} className={i % 2 ? 'bg-[var(--bg-soft)]' : 'bg-white'}>
                    <td className="p-3">{row.year}</td>
                    <td className="p-3 text-right font-mono tabular-nums">{formatINR(row.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <ChartGradient id="inflationFill" color={LIGHT_CHART_THEME.colors.amber} />
              </defs>
              <CartesianGrid {...LIGHT_CHART_THEME.grid} />
              <XAxis dataKey="year" tick={{ fill: LIGHT_CHART_THEME.axis.fill, fontSize: LIGHT_CHART_THEME.axis.fontSize }} stroke={LIGHT_CHART_THEME.axis.stroke} />
              <YAxis tickFormatter={(v: number) => formatINRCompact(v)} tick={{ fill: LIGHT_CHART_THEME.axis.fill, fontSize: LIGHT_CHART_THEME.axis.fontSize }} stroke={LIGHT_CHART_THEME.axis.stroke} />
              <Tooltip content={<GlassTooltip />} />
              <Area type="monotone" dataKey="cost" name="Monthly Cost" stroke={LIGHT_CHART_THEME.colors.amber} strokeWidth={2.5} fill="url(#inflationFill)" animationDuration={LIGHT_CHART_THEME.animation.duration} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      <PrintDisclaimer />
    </div>
  );
}
