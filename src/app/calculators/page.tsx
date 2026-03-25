import type { Metadata } from 'next';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { Repeat, ArrowDownUp, Wallet, Landmark, CreditCard, Target, Leaf, TrendingDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Financial Calculators',
  description: 'Use our interactive financial calculators — SIP, SWP, lumpsum, retirement, EMI, and goal planning tools to plan your financial future.',
};

const calculators = [
  { icon: Repeat, title: 'SIP Calculator', description: 'Plan your monthly investments and see projected growth.', slug: 'sip', shadow: 'hover:shadow-[var(--shadow-emerald)]' },
  { icon: ArrowDownUp, title: 'SWP Calculator', description: 'Estimate regular withdrawals from your investment corpus.', slug: 'swp', shadow: 'hover:shadow-[var(--shadow-blue)]' },
  { icon: Wallet, title: 'Lumpsum Calculator', description: 'Calculate returns on a one-time investment.', slug: 'lumpsum', shadow: 'hover:shadow-[var(--shadow-amber)]' },
  { icon: Landmark, title: 'Retirement Calculator', description: 'Find out how much you need for a comfortable retirement.', slug: 'retirement', shadow: 'hover:shadow-[var(--shadow-blue)]' },
  { icon: CreditCard, title: 'EMI Calculator', description: 'Calculate monthly EMIs for loans and financing.', slug: 'emi', shadow: 'hover:shadow-[var(--shadow-emerald)]' },
  { icon: Target, title: 'Goal Planner', description: 'Map investments to your specific financial goals.', slug: 'goal-planner', shadow: 'hover:shadow-[var(--shadow-amber)]' },
  { icon: Leaf, title: 'Tax Saving (ELSS)', description: 'Optimize your Section 80C investments.', slug: 'tax-saving', shadow: 'hover:shadow-[var(--shadow-emerald)]' },
  { icon: TrendingDown, title: 'Inflation Calculator', description: 'Understand how inflation impacts your savings.', slug: 'inflation', shadow: 'hover:shadow-[var(--shadow-amber)]' },
];

export default function CalculatorsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 text-center mb-16">
        <h1 className="text-4xl md:text-[56px] font-bold leading-tight text-[var(--color-navy)] mb-4">Financial Calculators</h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
          Use our interactive tools to plan your financial future.
        </p>
      </section>

      {/* Calculator Grid */}
      <section className="max-w-5xl mx-auto px-6 mb-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((calc) => (
            <Link key={calc.slug} href={`/calculators/${calc.slug}`}>
              <GlassCard className={`h-full hover:-translate-y-1 transition-all duration-[var(--duration-normal)] cursor-pointer ${calc.shadow}`}>
                <calc.icon className="w-8 h-8 text-[var(--color-navy)] mb-3" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{calc.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{calc.description}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
