'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Shield, ChevronDown } from 'lucide-react';
import { WordReveal } from '@/components/ui/word-reveal';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grain-overlay">
      {/* Dot grid pattern */}
      <div className="absolute inset-0 dot-grid" aria-hidden="true" />

      {/* Animated gradient mesh bg */}
      <div className="absolute inset-0 hero-mesh" aria-hidden="true">
        <div className="absolute w-[60%] h-[60%] left-[10%] top-[20%] rounded-full bg-[radial-gradient(ellipse,rgba(59,130,246,0.07),transparent_70%)] will-change-transform animate-[drift_25s_ease-in-out_infinite_alternate] max-md:animate-none" />
        <div className="absolute w-[50%] h-[50%] right-[5%] top-[10%] rounded-full bg-[radial-gradient(ellipse,rgba(4,120,87,0.07),transparent_70%)] will-change-transform animate-[drift_25s_ease-in-out_infinite_alternate_reverse] max-md:animate-none" />
        <div className="absolute w-[45%] h-[45%] right-[10%] bottom-[10%] rounded-full bg-[radial-gradient(ellipse,rgba(217,119,6,0.07),transparent_70%)] will-change-transform animate-[drift_25s_ease-in-out_infinite_alternate] max-md:animate-none" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center pt-24 pb-32">
        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-[var(--color-emerald)]/30 bg-[var(--color-emerald)]/5 text-sm text-[var(--color-emerald)]"
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
