'use client';

import { useCallback } from 'react';
import { Shield, RotateCcw, Check, X } from 'lucide-react';
import { useInvestState, getDefaultWeights } from '@/lib/invest/context';
import type { RiskLevel, CategoryWeights } from '@/lib/invest/types';

const RISK_LABELS: Record<RiskLevel, string> = {
  1: 'Conservative',
  2: 'Mod Conservative',
  3: 'Moderate',
  4: 'Mod Aggressive',
  5: 'Aggressive',
};

const CATEGORIES: { key: keyof CategoryWeights; label: string; color: string }[] = [
  { key: 'equity', label: 'Equity', color: '#1e3a5f' },
  { key: 'debt', label: 'Debt', color: '#047857' },
  { key: 'hybrid', label: 'Hybrid', color: '#3b82f6' },
  { key: 'gold', label: 'Gold', color: '#d97706' },
  { key: 'international', label: "Int'l", color: '#7c3aed' },
];

interface Props {
  tab: 'sip' | 'swp' | 'lumpsum';
}

export function RiskAllocation({ tab }: Props) {
  const { state, dispatch } = useInvestState();
  const tabState = state[tab];
  const { riskLevel, categoryWeights } = tabState;
  const total = Object.values(categoryWeights).reduce((s, v) => s + v, 0);
  const isValid = total === 100;

  const setRisk = useCallback((level: RiskLevel) => {
    dispatch({ type: 'SET_RISK_LEVEL', payload: { tab, level } });
  }, [dispatch, tab]);

  const setWeight = useCallback((key: keyof CategoryWeights, val: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    dispatch({ type: 'SET_CATEGORY_WEIGHTS', payload: { tab, weights: { ...categoryWeights, [key]: clamped } } });
  }, [dispatch, tab, categoryWeights]);

  const resetWeights = useCallback(() => {
    dispatch({ type: 'SET_CATEGORY_WEIGHTS', payload: { tab, weights: getDefaultWeights(riskLevel) } });
  }, [dispatch, tab, riskLevel]);

  const normalizeWeights = useCallback(() => {
    if (total === 0) return;
    const keys = Object.keys(categoryWeights) as (keyof CategoryWeights)[];
    const normalized = { ...categoryWeights };
    let sum = 0;
    keys.forEach((k, i) => {
      if (i < keys.length - 1) {
        normalized[k] = Math.round((categoryWeights[k] / total) * 100);
        sum += normalized[k];
      } else {
        normalized[k] = 100 - sum;
      }
    });
    dispatch({ type: 'SET_CATEGORY_WEIGHTS', payload: { tab, weights: normalized } });
  }, [dispatch, tab, categoryWeights, total]);

  return (
    <div className="space-y-4">
      {/* Risk Slider */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          <Shield size={14} />
          <span>Risk Profile</span>
        </div>
        <div className="relative py-4">
          {/* Track background */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 rounded-full" style={{ background: '#d1d5db' }} />
          {/* Track filled */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-full transition-all duration-200" style={{ background: 'var(--accent-primary)', width: `${((riskLevel - 1) / 4) * 100}%` }} />
          {/* Dots */}
          <div className="relative flex justify-between">
            {([1, 2, 3, 4, 5] as RiskLevel[]).map(level => (
              <button
                key={level}
                onClick={() => setRisk(level)}
                className="w-8 h-8 rounded-full border-2 transition-all"
                style={{
                  background: level <= riskLevel ? 'var(--accent-primary)' : 'white',
                  borderColor: level <= riskLevel ? 'var(--accent-primary)' : '#d1d5db',
                  boxShadow: level === riskLevel ? '0 0 0 3px rgba(30,58,95,0.2)' : 'none',
                }}
                aria-label={RISK_LABELS[level]}
              />
            ))}
          </div>
          {/* Labels */}
          <div className="flex justify-between mt-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span>Conservative</span><span>Moderate</span><span>Aggressive</span>
          </div>
        </div>
      </div>

      {/* Category Weights */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Category Allocation</span>
          <button onClick={resetWeights} className="text-xs flex items-center gap-1 hover:underline" style={{ color: 'var(--accent-primary)' }}>
            <RotateCcw size={10} /> Reset
          </button>
        </div>
        <div className="space-y-1.5">
          {CATEGORIES.map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs w-10 shrink-0" style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.04)' }}>
                <div className="h-full rounded-full" style={{ width: `${categoryWeights[key]}%`, background: color, transition: 'width 200ms ease-out' }} />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  value={categoryWeights[key]}
                  onChange={e => setWeight(key, parseInt(e.target.value))}
                  className="w-10 text-xs text-right tabular-nums rounded px-1 py-0.5 border"
                  style={{ background: 'var(--bg-base)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                  aria-label={`${label} weight`}
                />
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 text-xs" style={{ color: isValid ? 'var(--positive)' : 'var(--negative)' }}>
          {!isValid && (
            <button onClick={normalizeWeights} className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: 'var(--accent-primary)', color: '#fff' }}>
              Normalize
            </button>
          )}
          {isValid ? <Check size={12} /> : <X size={12} />}
          <span className="tabular-nums font-medium">Total: {total}%</span>
        </div>
      </div>
    </div>
  );
}
