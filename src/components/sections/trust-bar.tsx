'use client';

import { motion } from 'motion/react';
import { Users, TrendingUp, Shield, Award } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { CountUpOnScroll } from '@/components/ui/count-up';

const stats = [
  { value: 500, prefix: '₹', suffix: '', label: 'Min SIP Amount', icon: Award, display: '₹500' },
  { value: 0, suffix: '%', label: 'Advisory Fee', icon: Shield, display: '0%' },
  { value: 100, suffix: '+', label: 'Fund Options', icon: TrendingUp },
  { value: 1, suffix: '', label: 'NISM Certified', icon: Users, display: 'NISM' },
];

export function TrustBar() {
  return (
    <section className="relative z-10 max-w-5xl mx-auto px-6 -mt-10 md:-mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard
          variant="heavy"
          gradientBorder
          className="shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.04),0_12px_24px_rgba(0,0,0,0.05)] rounded-2xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-[var(--color-emerald)]/20">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center text-center px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-black/[0.02]"
                >
                  <Icon className="h-5 w-5 text-[var(--color-emerald)] mb-2" />
                  <div className="text-3xl font-bold text-[var(--color-navy)] font-mono tabular-nums">
                    {stat.display ? (
                      stat.display
                    ) : (
                      <CountUpOnScroll
                        value={stat.value}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                      />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>
    </section>
  );
}
