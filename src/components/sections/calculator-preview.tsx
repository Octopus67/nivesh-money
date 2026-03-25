'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { GlassCard } from '@/components/ui/glass-card';
import { PremiumSlider } from '@/components/ui/premium-slider';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { formatINR } from '@/lib/utils';

function calcSIP(monthly: number, years: number, rate: number) {
  const r = rate / 12 / 100;
  const n = years * 12;
  return monthly * (((1 + r) ** n - 1) / r) * (1 + r);
}

export function CalculatorPreview() {
  const [monthly, setMonthly] = useState(10000);
  const [years, setYears] = useState(10);

  const result = useMemo(() => Math.round(calcSIP(monthly, years, 12)), [monthly, years]);
  const invested = monthly * years * 12;
  const returns = result - invested;
  const multiplier = invested > 0 ? (result / invested).toFixed(1) : '0.0';
  const investedPct = invested > 0 ? (invested / result) * 100 : 50;

  return (
    <section className="py-20 md:py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-center text-[var(--text-primary)] mb-2">
            See How Your Money Grows
          </h2>
          <p className="text-center text-[var(--text-secondary)] mb-8">
            See how your money grows with the power of compounding
          </p>

          <GlassCard gradientBorder className="space-y-6">
            <PremiumSlider
              label="Monthly Investment"
              min={500}
              max={100000}
              step={500}
              value={monthly}
              onChange={setMonthly}
              formatValue={formatINR}
            />

            <PremiumSlider
              label="Investment Period"
              min={1}
              max={30}
              step={1}
              value={years}
              onChange={setYears}
              formatValue={(v) => `${v} yr${v > 1 ? 's' : ''}`}
            />

            <p className="text-sm text-[var(--text-muted)] text-center">
              Expected return: 12% p.a.
            </p>

            <div className="text-center">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Estimated Value</p>
              <AnimatedNumber
                value={result}
                className="text-3xl md:text-4xl text-[var(--color-emerald)]"
              />
            </div>

            {/* Stacked bar: Invested vs Returns */}
            <div className="space-y-2">
              <div className="flex rounded-full overflow-hidden h-3">
                <div
                  className="bg-[var(--color-navy)] transition-all duration-500"
                  style={{ width: `${investedPct}%` }}
                />
                <div
                  className="bg-[var(--color-emerald)] transition-all duration-500"
                  style={{ width: `${100 - investedPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-navy)]" />
                  Invested: {formatINR(invested)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-emerald)]" />
                  Returns: {formatINR(returns)}
                </span>
              </div>
            </div>

            {/* Multiplier */}
            <p className="text-center text-sm font-medium text-[var(--text-secondary)]">
              That&apos;s <span className="text-[var(--color-emerald)] font-bold">{multiplier}x</span> your investment!
            </p>

            <div className="text-center">
              <Link
                href="/calculators"
                className="text-sm font-medium text-[var(--color-emerald)] hover:underline"
              >
                Explore All Calculators →
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
