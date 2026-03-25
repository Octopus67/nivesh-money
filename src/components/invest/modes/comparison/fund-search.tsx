'use client';

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { FundSummary } from '@/lib/invest/types';

interface Props {
  label: string;
  selected: FundSummary | null;
  onSelect: (fund: FundSummary) => void;
  color: string;
}

export function FundSelector({ label, selected, onSelect, color }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FundSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { searchFunds } = await import('@/lib/invest/api');
        const data = await searchFunds(query);
        setResults(data.slice(0, 8));
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <label className="text-xs font-medium mb-1 block" style={{ color }}>{label}</label>
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all"
        style={{
          background: 'var(--bg-base)',
          border: open ? `2px solid ${color}` : '1px solid var(--glass-border)',
          color: 'var(--text-primary)',
          boxShadow: open ? `0 0 0 3px rgba(30,58,95,0.15)` : 'none',
        }}
      >
        <span className="truncate block">{selected?.schemeName ?? 'Select a fund...'}</span>
        {selected?.category && <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>{selected.category}</span>}
      </button>

      {open && (
        <div className="absolute z-20 top-full mt-1 w-full rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card-hover)' }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search fund name..."
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {loading && <p className="text-xs px-3 py-2" style={{ color: 'var(--text-muted)' }}>Searching...</p>}
            {results.map(fund => (
              <button
                key={fund.schemeCode}
                onClick={() => { onSelect(fund); setOpen(false); setQuery(''); }}
                className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-primary)' }}
              >
                <div className="truncate font-medium">{fund.schemeName}</div>
                {fund.category && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{fund.category}</div>}
              </button>
            ))}
            {query.length >= 2 && !loading && results.length === 0 && (
              <p className="text-xs px-3 py-2" style={{ color: 'var(--text-muted)' }}>No funds found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
