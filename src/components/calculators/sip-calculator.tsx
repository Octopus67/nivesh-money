'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { Share2, Printer } from 'lucide-react';
import { PremiumSlider } from '@/components/ui/premium-slider';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassTooltip } from '@/components/charts/glass-tooltip';
import { calculateSIP, generateSIPChartData } from '@/lib/calculators';
import { LIGHT_CHART_THEME, ChartGradient } from '@/lib/chart-theme';
import { formatINR, formatINRCompact } from '@/lib/utils';
import { shareCalculator, decodeCalcParams } from '@/lib/share';
import { PrintHeader } from '@/components/shared/print-header';
import { PrintDisclaimer } from '@/components/shared/print-disclaimer';
import { PrintInputSummary } from '@/components/shared/print-input-summary';

export function SIPCalculator() {
  const searchParams = useSearchParams();
  const defaults = decodeCalcParams(
    Object.fromEntries(searchParams.entries()),
    { amount: 10000, return: 12, years: 10, stepup: 0 }
  );

  const [monthly, setMonthly] = useState(defaults.amount);
  const [annualReturn, setAnnualReturn] = useState(defaults.return);
  const [years, setYears] = useState(defaults.years);
  const [stepUp, setStepUp] = useState(defaults.stepup);

  const result = useMemo(() => calculateSIP(monthly, annualReturn, years, stepUp), [monthly, annualReturn, years, stepUp]);
  const chartData = useMemo(() => generateSIPChartData(monthly, annualReturn, years, stepUp), [monthly, annualReturn, years, stepUp]);

  const donutData = [
    { name: 'Invested', value: result.invested },
    { name: 'Returns', value: result.returns },
  ];

  const [showTable, setShowTable] = useState(false);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <PrintHeader />
      <PrintInputSummary inputs={{
        'Monthly Investment': formatINR(monthly),
        'Expected Return': `${annualReturn}%`,
        'Time Period': `${years} years`,
        'Annual Step-Up': `${stepUp}%`,
      }} />
      {/* Inputs */}
      <div className="space-y-6">
        <PremiumSlider label="Monthly Investment" min={500} max={100000} step={500} value={monthly} onChange={setMonthly} formatValue={formatINR} />
        <PremiumSlider label="Expected Return (%)" min={1} max={30} step={0.5} value={annualReturn} onChange={setAnnualReturn} formatValue={(v) => `${v}%`} />
        <PremiumSlider label="Time Period (Years)" min={1} max={40} step={1} value={years} onChange={setYears} formatValue={(v) => `${v} yr`} />
        <PremiumSlider label="Annual Step-Up (%)" min={0} max={25} step={1} value={stepUp} onChange={setStepUp} formatValue={(v) => `${v}%`} />

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
            onClick={() => shareCalculator('/calculators/sip', { amount: monthly, return: annualReturn, years, stepup: stepUp })}
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

      {/* Charts */}
      <div className="space-y-6">
        {/* Area Chart */}
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
                <caption className="sr-only">SIP growth projection over {years} years</caption>
                <thead className="bg-[var(--bg-soft)] sticky top-0">
                  <tr>
                    <th scope="col" className="text-left p-3 text-[var(--text-secondary)]">Year</th>
                    <th scope="col" className="text-right p-3 text-[var(--text-secondary)]">Invested</th>
                    <th scope="col" className="text-right p-3 text-[var(--text-secondary)]">Returns</th>
                    <th scope="col" className="text-right p-3 text-[var(--text-secondary)]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, i) => (
                    <tr key={row.year} className={i % 2 ? 'bg-[var(--bg-soft)]' : 'bg-white'}>
                      <td className="p-3">{row.year}</td>
                      <td className="p-3 text-right font-mono tabular-nums">{formatINR(row.invested)}</td>
                      <td className="p-3 text-right font-mono tabular-nums text-[var(--color-emerald)]">{formatINR(row.returns)}</td>
                      <td className="p-3 text-right font-mono tabular-nums">{formatINR(row.invested + row.returns)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <ChartGradient id="sipInvested" color={LIGHT_CHART_THEME.colors.invested} />
                  <ChartGradient id="sipReturns" color={LIGHT_CHART_THEME.colors.returns} />
                </defs>
                <CartesianGrid {...LIGHT_CHART_THEME.grid} />
                <XAxis dataKey="year" tick={{ fill: LIGHT_CHART_THEME.axis.fill, fontSize: LIGHT_CHART_THEME.axis.fontSize }} stroke={LIGHT_CHART_THEME.axis.stroke} />
                <YAxis tickFormatter={(v: number) => formatINRCompact(v)} tick={{ fill: LIGHT_CHART_THEME.axis.fill, fontSize: LIGHT_CHART_THEME.axis.fontSize }} stroke={LIGHT_CHART_THEME.axis.stroke} />
                <Tooltip content={<GlassTooltip />} />
                <Area type="monotone" dataKey="invested" stackId="1" stroke={LIGHT_CHART_THEME.colors.invested} strokeWidth={1.5} fill="url(#sipInvested)" strokeDasharray="4 4" animationDuration={LIGHT_CHART_THEME.animation.duration} />
                <Area type="monotone" dataKey="returns" stackId="1" stroke={LIGHT_CHART_THEME.colors.returns} strokeWidth={2.5} fill="url(#sipReturns)" animationDuration={LIGHT_CHART_THEME.animation.duration} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut Chart */}
        <div className="flex justify-center">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie data={donutData} innerRadius="60%" outerRadius="80%" startAngle={90} endAngle={-270} dataKey="value" animationDuration={800}>
                <Cell fill={LIGHT_CHART_THEME.colors.invested} />
                <Cell fill={LIGHT_CHART_THEME.colors.returns} />
              </Pie>
              <Tooltip content={<GlassTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col justify-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: LIGHT_CHART_THEME.colors.invested }} />
              Invested
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: LIGHT_CHART_THEME.colors.returns }} />
              Returns
            </div>
          </div>
        </div>
      </div>
      <PrintDisclaimer />
    </div>
  );
}
