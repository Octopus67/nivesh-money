'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'motion/react';
import { Calculator, Shield, Scale, Database } from 'lucide-react';

const features = [
  { icon: Calculator, text: 'SIP, SWP & Lump Sum Calculators' },
  { icon: Shield, text: 'Risk-Based Fund Selection' },
  { icon: Scale, text: 'Side-by-Side Fund Comparison' },
  { icon: Database, text: '900+ Funds with Real Returns Data' },
];

export function InvestToolCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <section ref={ref} className="py-16 md:py-20 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2a4a 50%, #0a3d2e 100%)',
        }}
      >
        <div className="px-6 py-10 sm:px-10 sm:py-14 md:px-16 md:py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300 mb-3">
            All-in-One Investment Tool
          </p>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Plan, Compare & Invest
          </h2>

          <p className="text-white/70 max-w-lg mx-auto mb-8">
            Plan your SIP, compare mutual funds, assess your risk profile, and build your portfolio — all in one place.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-10 text-left">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/10 border border-white/10">
                  <Icon size={16} className="text-emerald-300" />
                </div>
                <span className="text-sm text-white/90">{text}</span>
              </div>
            ))}
          </div>

          <Link
            href="/invest"
            className="btn-glow inline-flex items-center justify-center h-12 px-8 rounded-xl font-semibold text-[#1e3a5f] bg-white hover:bg-emerald-50 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Launch Investment Tool →
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
