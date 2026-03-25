'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { RefreshCw, Loader2, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInvestState } from '@/lib/invest/context';
import { selectFunds, calculateAggregateReturn, getAlternativeFunds, FUND_CATALOG } from '@/lib/invest/fund-selection';
import { getFundNAV, searchFunds } from '@/lib/invest/api';
import { calculateCAGRFromNAV, type CAGRResult } from '@/lib/invest/cagr';
import type { RiskLevel, CategoryWeights, SelectedFund } from '@/lib/invest/types';

import { getCategoryAverage } from '@/lib/invest/category-averages';

const TIMEFRAMES = ['1y', '3y', '5y', '10y'] as const;

function getEquityKey(risk: RiskLevel): string {
  if (risk <= 2) return 'equity-conservative';
  if (risk === 3) return 'equity-moderate';
  return 'equity-aggressive';
}

function findCatalogKey(fund: SelectedFund, risk: RiskLevel): string {
  for (const [key, funds] of Object.entries(FUND_CATALOG)) {
    if (funds.some(f => f.schemeCode === fund.schemeCode)) return key;
  }
  return getEquityKey(risk);
}

interface Props {
  tab: 'sip' | 'swp' | 'lumpsum';
  investmentAmount: number;
  onReturnChange: (rate: number) => void;
}

export function FundCards({ tab, investmentAmount, onReturnChange }: Props) {
  const { state, dispatch } = useInvestState();
  const tabState = state[tab];
  const { riskLevel, categoryWeights, returnTimeframe } = tabState;

  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [overrideCagrs, setOverrideCagrs] = useState<Record<number, Record<string, number | null>>>({});
  const [swapOpen, setSwapOpen] = useState<number | null>(null);

  // Clear overrides on risk/weight/amount change
  const depsRef = useRef({ riskLevel, categoryWeights, investmentAmount });
  useEffect(() => {
    const prev = depsRef.current;
    if (prev.riskLevel !== riskLevel || prev.categoryWeights !== categoryWeights || prev.investmentAmount !== investmentAmount) {
      setOverrides({});
      setOverrideCagrs({});
      depsRef.current = { riskLevel, categoryWeights, investmentAmount };
    }
  }, [riskLevel, categoryWeights, investmentAmount]);

  // Synchronous fund selection from cache — instant, no loading state
  const { funds: baseFunds, remainder } = useMemo(
    () => selectFunds(riskLevel, categoryWeights, investmentAmount, tab),
    [riskLevel, categoryWeights, investmentAmount, tab]
  );

  // Apply overrides
  const displayFunds = useMemo(() => {
    if (Object.keys(overrides).length === 0) return baseFunds;
    return baseFunds.map(f => {
      const catKey = findCatalogKey(f, riskLevel);
      const overrideCode = overrides[catKey];
      if (!overrideCode || overrideCode === f.schemeCode) return f;
      const pool = FUND_CATALOG[catKey] ?? [];
      const alt = pool.find(p => p.schemeCode === overrideCode);
      if (!alt) return f;
      return {
        ...f,
        schemeCode: alt.schemeCode,
        schemeName: alt.schemeName,
        fundHouse: alt.fundHouse,
        category: alt.subcategory,
        cagr: overrideCagrs[overrideCode] ?? { '1y': null, '3y': null, '5y': null, '10y': null },
      };
    });
  }, [baseFunds, overrides, overrideCagrs, riskLevel]);

  // Aggregate return
  const aggregate = useMemo(() => calculateAggregateReturn(displayFunds, returnTimeframe), [displayFunds, returnTimeframe]);

  useEffect(() => {
    dispatch({ type: 'SET_SELECTED_FUNDS', payload: { tab, funds: displayFunds } });
  }, [displayFunds, dispatch, tab]);

  useEffect(() => {
    dispatch({ type: 'SET_AGGREGATE_RETURN', payload: { tab, value: aggregate.value } });
    // Don't push 0% to calculator when there's no data — keep existing rate
    if (!aggregate.noData) {
      onReturnChange(aggregate.value);
    }
  }, [aggregate.value, aggregate.noData, dispatch, tab, onReturnChange]);

  const setTimeframe = useCallback((tf: typeof TIMEFRAMES[number]) => {
    dispatch({ type: 'SET_RETURN_TIMEFRAME', payload: { tab, timeframe: tf } });
  }, [dispatch, tab]);

  const handleSwap = useCallback(async (index: number, newCode: number) => {
    const fund = displayFunds[index];
    if (!fund) return;
    const catKey = findCatalogKey(baseFunds[index], riskLevel);

    // Fetch CAGR for swapped fund (only swap needs async)
    let cagr: Record<string, number | null> = { '1y': null, '3y': null, '5y': null, '10y': null };
    try {
      const nav = await getFundNAV(newCode);
      cagr = { ...calculateCAGRFromNAV(nav) };
    } catch { /* leave nulls */ }

    setOverrideCagrs(prev => ({ ...prev, [newCode]: cagr }));
    setOverrides(prev => ({ ...prev, [catKey]: newCode }));
    setSwapOpen(null);
  }, [displayFunds, baseFunds, riskLevel]);

  if (displayFunds.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Aggregate <span className="font-semibold tabular-nums" style={{ color: 'var(--accent-primary)' }}>{returnTimeframe.toUpperCase()}</span> CAGR:{' '}
          {aggregate.noData ? (
            <span className="font-bold" style={{ color: 'var(--warning)' }}>
              No data
            </span>
          ) : (
            <span className="font-bold tabular-nums" style={{ color: 'var(--positive)' }}>
              {aggregate.value}%
            </span>
          )}
          {aggregate.isPartial && !aggregate.noData && (
            <span className="text-[10px] ml-1" style={{ color: 'var(--text-muted)' }}>
              ({aggregate.usedCategoryAvg} using category avg)
            </span>
          )}
          {aggregate.noData && (
            <span className="text-[10px] ml-1" style={{ color: 'var(--text-muted)' }}>
              — try a shorter timeframe
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className="px-2 py-0.5 text-xs rounded-full transition-all"
              style={{
                background: returnTimeframe === tf ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                color: returnTimeframe === tf ? '#fff' : 'var(--text-muted)',
                fontWeight: returnTimeframe === tf ? 600 : 400,
              }}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Fund list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {displayFunds.map((fund, i) => (
            <motion.div
              key={`${fund.schemeCode}-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <div
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:-translate-y-px hover:shadow-md"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--glass-border)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{fund.schemeName}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{fund.category} · {fund.fundHouse}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)', fontSize: 9 }}>Allocation</p>
                  <p className="text-sm font-semibold tabular-nums" style={{ color: 'var(--accent-primary)' }}>{fund.allocation}%</p>
                  <p className="text-xs uppercase tracking-wider mt-1.5 mb-0.5" style={{ color: 'var(--text-muted)', fontSize: 9 }}>{returnTimeframe.toUpperCase()} Return</p>
                  <p className="text-xs tabular-nums" style={{ color: fund.cagr[returnTimeframe] != null ? 'var(--positive)' : 'var(--text-muted)' }}>
                    {fund.cagr[returnTimeframe] != null
                      ? `${fund.cagr[returnTimeframe]}%`
                      : (() => {
                          const catAvg = getCategoryAverage(fund.category, returnTimeframe);
                          return catAvg != null
                            ? <span title={`Category average (${fund.category})`}>~{catAvg}% <span className="text-[9px] opacity-60">avg</span></span>
                            : '—';
                        })()
                    }
                  </p>
                </div>
                <button
                  onClick={() => setSwapOpen(swapOpen === i ? null : i)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-black/5"
                  aria-label={`Swap ${fund.schemeName}`}
                  title="Swap fund"
                >
                  <RefreshCw size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              {/* Swap popover */}
              {swapOpen === i && (
                <SwapPopover
                  fund={fund}
                  originalFund={baseFunds[i]}
                  riskLevel={riskLevel}
                  onSelect={(code) => handleSwap(i, code)}
                  onClose={() => setSwapOpen(null)}
                  returnTimeframe={returnTimeframe}
                />
              )}
            </motion.div>
          ))}

          {/* Show "Others" row when some categories didn't get a dedicated fund */}
          {remainder > 0 && (
            <div
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--glass-border)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Others (Gold, International, etc.)</p>
                <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>Increase SIP amount to add dedicated funds for these categories</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)', fontSize: 9 }}>Allocation</p>
                <p className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-muted)' }}>{remainder}%</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Swap Popover ---

function SwapPopover({ fund, originalFund, riskLevel, onSelect, onClose, returnTimeframe }: {
  fund: SelectedFund;
  originalFund: SelectedFund;
  riskLevel: RiskLevel;
  onSelect: (code: number) => void;
  onClose: () => void;
  returnTimeframe: string;
}) {
  const catKey = findCatalogKey(originalFund, riskLevel);
  const alternatives = getAlternativeFunds(catKey, fund.schemeCode);
  const [altCagrs, setAltCagrs] = useState<Record<number, CAGRResult>>({});
  const [loadingAlts, setLoadingAlts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ schemeCode: number; schemeName: string }>>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Fetch CAGR for alternatives on mount
  useEffect(() => {
    let cancelled = false;
    Promise.allSettled(
      alternatives.map(async alt => {
        const nav = await getFundNAV(alt.schemeCode);
        const cagr = calculateCAGRFromNAV(nav);
        if (!cancelled) setAltCagrs(prev => ({ ...prev, [alt.schemeCode]: cagr }));
      })
    ).finally(() => { if (!cancelled) setLoadingAlts(false); });
    return () => { cancelled = true; };
  }, [alternatives]);

  // Search handler
  useEffect(() => {
    if (searchQuery.length < 3) { setSearchResults([]); return; }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchFunds(searchQuery);
        setSearchResults(results.slice(0, 8).map(r => ({ schemeCode: r.schemeCode, schemeName: r.schemeName })));
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  return (
    <div
      className="absolute z-50 left-0 right-0 mt-1 rounded-xl p-3 space-y-2 max-h-72 overflow-y-auto"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Alternatives</span>
        <button onClick={onClose} className="p-1 rounded hover:bg-black/5"><X size={12} /></button>
      </div>

      {loadingAlts ? (
        <div className="flex items-center gap-2 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={12} className="animate-spin" /> Loading alternatives...
        </div>
      ) : alternatives.length === 0 ? (
        <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>No alternatives in this category</p>
      ) : (
        alternatives.map(alt => {
          const cagr = altCagrs[alt.schemeCode];
          const cagrVal = cagr?.[returnTimeframe as keyof CAGRResult];
          return (
            <button
              key={alt.schemeCode}
              onClick={() => onSelect(alt.schemeCode)}
              className="w-full text-left flex items-center justify-between rounded-lg px-2 py-2 hover:bg-black/5 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{alt.schemeName}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{alt.fundHouse}</p>
              </div>
              <span className="text-xs font-semibold tabular-nums shrink-0 ml-2" style={{ color: cagrVal != null ? 'var(--positive)' : 'var(--text-muted)' }}>
                {cagrVal != null ? `${cagrVal}%` : '—'}
              </span>
            </button>
          );
        })
      )}

      {/* Search */}
      <div className="pt-1 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: 'var(--bg-base)', border: '1px solid var(--glass-border)' }}>
          <Search size={12} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search any fund..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 text-xs bg-transparent outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          {searching && <Loader2 size={12} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
        </div>
        {searchResults.map(r => (
          <button
            key={r.schemeCode}
            onClick={() => onSelect(r.schemeCode)}
            className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-black/5 truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {r.schemeName}
          </button>
        ))}
      </div>
    </div>
  );
}
