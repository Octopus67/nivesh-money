'use client';

import { motion } from 'motion/react';
import { GlassCard } from '@/components/ui/glass-card';
import { WordReveal } from '@/components/ui/word-reveal';
import { CountUpOnScroll } from '@/components/ui/count-up';
import { Users, Eye, TrendingUp, Award, ShieldCheck, Clock } from 'lucide-react';

const philosophy = [
  { icon: Users, title: 'Client First', description: 'Your financial goals drive every recommendation we make. We listen before we advise.' },
  { icon: Eye, title: 'Transparency', description: 'No hidden charges, no jargon. We explain every investment in plain language.' },
  { icon: TrendingUp, title: 'Long-Term Growth', description: 'We focus on sustainable wealth creation through disciplined, goal-based investing.' },
];

const credentials = [
  { icon: ShieldCheck, label: 'AMFI Registered', value: 'ARN Holder' },
  { icon: Award, label: 'NISM Certified', value: 'MF Distribution' },
  { icon: Clock, label: 'Experience', value: 15, suffix: '+ Years' },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export function AboutContent() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 text-center mb-20">
        <WordReveal
          text="About Nivesh.money"
          className="text-4xl md:text-[56px] font-bold leading-tight text-[var(--color-navy)] mb-4 justify-center"
        />
        <motion.p {...fadeUp} transition={{ delay: 0.3 }} className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
          Trusted mutual fund advisory built on decades of market expertise and a genuine commitment to your family&apos;s financial well-being.
        </motion.p>
      </section>

      {/* Story */}
      <motion.section {...fadeUp} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto px-6 mb-20">
        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] mb-4">Our Story</h2>
        <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
          <p>
            Nivesh.money was founded with a simple belief — every family deserves access to sound financial guidance. With over 15 years of experience navigating Indian equity markets, mutual funds, and ETFs, our founder has helped hundreds of families plan for what matters most.
          </p>
          <p>
            What started as helping friends and family with SIP planning has grown into a trusted advisory practice. We remain a family business at heart — personal, approachable, and deeply invested in every client&apos;s success.
          </p>
        </div>
      </motion.section>

      {/* Philosophy */}
      <section className="max-w-4xl mx-auto px-6 mb-20">
        <motion.h2 {...fadeUp} className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] mb-8 text-center">Our Philosophy</motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {philosophy.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlassCard className="text-center h-full hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-[var(--color-emerald)]/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-[var(--color-emerald)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Credentials */}
      <motion.section {...fadeUp} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] mb-8 text-center">Credentials</h2>
        <GlassCard gradientBorder className="grid md:grid-cols-3 gap-6 text-center">
          {credentials.map((cred) => (
            <div key={cred.label}>
              <cred.icon className="w-8 h-8 text-[var(--color-navy)] mx-auto mb-2" />
              {typeof cred.value === 'number' ? (
                <CountUpOnScroll value={cred.value} suffix={cred.suffix} className="text-xl text-[var(--color-navy)]" />
              ) : (
                <p className="text-xl font-bold text-[var(--color-navy)]">{cred.value}</p>
              )}
              <p className="text-sm text-[var(--text-muted)]">{cred.label}</p>
            </div>
          ))}
        </GlassCard>
      </motion.section>
    </div>
  );
}
