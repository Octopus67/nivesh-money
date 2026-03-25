'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Share2, Printer } from 'lucide-react';
import { PremiumSlider } from '@/components/ui/premium-slider';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { GlassTooltip } from '@/components/charts/glass-tooltip';
import { calculateEMI } from '@/lib/calculators';
import { formatINR, formatINRCompact } from '@/lib/utils';
import { shareCalculator, decodeCalcParams } from '@/lib/share';
import { LIGHT_CHART_THEME } from '@/lib/chart-theme';
import { PrintHeader } from '@/components/shared/print-header';
import { PrintDisclaimer } from '@/components/shared/print-disclaimer';
import { PrintInputSummary } from '@/components/shared/print-input-summary';

function generateAmortization(principal: number, annualRate: number, years: number) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) {
    const emi = Math.round(principal / n);
    return Array.from({ length: n }, (_, i) => ({
      month: i + 1, emi, principal: emi, interest: 0, balance: Math.max(0, principal - emi * (i + 1)),
    }));
  }
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  let balance = principal;
  return Array.from({ length: n }, (_, i) => {
    const interest = balance * r;
    const princ = emi - interest;
    balance = Math.max(0, balance - princ);
    return { month: i + 1, emi: Math.round(emi), principal: Math.round(princ), interest: Math.round(interest), balance: Math.round(balance) };
  });
}

export function EMICalculator() {
  const searchParams = useSearchParams();
  const defaults = decodeCalcParams(
    Object.fromEntries(searchParams.entries()),
    { principal: 2000000, rate: 8.5, years: 20 }
  );

  const [principal, setPrincipal] = useState(defaults.principal);
  const [rate, setRate] = useState(defaults.rate);
  const [years, setYears] = useState(defaults.years);
  const [showAllRows, setShowAllRows] = useState(false);

  const result = useMemo(() => calculateEMI(principal, rate, years), [principal, rate, years]);
  const amortization = useMemo(() => generateAmortization(principal, rate, years), [principal, rate, years]);

  const pieData = [
    { name: 'Principal', value: principal, fill: '#1e3a5f' },
    { name: 'Interest', value: result.totalInterest, fill: '#d97706' },
  ];

  const visibleRows = showAllRows ? amortization : amortization.slice(0, 12);

  return (
    <>
      <PrintHeader />
      <PrintInputSummary inputs={{
        'Loan Amount': formatINRCompact(principal),
        'Interest Rate': `${rate}%`,
        'Loan Tenure': `${years} years`,
      }} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <PremiumSlider label="Loan Amount" min={100000} max={500000000} step={50000} value={principal} onChange={setPrincipal} formatValue={formatINRCompact} />
          <PremiumSlider label="Interest Rate (%)" min={1} max={20} step={0.25} value={rate} onChange={setRate} formatValue={(v) => `${v}%`} />
          <PremiumSlider label="Loan Tenure (Years)" min={1} max={30} step={1} value={years} onChange={setYears} formatValue={(v) => `${v} yrs`} />

          {/* Results */}
          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[var(--text-primary)]">Monthly EMI</span>
              <AnimatedNumber value={result.emi} className="text-2xl md:text-3xl" />
            </div>
            <hr className="border-black/5" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">Principal</span>
              <AnimatedNumber value={principal} className="text-lg" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">Total Interest <span className="text-amber-600">↑</span></span>
              <AnimatedNumber value={result.totalInterest} className="text-lg text-amber-600" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">Total Payment</span>
              <AnimatedNumber value={result.totalPayment} className="text-lg" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={() => shareCalculator('/calculators/emi', { principal, rate, years })} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-black/10 hover:bg-black/5 transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-black/10 hover:bg-black/5 transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="h-[350px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} innerRadius="55%" outerRadius="80%" startAngle={90} endAngle={-270} dataKey="value" isAnimationActive animationDuration={800} paddingAngle={2}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<GlassTooltip />} />
              <text x="50%" y="46%" textAnchor="middle" className="text-xs fill-[var(--text-muted)]">Total Payment</text>
              <text x="50%" y="55%" textAnchor="middle" className="text-sm font-mono font-bold fill-[var(--color-navy)]">{formatINRCompact(result.totalPayment)}</text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Amortization Table */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Amortization Schedule</h3>
        <div className="overflow-auto rounded-lg border border-[var(--border-default)]" style={{ maxHeight: 400 }}>
          <table className="w-full text-sm">
            <caption className="sr-only">EMI amortization schedule for {years * 12} months</caption>
            <thead className="bg-[var(--bg-soft)] sticky top-0 z-10">
              <tr>
                <th scope="col" className="text-left p-3 text-[var(--text-secondary)]">Month</th>
                <th scope="col" className="text-right p-3 text-[var(--text-secondary)]">EMI</th>
                <th scope="col" className="text-right p-3 text-[var(--text-secondary)]">Principal</th>
                <th scope="col" className="text-right p-3 text-[var(--text-secondary)]">Interest</th>
                <th scope="col" className="text-right p-3 text-[var(--text-secondary)]">Balance</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, i) => (
                <tr key={row.month} className={i % 2 ? 'bg-[var(--bg-soft)]' : 'bg-white'}>
                  <td className="p-3">{row.month}</td>
                  <td className="p-3 text-right font-mono tabular-nums">{formatINR(row.emi)}</td>
                  <td className="p-3 text-right font-mono tabular-nums">{formatINR(row.principal)}</td>
                  <td className="p-3 text-right font-mono tabular-nums text-amber-600">{formatINR(row.interest)}</td>
                  <td className="p-3 text-right font-mono tabular-nums">{formatINR(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {amortization.length > 12 && (
          <button
            onClick={() => setShowAllRows(!showAllRows)}
            className="mt-3 text-sm text-[var(--color-navy)] underline"
          >
            {showAllRows ? 'Show First 12 Months' : `Show All ${amortization.length} Months`}
          </button>
        )}
      </div>
      <PrintDisclaimer />
    </>
  );
}
