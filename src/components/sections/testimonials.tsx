'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Star } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

const testimonials = [
  {
    quote: 'Nivesh.money helped us plan our retirement with clarity. The SIP calculator alone saved us hours of confusion.',
    name: 'Rajesh P.',
    role: 'Retired Government Officer',
    location: 'Nashik',
  },
  {
    quote: 'Finally, a financial advisor who explains things in simple language. Our children\'s education fund is on track thanks to their guidance.',
    name: 'Priya M.',
    role: 'School Teacher',
    location: 'Pune',
  },
  {
    quote: 'I was skeptical about mutual funds, but the team at Nivesh.money made the entire process transparent and stress-free.',
    name: 'Amit S.',
    role: 'Business Owner',
    location: 'Nashik',
  },
];

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <section ref={ref} className="py-20 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-semibold text-center text-[var(--color-navy)] mb-12"
        >
          What Our Clients Say
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <GlassCard className="h-full border-l-4 border-l-[var(--color-emerald)]">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[var(--color-emerald)] text-[var(--color-emerald)]" />
                  ))}
                </div>
                <p className="italic text-[var(--text-secondary)] mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-[var(--color-navy)]">{t.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">{t.role}, {t.location}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
