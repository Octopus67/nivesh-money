'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Shield, ChevronDown, Users, TrendingUp } from 'lucide-react';
import { WordReveal } from '@/components/ui/word-reveal';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grain-overlay">
      <div className="absolute inset-0 dot-grid" aria-hidden="true" />

      {/* Gradient blobs — increased opacity */}
      <div className="absolute inset-0 hero-mesh" aria-hidden="true">
        <div className="absolute w-[60%] h-[60%] left-[10%] top-[20%] rounded-full bg-[radial-gradient(ellipse,rgba(59,130,246,0.14),transparent_70%)] will-change-transform animate-[drift_25s_ease-in-out_infinite_alternate] max-md:animate-none" />
        <div className="absolute w-[50%] h-[50%] right-[5%] top-[10%] rounded-full bg-[radial-gradient(ellipse,rgba(4,120,87,0.12),transparent_70%)] will-change-transform animate-[drift_25s_ease-in-out_infinite_alternate_reverse] max-md:animate-none" />
        <div className="absolute w-[45%] h-[45%] right-[10%] bottom-[10%] rounded-full bg-[radial-gradient(ellipse,rgba(217,119,6,0.08),transparent_70%)] will-change-transform animate-[drift_25s_ease-in-out_infinite_alternate] max-md:animate-none" />
      </div>

      {/* Radial glow behind headline */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-[0.08] bg-[radial-gradient(ellipse,rgba(30,58,95,0.6),transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Floating glass cards — desktop only */}
      <motion.div
        className="hidden lg:block absolute left-[8%] top-[35%] w-48"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="glass-card p-4 rounded-xl shadow-lg -rotate-3 bg-white/80 backdrop-blur-md border border-black/[0.06]">
          <div className="text-xs text-[var(--text-muted)] mb-1">SIP Returns</div>
          <div className="text-lg font-bold text-[var(--color-accent-secondary)]">₹11.8L</div>
          <div className="text-xs text-[var(--text-muted)]">from ₹5K/mo × 10 yrs</div>
          <svg className="w-full h-8 mt-2" viewBox="0 0 100 30" aria-hidden="true">
            <polyline points="0,25 25,20 50,15 75,8 100,3" fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>

      <motion.div
        className="hidden lg:block absolute right-[8%] top-[45%] w-48"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="glass-card p-4 rounded-xl shadow-lg rotate-3 bg-white/80 backdrop-blur-md border border-black/[0.06]">
          <div className="text-xs text-[var(--text-muted)] mb-1">Portfolio Growth</div>
          <div className="text-lg font-bold text-[var(--color-navy)]">+14.2%</div>
          <div className="text-xs text-[var(--text-muted)]">5Y CAGR (Moderate)</div>
          <svg className="w-12 h-12 mt-2 mx-auto" viewBox="0 0 36 36" aria-hidden="true">
            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-border-default)" strokeWidth="3" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="#047857" strokeWidth="3" strokeDasharray="60 40" strokeLinecap="round" transform="rotate(-90 18 18)" />
          </svg>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center pt-24 pb-20">
        {/* AMFI badge — larger with emerald glow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-[var(--color-emerald)]/30 bg-[var(--color-emerald)]/5 text-sm text-[var(--color-emerald)] shadow-[0_0_20px_rgba(4,120,87,0.15)]"
        >
          <Shield className="h-4 w-4" />
          AMFI Registered Mutual Fund Distributor
        </motion.div>

        <WordReveal
          text="Grow Your Wealth With Expert Mutual Fund Advisory"
          className="text-4xl md:text-[56px] font-bold leading-tight justify-center bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-emerald)] bg-clip-text text-transparent"
        />

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-6 text-lg text-[var(--text-secondary)] max-w-[540px] mx-auto"
        >
          AMFI-registered mutual fund distributor helping families build wealth through personalized SIP, SWP, and retirement planning.
        </motion.p>

        {/* Inline trust indicators */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 1.0 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-sm text-[var(--color-text-secondary)]"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[var(--color-accent-secondary)]" />
            <span>15+ Years</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-[var(--color-border-default)] hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[var(--color-accent-secondary)]" />
            <span>500+ Clients</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-[var(--color-border-default)] hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[var(--color-accent-secondary)]" />
            <span>₹50Cr+ Managed</span>
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 1.1 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/contact"
            className="btn-glow inline-flex items-center justify-center h-12 px-8 rounded-xl font-semibold text-white bg-gradient-to-br from-[var(--color-emerald-light)] to-[var(--color-emerald)] shadow-[var(--shadow-emerald)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Start Your Journey
          </Link>
          <Link
            href="/calculators"
            className="group inline-flex items-center justify-center h-12 px-8 rounded-xl font-semibold text-[var(--color-navy)] border-2 border-[var(--color-navy)]/20 transition-all duration-300 hover:bg-[var(--color-navy)] hover:text-white hover:border-[var(--color-navy)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Explore Calculators
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <ChevronDown
          className="h-6 w-6 text-[var(--text-muted)]"
          style={{ animation: 'bounce 2s ease-in-out infinite' }}
        />
      </motion.div>
    </section>
  );
}
