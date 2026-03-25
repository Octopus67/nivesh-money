'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea, ResponsiveContainer,
} from 'recharts';
import { Share2, Printer, AlertTriangle } from 'lucide-react';
import { PremiumSlider } from '@/components/ui/premium-slider';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassTooltip } from '@/components/charts/glass-tooltip';
import { calculateSWP } from '@/lib/calculators';
import { LIGHT_CHART_THEME, ChartGradient } from '@/lib/chart-theme';
import { formatINR, formatINRCompact } from '@/lib/utils';
import { shareCalculator, decodeCalcParams } from '@/lib/share';
import { PrintHeader } from '@/components/shared/print-header';
import { PrintDisclaimer } from '@/components/shared/print-disclaimer';
import { PrintInputSummary } from '@/components/shared/print-input-summary';

function formatMonths(m: number) {
  const yrs = Math.floor(m / 12);
  const mos = m % 12;
  return yrs > 0 ? `${yrs}y ${mos}m` : `${mos}m`;
}

export function SWPCalculator() {
  const searchParams = useSearchParams();
  const defaults = decodeCalcParams(
    Object.fromEntries(searchParams.entries()),
    { corpus: 5000000, withdrawal: 30000, return: 8, years: 20 }
  );

  const [corpus, setCorpus] = useState(defaults.corpus);
  const [withdrawal, setWithdrawal] = useState(defaults.withdrawal);
  const [annualReturn, setAnnualReturn] = useState(defaults.return);
  const [years, setYears] = useState(defaults.years);

  const result = useMemo(() => calculateSWP(corpus, withdrawal, annualReturn, years), [corpus, withdrawal, annualReturn, years]);

  // Downsample monthly data to yearly for chart
  const chartData = useMemo(() => {
    const yearly: { year: number; balance: number }[] = [];
    for (let i = 0; i <= years; i++) {
      const monthIdx = i * 12;
      const point = result.data[monthIdx];
      if (point) yearly.push({ year: i, balance: point.balance });
    }
    return yearly;
  }, [result.data, years]);

  const depleted = result.depletionMonth !== null;
  const depletionYear = result.depletionMonth ? Math.ceil(result.depletionMonth / 12) : null;
  const warningStart = depletionYear ? Math.max(0, depletionYear - 2) : null;

  const [showTable, setShowTable] = useState(false);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <PrintHeader />
      <PrintInputSummary inputs={{
        'Total Corpus': formatINRCompact(corpus),
        'Monthly Withdrawal': formatINR(withdrawal),
        'Expected Return': `${annualReturn}%`,
        'Time Period': `${years} years`,
      }} />
      {/* Inputs */}
      <div className="space-y-6">
        <PremiumSlider label="Total Corpus" min={100000} max={500000000} step={100000} value={corpus} onChange={setCorpus} formatValue={formatINRCompact} />
        <PremiumSlider label="Monthly Withdrawal" min={1000} max={2000000} step={1000} value={withdrawal} onChange={setWithdrawal} formatValue={formatINR} />
        <PremiumSlider label="Expected Return (%)" min={1} max={30} step={0.5} value={annualReturn} onChange={setAnnualReturn} formatValue={(v) => `${v}%`} />
        <PremiumSlider label="Time Period (Years)" min={1} max={30} step={1} value={years} onChange={setYears} formatValue={(v) => `${v} yr`} />

        {/* Results */}
        <div className="space-y-4 pt-4">
          {depleted ? (
            <GlassCard variant="subtle" className="border-red-200 bg-red-50/50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-600">
                    ↓ Corpus depletes in {formatMonths(result.depletionMonth!)}
                  </p>
                  <p className="text-xs text-red-500 mt-1">Reduce withdrawal or increase corpus.</p>
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard variant="subtle" className="text-center">
              <p className="text-xs text-[var(--text-secondary)] mb-1">Final Balance</p>
              <AnimatedNumber value={result.finalBalance} className="text-xl md:text-2xl text-[var(--color-emerald)]" />
            </GlassCard>
          )}

          <div className="grid grid-cols-2 gap-4">
            <GlassCard variant="subtle" className="text-center">
              <p className="text-xs text-[var(--text-secondary)] mb-1">Total Withdrawn</p>
              <AnimatedNumber value={result.totalWithdrawn} className="text-lg" />
            </GlassCard>
            <GlassCard variant="subtle" className="text-center">
              <p className="text-xs text-[var(--text-secondary)] mb-1">Monthly Income</p>
              <AnimatedNumber value={withdrawal} className="text-lg text-[var(--color-navy)]" />
            </GlassCard>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => shareCalculator('/calculators/swp', { corpus, withdrawal, return: annualReturn, years })}
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
          <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Balance Over Time</h3>
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
              <caption className="sr-only">SWP balance projection over {years} years</caption>
              <thead className="bg-[var(--bg-soft)] sticky top-0">
                <tr>
                  <th scope="col" className="text-left p-3 text-[var(--text-secondary)]">Year</th>
                  <th scope="col" className="text-right p-3 text-[var(--text-secondary)]">Withdrawn</th>
                  <th scope="col" className="text-right p-3 text-[var(--text-secondary)]">Balance</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, i) => (
                  <tr key={row.year} className={i % 2 ? 'bg-[var(--bg-soft)]' : 'bg-white'}>
                    <td className="p-3">{row.year}</td>
                    <td className="p-3 text-right font-mono tabular-nums">{formatINR(withdrawal * 12 * row.year)}</td>
                    <td className="p-3 text-right font-mono tabular-nums">{formatINR(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <ChartGradient id="swpBalance" color={LIGHT_CHART_THEME.colors.invested} />
                <linearGradient id="swpWarning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...LIGHT_CHART_THEME.grid} />
              <XAxis dataKey="year" tick={{ fill: LIGHT_CHART_THEME.axis.fill, fontSize: LIGHT_CHART_THEME.axis.fontSize }} stroke={LIGHT_CHART_THEME.axis.stroke} label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 12 }} />
              <YAxis tickFormatter={(v: number) => formatINRCompact(v)} tick={{ fill: LIGHT_CHART_THEME.axis.fill, fontSize: LIGHT_CHART_THEME.axis.fontSize }} stroke={LIGHT_CHART_THEME.axis.stroke} />
              <Tooltip content={<GlassTooltip />} />
              <Area type="monotone" dataKey="balance" stroke={LIGHT_CHART_THEME.colors.invested} strokeWidth={2} fill="url(#swpBalance)" animationDuration={LIGHT_CHART_THEME.animation.duration} />
              {warningStart !== null && depletionYear !== null && (
                <ReferenceArea x1={warningStart} x2={depletionYear} fill="url(#swpWarning)" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      <PrintDisclaimer />
    </div>
  );
}
