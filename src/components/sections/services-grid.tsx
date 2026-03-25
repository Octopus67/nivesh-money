'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'motion/react';
import { TrendingUp, ArrowDownUp, Sunset, Target, Landmark } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { GlassCard } from '@/components/ui/glass-card';
import { TiltCardWrapper } from '@/components/ui/tilt-card';

const services = [
  { icon: TrendingUp, title: 'SIP Planning', desc: 'Systematic investment plans tailored to your income and goals. Start small, grow big.', span: true, href: '/calculators/sip' },
  { icon: ArrowDownUp, title: 'SWP Management', desc: 'Regular income from your investments through systematic withdrawal plans.', href: '/calculators/swp' },
  { icon: Sunset, title: 'Retirement Planning', desc: 'Build a corpus that lets you retire with dignity and financial freedom.', href: '/calculators/retirement' },
  { icon: Target, title: 'Goal-Based Investing', desc: "Children's education, home purchase, or dream vacation — invest with purpose.", href: '/calculators/goal-planner' },
  { icon: Landmark, title: 'Tax Saving (ELSS)', desc: 'Save up to ₹46,800 in taxes annually with equity-linked savings schemes.', href: '/calculators/tax-saving' },
];

const iconStyles = [
  { bg: 'bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e]', shadow: 'shadow-[0_4px_14px_rgba(30,58,95,0.3)]' },
  { bg: 'bg-gradient-to-br from-[#047857] to-[#059669]', shadow: 'shadow-[0_4px_14px_rgba(4,120,87,0.3)]' },
  { bg: 'bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e]', shadow: 'shadow-[0_4px_14px_rgba(30,58,95,0.3)]' },
  { bg: 'bg-gradient-to-br from-[#047857] to-[#059669]', shadow: 'shadow-[0_4px_14px_rgba(4,120,87,0.3)]' },
  { bg: 'bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e]', shadow: 'shadow-[0_4px_14px_rgba(30,58,95,0.3)]' },
];

export function ServicesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <section className="py-20 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-center text-[var(--text-primary)] mb-3">
          How We Help You Grow
        </h2>
        <p className="text-center text-[var(--text-secondary)] mb-12">
          Comprehensive financial planning tailored to your goals
        </p>
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className={`group ${s.span ? 'md:col-span-2' : ''}`}
            >
              <TiltCardWrapper className="h-full">
                <SpotlightCard className="h-full">
                  <GlassCard className="h-full flex flex-col overflow-hidden transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_12px_40px_rgba(30,58,95,0.12)]">
                    <div className="h-[3px] rounded-t-xl bg-gradient-to-r from-[#1e3a5f] via-[#047857] to-[#3b82f6] -mx-6 -mt-6 mb-6" />
                    <div className={`w-12 h-12 rounded-xl p-3 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105 ${iconStyles[i].bg} ${iconStyles[i].shadow}`}>
                      <s.icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{s.title}</h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed mb-4 flex-1">{s.desc}</p>
                    <Link href={s.href} className="inline-flex items-center text-sm font-medium text-[var(--color-emerald)]">
                      Learn more{' '}
                      <span className="inline-block ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </Link>
                  </GlassCard>
                </SpotlightCard>
              </TiltCardWrapper>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
