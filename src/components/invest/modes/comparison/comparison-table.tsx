'use client';

import { Star } from 'lucide-react';
import type { FundDetail } from '@/lib/invest/types';
import { formatPercent, formatCompact } from '@/lib/invest/format';

interface Props {
  detailA: Partial<FundDetail>;
  detailB: Partial<FundDetail>;
  fundACode?: number;
  fundBCode?: number;
}

interface Row {
  label: string;
  valA: string | null;
  valB: string | null;
  higherIsBetter?: boolean;
}

function buildRows(a: Partial<FundDetail>, b: Partial<FundDetail>): Row[] {
  const ret = (d: Partial<FundDetail>, key: '1y' | '3y' | '5y' | '10y') =>
    d.returns?.[key] != null ? formatPercent(d.returns[key]!) : null;
  return [
    { label: '1Y Return', valA: ret(a, '1y'), valB: ret(b, '1y'), higherIsBetter: true },
    { label: '3Y Return', valA: ret(a, '3y'), valB: ret(b, '3y'), higherIsBetter: true },
    { label: '5Y Return', valA: ret(a, '5y'), valB: ret(b, '5y'), higherIsBetter: true },
    { label: '10Y Return', valA: ret(a, '10y'), valB: ret(b, '10y'), higherIsBetter: true },
    {
      label: 'Expense Ratio',
      valA: a.expenseRatio != null ? `${a.expenseRatio}%` : null,
      valB: b.expenseRatio != null ? `${b.expenseRatio}%` : null,
      higherIsBetter: false,
    },
    {
      label: 'AUM',
      valA: a.aum != null ? formatCompact(a.aum) : null,
      valB: b.aum != null ? formatCompact(b.aum) : null,
    },
    { label: 'Category', valA: a.category ?? null, valB: b.category ?? null },
    { label: 'Fund House', valA: a.fundHouse ?? null, valB: b.fundHouse ?? null },
  ];
}

function getWinner(row: Row): 'a' | 'b' | null {
  if (row.higherIsBetter === undefined || !row.valA || !row.valB) return null;
  const numA = parseFloat(row.valA.replace(/[^0-9.\-]/g, ''));
  const numB = parseFloat(row.valB.replace(/[^0-9.\-]/g, ''));
  if (isNaN(numA) || isNaN(numB)) return null;
  if (row.higherIsBetter) return numA > numB ? 'a' : numB > numA ? 'b' : null;
  return numA < numB ? 'a' : numB < numA ? 'b' : null;
}

export function ComparisonTable({ detailA, detailB, fundACode, fundBCode }: Props) {
  // BUG 1 guard: if detailA/detailB schemeCode doesn't match selected fund, don't render stale data
  if (fundACode && detailA.schemeCode && detailA.schemeCode !== fundACode) return null;
  if (fundBCode && detailB.schemeCode && detailB.schemeCode !== fundBCode) return null;

  const rows = buildRows(detailA, detailB);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)', width: 140 }}>Metric</th>
            <th className="text-left px-4 py-3 font-medium" style={{ color: '#1e3a5f' }}>
              <span className="truncate block max-w-[200px]">{detailA.schemeName ?? 'Fund A'}</span>
            </th>
            <th className="text-left px-4 py-3 font-medium" style={{ color: '#047857' }}>
              <span className="truncate block max-w-[200px]">{detailB.schemeName ?? 'Fund B'}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const winner = getWinner(row);
            return (
              <tr key={row.label} style={{ background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-base)', borderBottom: '1px solid var(--glass-border)' }}>
                <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--text-muted)' }}>{row.label}</td>
                <Cell value={row.valA} isBest={winner === 'a'} />
                <Cell value={row.valB} isBest={winner === 'b'} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Cell({ value, isBest }: { value: string | null; isBest: boolean }) {
  return (
    <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--text-primary)', background: isBest ? 'rgba(30,58,95,0.06)' : undefined }}>
      {value ?? <span style={{ color: 'var(--text-subtle)' }}>—</span>}
      {isBest && (
        <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent-primary)', color: '#fff', fontSize: 10 }}>
          <Star size={8} /> Best
        </span>
      )}
    </td>
  );
}
