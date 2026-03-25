'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Share2, Printer } from 'lucide-react';
import { PremiumSlider } from '@/components/ui/premium-slider';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassTooltip } from '@/components/charts/glass-tooltip';
import { calculateRetirement } from '@/lib/calculators';
import { formatINRCompact } from '@/lib/utils';
import { shareCalculator, decodeCalcParams } from '@/lib/share';
import { LIGHT_CHART_THEME, ChartGradient } from '@/lib/chart-theme';
import { PrintHeader } from '@/components/shared/print-header';
import { PrintDisclaimer } from '@/components/shared/print-disclaimer';
import { PrintInputSummary } from '@/components/shared/print-input-summary';

export function RetirementCalculator() {
  const searchParams = useSearchParams();
  const defaults = decodeCalcParams(
    Object.fromEntries(searchParams.entries()),
    { currentAge: 30, retirementAge: 60, monthlyExpenses: 50000, inflation: 6, preReturn: 12, postReturn: 8, retirementYears: 25, existingSavings: 0 }
  );

  const [currentAge, setCurrentAge] = useState(defaults.currentAge);
  const [retirementAge, setRetirementAge] = useState(defaults.retirementAge);
  const [monthlyExpenses, setMonthlyExpenses] = useState(defaults.monthlyExpenses);
  const [inflation, setInflation] = useState(defaults.inflation);
  const [preReturn, setPreReturn] = useState(defaults.preReturn);
  const [postReturn, setPostReturn] = useState(defaults.postReturn);
  const [retirementYears, setRetirementYears] = useState(defaults.retirementYears);
  const [existingSavings, setExistingSavings] = useState(defaults.existingSavings);

  const result = useMemo(
    () => calculateRetirement(currentAge, retirementAge, monthlyExpenses, inflation, preReturn, postReturn, retirementYears, existingSavings),
    [currentAge, retirementAge, monthlyExpenses, inflation, preReturn, postReturn, retirementYears, existingSavings]
  );

  const chartData = useMemo(() => {
    const data: { age: number; accumulation: number; distribution: number }[] = [];
    const yearsToRetire = retirementAge - currentAge;
    const r = preReturn / 100 / 12;

    // Accumulation phase
    let corpus = existingSavings;
    for (let y = 0; y <= yearsToRetire; y++) {
      data.push({ age: currentAge + y, accumulation: Math.round(corpus), distribution: 0 });
      if (y < yearsToRetire) {
        corpus = corpus * Math.pow(1 + preReturn / 100, 1) + result.monthlySIP * 12 * ((Math.pow(1 + r, 12) - 1) / r) * (1 + r);
      }
    }

    // Distribution phase
    let remaining = result.corpusNeeded;
    const postR = postReturn / 100;
    let annualExpense = result.futureMonthlyExpense * 12;
    for (let y = 1; y <= retirementYears; y++) {
      remaining = remaining * (1 + postR) - annualExpense;
      annualExpense *= (1 + inflation / 100);
      data.push({ age: retirementAge + y, accumulation: 0, distribution: Math.max(0, Math.round(remaining)) });
    }
    return data;
  }, [currentAge, retirementAge, retirementYears, existingSavings, preReturn, postReturn, inflation, result]);

  const onTrack = result.gap === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PrintHeader />
        <PrintInputSummary inputs={{
          'Current Age': `${currentAge} yrs`,
          'Retirement Age': `${retirementAge} yrs`,
          'Monthly Expenses': formatINRCompact(monthlyExpenses),
          'Inflation': `${inflation}%`,
          'Pre-Retirement Return': `${preReturn}%`,
          'Post-Retirement Return': `${postReturn}%`,
        }} />
        {/* Inputs */}
        <div className="space-y-5">
          <PremiumSlider label="Current Age" min={18} max={60} step={1} value={currentAge} onChange={setCurrentAge} formatValue={(v) => `${v} yrs`} />
          <PremiumSlider label="Retirement Age" min={45} max={75} step={1} value={retirementAge} onChange={setRetirementAge} formatValue={(v) => `${v} yrs`} />
          <PremiumSlider label="Monthly Expenses" min={10000} max={2000000} step={5000} value={monthlyExpenses} onChange={setMonthlyExpenses} formatValue={formatINRCompact} />
          <PremiumSlider label="Inflation (%)" min={3} max={12} step={0.5} value={inflation} onChange={setInflation} formatValue={(v) => `${v}%`} />
          <PremiumSlider label="Pre-Retirement Return (%)" min={8} max={18} step={0.5} value={preReturn} onChange={setPreReturn} formatValue={(v) => `${v}%`} />
          <PremiumSlider label="Post-Retirement Return (%)" min={4} max={12} step={0.5} value={postReturn} onChange={setPostReturn} formatValue={(v) => `${v}%`} />
          <PremiumSlider label="Years in Retirement" min={10} max={40} step={1} value={retirementYears} onChange={setRetirementYears} formatValue={(v) => `${v} yrs`} />
          <PremiumSlider label="Existing Savings" min={0} max={200000000} step={100000} value={existingSavings} onChange={setExistingSavings} formatValue={formatINRCompact} />
        </div>

        {/* Results + Chart */}
        <div className="space-y-6">
          {/* Result Cards */}
          <div className="grid grid-cols-2 gap-3">
            <GlassCard variant="subtle" className="p-4 border-l-[3px] border-l-amber-500">
              <p className="text-xs text-[var(--text-muted)] mb-1">Monthly expense at retirement</p>
              <AnimatedNumber value={result.futureMonthlyExpense} className="text-base md:text-lg" />
            </GlassCard>
            <GlassCard variant="subtle" className="p-4 border-l-[3px] border-l-[var(--color-navy)]">
              <p className="text-xs text-[var(--text-muted)] mb-1">Corpus required</p>
              <AnimatedNumber value={result.corpusNeeded} className="text-base md:text-lg" />
            </GlassCard>
            <GlassCard variant="subtle" className="p-4 border-l-[3px] border-l-emerald-600">
              <p className="text-xs text-[var(--text-muted)] mb-1">Start SIP of</p>
              <AnimatedNumber value={result.monthlySIP} className="text-base md:text-lg text-emerald-700" suffix="/mo" />
            </GlassCard>
            <GlassCard variant="subtle" className={`p-4 border-l-[3px] ${onTrack ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
              <p className="text-xs text-[var(--text-muted)] mb-1">{onTrack ? '↑ Surplus' : '↓ Gap'}</p>
              <AnimatedNumber value={result.gap} className={`text-base md:text-lg ${onTrack ? 'text-emerald-700' : 'text-red-600'}`} />
            </GlassCard>
          </div>

          {onTrack && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-sm text-emerald-700 font-medium">
              ✓ Your savings are on track!
            </div>
          )}

          {/* Chart */}
          <div className="w-full min-h-[200px] h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <ChartGradient id="accumFill" color="#059669" />
                  <ChartGradient id="distFill" color="#d97706" />
                </defs>
                <CartesianGrid strokeDasharray={LIGHT_CHART_THEME.grid.strokeDasharray} stroke={LIGHT_CHART_THEME.grid.stroke} />
                <XAxis dataKey="age" tick={{ fill: LIGHT_CHART_THEME.axis.fill, fontSize: LIGHT_CHART_THEME.axis.fontSize }} stroke={LIGHT_CHART_THEME.axis.stroke} />
                <YAxis tickFormatter={(v: number) => formatINRCompact(v)} tick={{ fill: LIGHT_CHART_THEME.axis.fill, fontSize: LIGHT_CHART_THEME.axis.fontSize }} stroke={LIGHT_CHART_THEME.axis.stroke} width={70} />
                <Tooltip content={<GlassTooltip />} />
                <Area type="monotone" dataKey="accumulation" name="Accumulation" stroke="#059669" strokeWidth={2.5} fill="url(#accumFill)" isAnimationActive animationDuration={LIGHT_CHART_THEME.animation.duration} />
                <Area type="monotone" dataKey="distribution" name="Distribution" stroke="#d97706" strokeWidth={2} fill="url(#distFill)" isAnimationActive animationDuration={LIGHT_CHART_THEME.animation.duration} />
                <ReferenceLine x={retirementAge} stroke="#1e3a5f" strokeDasharray="4 4" label={{ value: 'Retirement', fill: '#1e3a5f', fontSize: 12 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => shareCalculator('/calculators/retirement', { currentAge, retirementAge, monthlyExpenses, inflation, preReturn, postReturn, retirementYears, existingSavings })} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-black/10 hover:bg-black/5 transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-black/10 hover:bg-black/5 transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>
        <PrintDisclaimer />
      </div>
  );
}
