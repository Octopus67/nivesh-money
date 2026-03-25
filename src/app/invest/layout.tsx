import type { Metadata } from 'next';
import './invest-tokens.css';

export const metadata: Metadata = {
  title: 'Investment Tool | Nivesh.money',
  description:
    'Plan your mutual fund investments with our interactive SIP, SWP, and lump sum calculators, risk profiler, fund explorer, and portfolio builder.',
};

export default function InvestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="invest-tool min-h-screen"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {children}
    </div>
  );
}
