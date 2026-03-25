'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Share2, Printer } from 'lucide-react';
import { PremiumSlider } from '@/components/ui/premium-slider';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassTooltip } from '@/components/charts/glass-tooltip';
import { calculateTaxSaving } from '@/lib/calculators';
import { LIGHT_CHART_THEME } from '@/lib/chart-theme';
import { formatINR, formatINRCompact } from '@/lib/utils';
import { shareCalculator, decodeCalcParams } from '@/lib/share';
import { PrintHeader } from '@/components/shared/print-header';
import { PrintDisclaimer } from '@/components/shared/print-disclaimer';
import { PrintInputSummary } from '@/components/shared/print-input-summary';

export function TaxSavingCalculator() {
  const searchParams = useSearchParams();
  const defaults = decodeCalcParams(
    Object.fromEntries(searchParams.entries()),
    { income: 1000000, existing: 0, elss: 50000 }
  );

  const [income, setIncome] = useState(defaults.income);
  const [existing80C, setExisting80C] = useState(defaults.existing);
  const [proposedELSS, setProposedELSS] = useState(defaults.elss);

  const result = useMemo(() => calculateTaxSaving(income, existing80C, proposedELSS), [income, existing80C, proposedELSS]);

  const barData = [
    { name: 'Old (No ELSS)', value: result.oldRegimeWithout, fill: '#9ca3af' },
    { name: 'Old + ELSS', value: result.oldRegimeWith, fill: '#047857' },
    { name: 'New Regime', value: result.newRegime, fill: '#3b82f6' },
  ];

  const [showTable, setShowTable] = useState(false);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <PrintHeader />
      <PrintInputSummary inputs={{ 'Annual Income': formatINR(income), 'Existing 80C': formatINR(existing80C), 'Proposed ELSS': formatINR(proposedELSS) }} />
      {/* Inputs */}
      <div className="space-y-6">
        <PremiumSlider label="Annual Income" min={100000} max={10000000} step={50000} value={income} onChange={setIncome} formatValue={formatINRCompact} />
        <PremiumSlider label="Existing 80C Investments" min={0} max={150000} step={5000} value={existing80C} onChange={setExisting80C} formatValue={formatINR} />
        <PremiumSlider label="Proposed ELSS Investment" min={0} max={150000} step={5000} value={proposedELSS} onChange={setProposedELSS} formatValue={formatINR} />

        {/* Results */}
        <div className="space-y-4 pt-4">
          <GlassCard variant="subtle" className="text-center">
            <p className="text-xs text-[var(--text-secondary)] mb-1">↓ Tax Saved with ELSS</p>
            <AnimatedNumber value={result.taxSaved} className="text-2xl md:text-3xl text-[var(--color-emerald)]" />
          </GlassCard>

          <div className="grid grid-cols-2 gap-4">
            <GlassCard variant="subtle" className="text-center">
              <p className="text-xs text-[var(--text-secondary)] mb-1">Old Regime (No ELSS)</p>
              <AnimatedNumber value={result.oldRegimeWithout} className="text-lg" />
            </GlassCard>
            <GlassCard variant="subtle" className="text-center">
              <p className="text-xs text-[var(--text-secondary)] mb-1">Old Regime + ELSS</p>
              <AnimatedNumber value={result.oldRegimeWith} className="text-lg text-[var(--color-emerald)]" />
            </GlassCard>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <GlassCard variant="subtle" className="text-center">
              <p className="text-xs text-[var(--text-secondary)] mb-1">New Regime</p>
              <AnimatedNumber value={result.newRegime} className="text-lg text-blue-600" />
            </GlassCard>
            <GlassCard variant="subtle" className="text-center">
              <p className="text-xs text-[var(--text-secondary)] mb-1">ELSS Used</p>
              <AnimatedNumber value={result.elssUsed} className="text-lg" />
            </GlassCard>
          </div>

          {/* Recommended regime badge */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
              result.recommendedRegime === 'old'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              ✓ {result.recommendedRegime === 'old' ? 'Old Regime' : 'New Regime'} saves you more
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button onClick={() => shareCalculator('/calculators/tax-saving', { income, existing: existing80C, elss: proposedELSS })} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-black/10 hover:bg-black/5 transition-colors">
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
          <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Tax Comparison</h3>
          <button onClick={() => setShowTable(!showTable)} aria-pressed={showTable} className="text-xs text-[var(--color-navy)] underline">
            {showTable ? 'View Chart' : 'View as Table'}
          </button>
        </div>

        {showTable ? (
          <div className="overflow-auto rounded-lg border border-[var(--border-default)]">
            <table className="w-full text-sm">
              <caption className="sr-only">Tax comparison across regimes</caption>
              <thead className="bg-[var(--bg-soft)] sticky top-0">
                <tr>
                  <th scope="col" className="text-left p-3 text-[var(--text-secondary)]">Regime</th>
                  <th scope="col" className="text-right p-3 text-[var(--text-secondary)]">Tax</th>
                </tr>
              </thead>
              <tbody>
                {barData.map((row, i) => (
                  <tr key={row.name} className={i % 2 ? 'bg-[var(--bg-soft)]' : 'bg-white'}>
                    <td className="p-3">{row.name}</td>
                    <td className="p-3 text-right font-mono tabular-nums">{formatINR(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barData} barCategoryGap="25%">
              <CartesianGrid {...LIGHT_CHART_THEME.grid} />
              <XAxis dataKey="name" tick={{ fill: LIGHT_CHART_THEME.axis.fill, fontSize: LIGHT_CHART_THEME.axis.fontSize }} stroke={LIGHT_CHART_THEME.axis.stroke} />
              <YAxis tickFormatter={(v: number) => formatINRCompact(v)} tick={{ fill: LIGHT_CHART_THEME.axis.fill, fontSize: LIGHT_CHART_THEME.axis.fontSize }} stroke={LIGHT_CHART_THEME.axis.stroke} />
              <Tooltip content={<GlassTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={LIGHT_CHART_THEME.animation.duration}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <PrintDisclaimer />
    </div>
  );
}
