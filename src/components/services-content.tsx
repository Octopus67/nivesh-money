'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { GlassCard } from '@/components/ui/glass-card';
import { WordReveal } from '@/components/ui/word-reveal';
import { ArrowRight, TrendingUp, ArrowDownUp, Sunset, Target, Landmark } from 'lucide-react';

const services = [
  { icon: TrendingUp, title: 'SIP Planning', border: 'border-t-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', href: '/contact', description: 'Start building wealth systematically with a Systematic Investment Plan tailored to your income and goals. We help you choose the right funds and amount for consistent, long-term growth.' },
  { icon: ArrowDownUp, title: 'SWP Management', border: 'border-t-blue-500', bg: 'bg-blue-50', text: 'text-blue-600', href: '/contact', description: 'Generate regular income from your investments through Systematic Withdrawal Plans. Ideal for retirees and those seeking predictable cash flow without depleting capital.' },
  { icon: Sunset, title: 'Retirement Planning', border: 'border-t-amber-500', bg: 'bg-amber-50', text: 'text-amber-600', href: '/calculators', description: 'Plan for a comfortable retirement with a corpus that sustains your lifestyle. We factor in inflation, healthcare costs, and your desired retirement age.' },
  { icon: Target, title: 'Goal-Based Investing', border: 'border-t-violet-500', bg: 'bg-violet-50', text: 'text-violet-600', href: '/calculators', description: "Whether it's your child's education, a home purchase, or a dream vacation — we map investments to your specific goals with clear timelines." },
  { icon: Landmark, title: 'Tax Saving (ELSS)', border: 'border-t-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-600', href: '/contact', description: 'Save up to ₹46,800 in taxes annually under Section 80C with Equity Linked Savings Schemes. The shortest lock-in among tax-saving instruments at just 3 years.' },
];

export function ServicesContent() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 text-center mb-16">
        <WordReveal
          text="Our Services"
          className="text-4xl md:text-[56px] font-bold leading-tight text-[var(--color-navy)] mb-4 justify-center"
        />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto"
        >
          Comprehensive mutual fund advisory to help you grow, protect, and enjoy your wealth.
        </motion.p>
      </section>

      {/* Service Cards */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group"
            >
              <GlassCard className={`border-t-[3px] ${s.border} h-full hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300`}>
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                  <s.icon className={`w-6 h-6 ${s.text}`} />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">{s.description}</p>
                <Link href={s.href} className={`inline-flex items-center gap-1 text-sm font-medium ${s.text}`}>
                  Get Started <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
