'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { EASE } from '@/lib/invest/animations';
import { formatINR, formatCompact } from '@/lib/invest/format';
import { lumpSumCalculate } from '@/lib/invest/calculator-math';
import { PremiumSlider } from '@/components/invest/premium-slider';
import { ResultCard } from '@/components/invest/result-card';
import { RiskAllocation } from '@/components/invest/risk-allocation';
import { FundCards } from '@/components/invest/fund-cards';
import dynamic from 'next/dynamic';

const GrowthChart = dynamic(() => import('@/components/invest/charts/growth-chart'), { ssr: false });

const MILESTONES = [
  { value: 1000000, label: '₹10L' },
  { value: 5000000, label: '₹50L' },
  { value: 10000000, label: '₹1Cr' },
];

export default function LumpSumCalculator() {
  const [amount, setAmount] = useState(100000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);
  const [isAutoRate, setIsAutoRate] = useState(true);

  const handleReturnChange = useCallback((autoRate: number) => {
    if (isAutoRate) setRate(autoRate);
  }, [isAutoRate]);

  const result = useMemo(() => lumpSumCalculate(amount, years, rate), [amount, years, rate]);

  const chartData = useMemo(() => result.yearlyData.map(d => ({ x: d.year, y: d.value })), [result]);

  const investedPct = result.finalValue > 0 ? Math.round((result.invested / result.finalValue) * 100) : 0;
  const multiple = result.invested > 0 ? (result.finalValue / result.invested).toFixed(2) : '0';

  const insight = `Your ${formatCompact(amount)} grows to ${formatCompact(result.finalValue)} in ${years} years at ${rate}% CAGR — ${multiple}x your investment`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE.out }}
      className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6"
    >
      <div className="space-y-5 rounded-2xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}>
        <PremiumSlider label="Investment amount" min={1000} max={5000000000} step={1000}
          value={amount} onChange={setAmount} formatValue={formatINR} />
        <PremiumSlider label="Investment period" min={1} max={40} step={1}
          value={years} onChange={setYears} formatValue={v => `${v} years`} />

        <RiskAllocation tab="lumpsum" />
        <FundCards tab="lumpsum" investmentAmount={amount} onReturnChange={handleReturnChange} />

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Expected return</span>
            <button
              onClick={() => setIsAutoRate(!isAutoRate)}
              className="text-[10px] hover:underline"
              style={{ color: 'var(--accent-primary)' }}
            >
              {isAutoRate ? 'Override' : 'Use auto'}
            </button>
          </div>
          <PremiumSlider label="" min={1} max={30} step={0.25}
            value={rate} onChange={v => { setRate(v); setIsAutoRate(false); }} formatValue={v => `${v}%`} />
          {!isAutoRate && (
            <p className="text-[10px] mt-1" style={{ color: 'var(--warning)' }}>Using custom return rate</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}>
          <GrowthChart data={chartData} milestones={MILESTONES} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <ResultCard label="Invested" value={result.invested} barPercent={investedPct} barColor="var(--text-muted)" />
          <ResultCard label="Returns" value={result.returns} barPercent={100 - investedPct} barColor="var(--positive)" />
          <ResultCard label="Final Value" value={result.finalValue} accent barPercent={100} />
        </div>

        <p className="text-sm px-1" style={{ color: 'var(--text-secondary)' }}>{insight}</p>
      </div>
    </motion.div>
  );
}
