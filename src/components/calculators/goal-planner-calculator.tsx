'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Share2, Printer } from 'lucide-react';
import { PremiumSlider } from '@/components/ui/premium-slider';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { GlassCard } from '@/components/ui/glass-card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { GlassTooltip } from '@/components/charts/glass-tooltip';
import { calculateGoalPlanner } from '@/lib/calculators';
import { formatINRCompact } from '@/lib/utils';
import { shareCalculator, decodeCalcParams } from '@/lib/share';
import { LIGHT_CHART_THEME, ChartGradient } from '@/lib/chart-theme';
import { PrintHeader } from '@/components/shared/print-header';
import { PrintDisclaimer } from '@/components/shared/print-disclaimer';
import { PrintInputSummary } from '@/components/shared/print-input-summary';

const GOAL_TYPES = [
  { label: 'Child Education', inflation: 10 },
  { label: 'House', inflation: 7 },
  { label: 'Wedding', inflation: 7 },
  { label: 'Car', inflation: 5 },
  { label: 'Vacation', inflation: 6 },
  { label: 'Custom', inflation: 6 },
] as const;

export function GoalPlannerCalculator() {
  const searchParams = useSearchParams();
  const initial = decodeCalcParams(
    Object.fromEntries(searchParams.entries()),
    { target: 5000000, years: 15, annualReturn: 12, inflation: 10 }
  );

  const [goalType, setGoalType] = useState('Child Education');
  const [targetAmount, setTargetAmount] = useState(initial.target);
  const [years, setYears] = useState(initial.years);
  const [returnRate, setReturnRate] = useState(initial.annualReturn);
  const [inflation, setInflation] = useState(initial.inflation);

  const handleGoalChange = (val: string | null) => {
    if (!val) return;
    setGoalType(val);
    const goal = GOAL_TYPES.find((g) => g.label === val);
    if (goal) setInflation(goal.inflation);
  };

  const result = useMemo(() => calculateGoalPlanner(targetAmount, years, returnRate, inflation), [targetAmount, years, returnRate, inflation]);

  const chartData = useMemo(() => {
    const r = returnRate / 100 / 12;
    return Array.from({ length: years + 1 }, (_, y) => {
      const n = y * 12;
      const corpus = n === 0 ? 0 : result.monthlySIP * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
      return { year: y, corpus: Math.round(corpus) };
    });
  }, [years, returnRate, result.monthlySIP]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PrintHeader />
        <PrintInputSummary inputs={{
          'Goal Type': goalType,
          'Target Amount': formatINRCompact(targetAmount),
          'Years to Goal': `${years} years`,
          'Expected Return': `${returnRate}%`,
          'Inflation': `${inflation}%`,
        }} />
        {/* Inputs */}
        <div className="space-y-6">
          {/* Goal Type Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Goal Type</label>
            <Select value={goalType} onValueChange={handleGoalChange}>
              <SelectTrigger className="w-full h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOAL_TYPES.map((g) => (
                  <SelectItem key={g.label} value={g.label}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <PremiumSlider label="Target Amount" min={100000} max={200000000} step={50000} value={targetAmount} onChange={setTargetAmount} formatValue={formatINRCompact} />
          <PremiumSlider label="Years to Goal" min={1} max={30} step={1} value={years} onChange={setYears} formatValue={(v) => `${v} yrs`} />
          <PremiumSlider label="Expected Return (%)" min={8} max={18} step={0.5} value={returnRate} onChange={setReturnRate} formatValue={(v) => `${v}%`} />
          <PremiumSlider label="Inflation (%)" min={3} max={15} step={0.5} value={inflation} onChange={setInflation} formatValue={(v) => `${v}%`} />
        </div>

        {/* Results + Chart */}
        <div className="space-y-6">
          {/* Result Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <GlassCard variant="subtle" className="p-4 border-l-[3px] border-l-emerald-600">
              <p className="text-xs text-[var(--text-muted)] mb-1">Monthly SIP needed</p>
              <AnimatedNumber value={result.monthlySIP} className="text-lg md:text-xl text-emerald-700" suffix="/mo" />
            </GlassCard>
            <GlassCard variant="subtle" className="p-4 border-l-[3px] border-l-[var(--color-navy)]">
              <p className="text-xs text-[var(--text-muted)] mb-1">Or invest today</p>
              <AnimatedNumber value={result.lumpsum} className="text-lg md:text-xl" />
            </GlassCard>
            <GlassCard variant="subtle" className="p-4 border-l-[3px] border-l-amber-500">
              <p className="text-xs text-[var(--text-muted)] mb-1">Inflation-adjusted goal</p>
              <AnimatedNumber value={result.adjustedTarget} className="text-lg md:text-xl" />
            </GlassCard>
          </div>

          {/* Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <ChartGradient id="goalCorpusFill" color="#059669" />
                </defs>
                <CartesianGrid strokeDasharray={LIGHT_CHART_THEME.grid.strokeDasharray} stroke={LIGHT_CHART_THEME.grid.stroke} />
                <XAxis dataKey="year" tick={{ fill: LIGHT_CHART_THEME.axis.fill, fontSize: LIGHT_CHART_THEME.axis.fontSize }} stroke={LIGHT_CHART_THEME.axis.stroke} />
                <YAxis tickFormatter={(v: number) => formatINRCompact(v)} tick={{ fill: LIGHT_CHART_THEME.axis.fill, fontSize: LIGHT_CHART_THEME.axis.fontSize }} stroke={LIGHT_CHART_THEME.axis.stroke} width={70} />
                <Tooltip content={<GlassTooltip />} />
                <Area type="monotone" dataKey="corpus" name="Corpus" stroke="#059669" strokeWidth={2.5} fill="url(#goalCorpusFill)" isAnimationActive animationDuration={LIGHT_CHART_THEME.animation.duration} />
                <ReferenceLine y={result.adjustedTarget} stroke="#d97706" strokeDasharray="8 4" label={{ value: 'Goal', fill: '#d97706', fontSize: 12 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => shareCalculator('/calculators/goal-planner', { target: targetAmount, years, return: returnRate, inflation })} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-black/10 hover:bg-black/5 transition-colors">
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
