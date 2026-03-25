'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Share2, Printer } from 'lucide-react';
import { PremiumSlider } from '@/components/ui/premium-slider';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassTooltip } from '@/components/charts/glass-tooltip';
import { calculateLumpsum } from '@/lib/calculators';
import { LIGHT_CHART_THEME, ChartGradient } from '@/lib/chart-theme';
import { formatINR, formatINRCompact } from '@/lib/utils';
import { shareCalculator, decodeCalcParams } from '@/lib/share';
import { PrintHeader } from '@/components/shared/print-header';
import { PrintDisclaimer } from '@/components/shared/print-disclaimer';
import { PrintInputSummary } from '@/components/shared/print-input-summary';

export function LumpsumCalculator() {
  const searchParams = useSearchParams();
  const defaults = decodeCalcParams(
    Object.fromEntries(searchParams.entries()),
    { amount: 500000, return: 12, years: 10 }
  );

  const [amount, setAmount] = useState(defaults.amount);
  const [annualReturn, setAnnualReturn] = useState(defaults.return);
  const [years, setYears] = useState(defaults.years);

  const result = useMemo(() => calculateLumpsum(amount, annualReturn, years), [amount, annualReturn, years]);

  const chartData = useMemo(() => {
    return Array.from({ length: years + 1 }, (_, y) => ({
      year: y,
      growth: Math.round(amount * Math.pow(1 + annualReturn / 100, y)),
      savings: Math.round(amount * Math.pow(1.04, y)),
    }));
  }, [amount, annualReturn, years]);

  const [showTable, setShowTable] = useState(false);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <PrintHeader />
      <PrintInputSummary inputs={{
        'Investment Amount': formatINR(amount),
        'Expected Return': `${annualReturn}%`,
        'Time Period': `${years} years`,
      }} />
      {/* Inputs */}
      <div className="space-y-6">
        <PremiumSlider label="Investment Amount" min={1000} max={100000000} step={10000} value={amount} onChange={setAmount} formatValue={formatINR} />
        <PremiumSlider label="Expected Return (%)" min={1} max={30} step={0.5} value={annualReturn} onChange={setAnnualReturn} formatValue={(v) => `${v}%`} />
        <PremiumSlider label="Time Period (Years)" min={1} max={40} step={1} value={years} onChange={setYears} formatValue={(v) => `${v} yr`} />

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <GlassCard variant="subtle" className="text-center">
            <p className="text-xs text-[var(--text-secondary)] mb-1">Total Value</p>
            <AnimatedNumber value={result.total} className="text-xl md:text-2xl text-[var(--color-emerald)]" />
          </GlassCard>
          <GlassCard variant="subtle" className="text-center">
            <p className="text-xs text-[var(--text-secondary)] mb-1">Invested</p>
            <AnimatedNumber value={result.invested} className="text-lg" />
          </GlassCard>
          <GlassCard variant="subtle" className="text-center">
            <p className="text-xs text-[var(--text-secondary)] mb-1">↑ Returns</p>
            <AnimatedNumber value={result.returns} className="text-lg text-[var(--color-emerald)]" />
          </GlassCard>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => shareCalculator('/calculators/lumpsum', { amount, return: annualReturn, years })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--color-navy)] text-white hover:opacity-90 transition-opacity"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-soft)] transition-colors"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Chart */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Growth Over Time</h3>
          <button
            onClick={() => setShowTable(!showTable)}
            aria-pressed={showTable}
            className="text-xs text-[var(--color-navy)] underline"
          >
            {showTable ? 'View Chart' : 'View as Table'}
          </button>
        </div>

        {showTable ? (
          <div className="overflow-auto max-h-[350px] rounded-lg border border-[var(--border-default)]">
            <table className="w-full text-sm">
              <caption className="sr-only">Lumpsum growth projection over {years} years</caption>
              <thead className="bg-[var(--bg-soft)] sticky top-0">
                <tr>
                  <th scope="col" className="text-left p-3 text-[var(--text-secondary)]">Year</th>
                  <th scope="col" className="text-right p-3 text-[var(--text-secondary)]">Value</th>
                  <th scope="col" className="text-right p-3 text-[var(--text-secondary)]">Savings A/c</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, i) => (
                  <tr key={row.year} className={i % 2 ? 'bg-[var(--bg-soft)]' : 'bg-white'}>
                    <td className="p-3">{row.year}</td>
                    <td className="p-3 text-right font-mono tabular-nums text-[var(--color-emerald)]">{formatINR(row.growth)}</td>
                    <td className="p-3 text-right font-mono tabular-nums text-gray-400">{formatINR(row.savings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <ChartGradient id="lumpsumGrowth" color={LIGHT_CHART_THEME.colors.returns} />
              </defs>
              <CartesianGrid {...LIGHT_CHART_THEME.grid} />
              <XAxis dataKey="year" tick={{ fill: LIGHT_CHART_THEME.axis.fill, fontSize: LIGHT_CHART_THEME.axis.fontSize }} stroke={LIGHT_CHART_THEME.axis.stroke} />
              <YAxis tickFormatter={(v: number) => formatINRCompact(v)} tick={{ fill: LIGHT_CHART_THEME.axis.fill, fontSize: LIGHT_CHART_THEME.axis.fontSize }} stroke={LIGHT_CHART_THEME.axis.stroke} />
              <Tooltip content={<GlassTooltip />} />
              <Area type="monotone" dataKey="growth" name="Investment" stroke={LIGHT_CHART_THEME.colors.returns} strokeWidth={2.5} fill="url(#lumpsumGrowth)" animationDuration={LIGHT_CHART_THEME.animation.duration} />
              <Area type="monotone" dataKey="savings" name="Savings A/c (4%)" stroke="#9ca3af" strokeWidth={1.5} fill="none" strokeDasharray="6 4" animationDuration={LIGHT_CHART_THEME.animation.duration} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      <PrintDisclaimer />
    </div>
  );
}
