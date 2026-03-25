'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { EASE } from '@/lib/invest/animations';
import { getFundDetail, getFundNAV } from '@/lib/invest/api';
import type { FundSummary, FundDetail, NAVDataPoint } from '@/lib/invest/types';
import { FundSelector } from './comparison/fund-search';
import { ComparisonTable } from './comparison/comparison-table';

const ComparisonChart = dynamic(() => import('@/components/invest/charts/comparison-chart'), { ssr: false });

const TIME_RANGES = [
  { key: '1y', label: '1Y', years: 1 },
  { key: '3y', label: '3Y', years: 3 },
  { key: '5y', label: '5Y', years: 5 },
  { key: '10y', label: '10Y', years: 10 },
  { key: 'max', label: 'MAX', years: 100 },
] as const;

const DEFAULT_A: FundSummary = { schemeCode: 120716, schemeName: 'UTI Nifty 50 Index Fund - Direct Growth', fundHouse: 'UTI Mutual Fund', category: 'Index Fund', isin: '' };
const DEFAULT_B: FundSummary = { schemeCode: 122639, schemeName: 'Parag Parikh Flexi Cap Fund - Direct Growth', fundHouse: 'PPFAS Mutual Fund', category: 'Flexi Cap', isin: '' };

// BUG 2: Static snapshots for instant initial render
const DEFAULT_SNAPSHOTS: Record<number, Partial<FundDetail>> = {
  120716: {
    schemeCode: 120716,
    schemeName: 'UTI Nifty 50 Index Fund - Direct Plan - Growth',
    fundHouse: 'UTI Mutual Fund',
    category: 'Index Fund',
    returns: { '1y': null, '3y': null, '5y': null, '10y': null, sinceInception: null },
  },
  122639: {
    schemeCode: 122639,
    schemeName: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
    fundHouse: 'PPFAS Mutual Fund',
    category: 'Flexi Cap',
    returns: { '1y': null, '3y': null, '5y': null, '10y': null, sinceInception: null },
  },
};

interface FundData {
  detail: Partial<FundDetail>;
  nav: NAVDataPoint[];
}

export default function FundComparison() {
  const [fundA, setFundA] = useState<FundSummary>(DEFAULT_A);
  const [fundB, setFundB] = useState<FundSummary>(DEFAULT_B);
  const [dataA, setDataA] = useState<FundData | null>(null);
  const [dataB, setDataB] = useState<FundData | null>(null);
  // BUG 1: Per-fund loading states instead of global
  const [loadingA, setLoadingA] = useState(true);
  const [loadingB, setLoadingB] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<string>('5y');

  // BUG 1: AbortController refs per fund
  const abortA = useRef<AbortController | null>(null);
  const abortB = useRef<AbortController | null>(null);

  const sameSelected = fundA.schemeCode === fundB.schemeCode;

  // BUG 2: Deduplicated fetch — single API call for both detail + NAV
  const fetchFund = useCallback(async (code: number, signal: AbortSignal): Promise<FundData> => {
    // getFundDetail already fetches the full /mf/{code} response which includes NAV history
    // and caches it. getFundNAV fetches the same endpoint. We call getFundDetail first
    // which populates the cache, then getFundNAV hits cache.
    const detail = await getFundDetail(code, signal);
    const nav = await getFundNAV(code, signal);
    return { detail, nav };
  }, []);

  // BUG 1: Separate effect for Fund A
  useEffect(() => {
    if (sameSelected) { setLoadingA(false); return; }
    abortA.current?.abort();
    const ac = new AbortController();
    abortA.current = ac;
    setLoadingA(true);
    // Clear old data for this slot immediately
    setDataA(DEFAULT_SNAPSHOTS[fundA.schemeCode] ? { detail: DEFAULT_SNAPSHOTS[fundA.schemeCode], nav: [] } : null);

    fetchFund(fundA.schemeCode, ac.signal)
      .then(a => {
        // BUG 1: Guard — discard if schemeCode doesn't match current selection
        if (a.detail.schemeCode !== fundA.schemeCode) return;
        setDataA(a);
      })
      .catch(e => { if (e.name !== 'AbortError') setError('Unable to load Fund A data.'); })
      .finally(() => { if (!ac.signal.aborted) setLoadingA(false); });

    return () => ac.abort();
  }, [fundA.schemeCode, sameSelected, fetchFund]);

  // BUG 1: Separate effect for Fund B
  useEffect(() => {
    if (sameSelected) { setLoadingB(false); return; }
    abortB.current?.abort();
    const ac = new AbortController();
    abortB.current = ac;
    setLoadingB(true);
    setDataB(DEFAULT_SNAPSHOTS[fundB.schemeCode] ? { detail: DEFAULT_SNAPSHOTS[fundB.schemeCode], nav: [] } : null);

    fetchFund(fundB.schemeCode, ac.signal)
      .then(b => {
        if (b.detail.schemeCode !== fundB.schemeCode) return;
        setDataB(b);
      })
      .catch(e => { if (e.name !== 'AbortError') setError('Unable to load Fund B data.'); })
      .finally(() => { if (!ac.signal.aborted) setLoadingB(false); });

    return () => ac.abort();
  }, [fundB.schemeCode, sameSelected, fetchFund]);

  const loading = loadingA || loadingB;
  const hasNav = !!(dataA?.nav.length && dataB?.nav.length);

  const filteredNav = useMemo(() => {
    if (!hasNav) return { a: [], b: [] };
    const rangeObj = TIME_RANGES.find(r => r.key === range)!;
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - rangeObj.years);
    return {
      a: rangeObj.key === 'max' ? dataA!.nav : dataA!.nav.filter(d => d.date >= cutoff),
      b: rangeObj.key === 'max' ? dataB!.nav : dataB!.nav.filter(d => d.date >= cutoff),
    };
  }, [dataA, dataB, range, hasNav]);

  const startDate = useMemo(() => {
    if (!filteredNav.a.length || !filteredNav.b.length) return null;
    const firstA = filteredNav.a.reduce((m, d) => d.date < m ? d.date : m, filteredNav.a[0].date);
    const firstB = filteredNav.b.reduce((m, d) => d.date < m ? d.date : m, filteredNav.b[0].date);
    return firstA > firstB ? firstA : firstB;
  }, [filteredNav]);

  // BUG 1: Only show table when detail matches selected funds
  const tableReady = dataA?.detail && dataB?.detail
    && dataA.detail.schemeCode === fundA.schemeCode
    && dataB.detail.schemeCode === fundB.schemeCode;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE.out }} className="space-y-5 max-w-4xl mx-auto">
      {/* Fund Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}>
        <FundSelector label="Fund A" selected={fundA} onSelect={setFundA} color="#1e3a5f" />
        <FundSelector label="Fund B" selected={fundB} onSelect={setFundB} color="#047857" />
      </div>

      {sameSelected && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(217,119,6,0.08)', color: 'var(--warning)', border: '1px solid rgba(217,119,6,0.2)' }}>
          <AlertCircle size={16} /> Please select two different funds to compare.
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 py-12 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)' }}>
          <AlertCircle size={24} style={{ color: 'var(--negative)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button onClick={() => { setError(null); abortA.current?.abort(); abortB.current?.abort(); setLoadingA(true); setLoadingB(true); setDataA(null); setDataB(null); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--accent-primary)', color: '#fff' }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {!sameSelected && !error && (
        <>
          {/* Chart: show skeleton while NAV loading */}
          {!hasNav ? (
            <div className="rounded-2xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)' }}>
              <div className="skeleton h-[280px] rounded-xl" />
            </div>
          ) : (
            <div className="rounded-2xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Normalized Performance (base = 100)</h3>
                <div className="flex gap-1">
                  {TIME_RANGES.map(r => (
                    <button key={r.key} onClick={() => setRange(r.key)} className="px-2.5 py-1 text-xs rounded-full transition-all"
                      style={{ background: range === r.key ? 'var(--accent-primary)' : 'var(--bg-elevated)', color: range === r.key ? '#fff' : 'var(--text-muted)', fontWeight: range === r.key ? 600 : 400 }}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ minHeight: 200 }}>
                <ComparisonChart dataA={filteredNav.a} dataB={filteredNav.b} nameA={fundA.schemeName.split(' -')[0]} nameB={fundB.schemeName.split(' -')[0]} />
              </div>
              {startDate && (
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Comparison starts from {startDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          )}

          {/* Table: show immediately with snapshot data, update when real data arrives */}
          {tableReady ? (
            <ComparisonTable detailA={dataA!.detail} detailB={dataB!.detail} fundACode={fundA.schemeCode} fundBCode={fundB.schemeCode} />
          ) : (
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)' }}>
              {Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-8 rounded-lg" />)}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
