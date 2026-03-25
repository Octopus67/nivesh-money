'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EASE } from '@/lib/invest/animations';
import { formatINR, formatCompact } from '@/lib/invest/format';
import { swpCalculate } from '@/lib/invest/calculator-math';
import { PremiumSlider } from '@/components/invest/premium-slider';
import { ResultCard } from '@/components/invest/result-card';
import { RiskAllocation } from '@/components/invest/risk-allocation';
import { FundCards } from '@/components/invest/fund-cards';
import dynamic from 'next/dynamic';

const DepletionChart = dynamic(() => import('@/components/invest/charts/depletion-chart'), { ssr: false });

// BUG 6: Dynamic withdrawal range based on corpus
function getWithdrawalParams(corpus: number) {
  const minWithdrawal = Math.max(1000, Math.round(corpus * 0.005 / 12 / 1000) * 1000);
  const maxWithdrawal = Math.max(minWithdrawal + 1000, Math.round(corpus * 0.12 / 12 / 1000) * 1000);
  const defaultWithdrawal = Math.max(minWithdrawal, Math.round(corpus * 0.035 / 12 / 1000) * 1000);
  const step = maxWithdrawal > 100000 ? 5000 : maxWithdrawal > 50000 ? 2000 : 1000;
  return { minWithdrawal, maxWithdrawal, defaultWithdrawal, step };
}

function getSWRBadge(annualRate: number): { color: string; label: string } {
  if (annualRate <= 3.5) return { color: 'var(--positive)', label: '✓ Sustainable' };
  if (annualRate <= 6) return { color: 'var(--warning)', label: '⚠ Moderate risk' };
  return { color: 'var(--negative)', label: '⚠ High depletion risk' };
}

export default function SWPCalculator() {
  const [corpus, setCorpus] = useState(10000000);
  const wp = useMemo(() => getWithdrawalParams(corpus), [corpus]);
  const [withdrawal, setWithdrawal] = useState(() => getWithdrawalParams(10000000).defaultWithdrawal);
  const [rate, setRate] = useState(8);
  const [isAutoRate, setIsAutoRate] = useState(true);

  // Only reset withdrawal if current value is outside the new valid range
  useEffect(() => {
    if (withdrawal < wp.minWithdrawal || withdrawal > wp.maxWithdrawal) {
      setWithdrawal(wp.defaultWithdrawal);
    }
  }, [corpus]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReturnChange = useCallback((autoRate: number) => {
    if (isAutoRate) setRate(autoRate);
  }, [isAutoRate]);

  const result = useMemo(() => swpCalculate(corpus, withdrawal, rate), [corpus, withdrawal, rate]);

  const chartData = useMemo(
    () => result.monthlyData.map(d => ({ x: d.month, y: d.balance, label: d.month % 60 === 0 ? `${d.month / 12}Y` : undefined })),
    [result]
  );

  const annualWithdrawalRate = corpus > 0 ? ((withdrawal * 12) / corpus) * 100 : 0;
  const badge = getSWRBadge(annualWithdrawalRate);

  const insight = result.depletionYear
    ? `Your ${formatCompact(corpus)} corpus can sustain ${formatCompact(withdrawal)}/mo for ${result.depletionYear} years at ${rate}% returns`
    : `Your ${formatCompact(corpus)} corpus sustains ${formatCompact(withdrawal)}/mo indefinitely at ${rate}% returns — ${formatCompact(result.remaining)} remaining after 40 years`;

  const safeWithdrawal = Math.round((corpus * 0.04) / 12 / 1000) * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE.out }}
      className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6"
    >
      <div className="space-y-5 rounded-2xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}>
        <PremiumSlider label="Initial investment" min={100000} max={5000000000} step={100000}
          value={corpus} onChange={setCorpus} formatValue={formatINR} />
        <PremiumSlider label="Monthly withdrawal" min={wp.minWithdrawal} max={wp.maxWithdrawal} step={wp.step}
          value={Math.min(Math.max(withdrawal, wp.minWithdrawal), wp.maxWithdrawal)} onChange={setWithdrawal} formatValue={formatINR} />

        <div className="flex items-center justify-between text-xs px-1">
          <span style={{ color: 'var(--text-muted)' }}>Annual rate: {annualWithdrawalRate.toFixed(1)}%</span>
          <span className="font-semibold tabular-nums px-2 py-0.5 rounded-full text-[11px]" style={{ color: '#fff', background: badge.color }}>
            {badge.label}
          </span>
        </div>

        <RiskAllocation tab="swp" />
        <FundCards tab="swp" investmentAmount={corpus} onReturnChange={handleReturnChange} />

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
          <PremiumSlider label="" min={1} max={20} step={0.25}
            value={rate} onChange={v => { setRate(v); setIsAutoRate(false); }} formatValue={v => `${v}%`} />
          {!isAutoRate && (
            <p className="text-[10px] mt-1" style={{ color: 'var(--warning)' }}>Using custom return rate</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}>
          <DepletionChart data={chartData} withdrawal={withdrawal} />
        </div>

        {result.depletionYear && result.depletionYear < 30 && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.12)', color: 'var(--negative)' }}>
            At this rate, your corpus depletes in {result.depletionYear} years. Consider reducing withdrawal to {formatINR(safeWithdrawal)}/mo for a 30-year horizon.
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <ResultCard label="Total Withdrawn" value={result.totalWithdrawn} />
          <ResultCard label="Remaining" value={result.remaining} barPercent={corpus > 0 ? Math.round((result.remaining / corpus) * 100) : 0} barColor="var(--positive)" />
          <ResultCard label={result.depletionYear ? 'Depletes In' : 'Lasts'} value={result.depletionYear ?? 40} accent format="years" />
        </div>

        <p className="text-sm px-1" style={{ color: 'var(--text-secondary)' }}>{insight}</p>
      </div>
    </motion.div>
  );
}
