'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Shield, RefreshCw, Heart, BookOpen } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { GlassCard } from '@/components/ui/glass-card';

const items = [
  { icon: Shield, title: 'Unbiased Advice', desc: 'We recommend what\'s right for you, not what earns us the highest commission.' },
  { icon: RefreshCw, title: 'Regular Reviews', desc: 'Quarterly portfolio reviews to keep your investments aligned with your goals.' },
  { icon: Heart, title: 'Personal Touch', desc: 'You\'re not a ticket number. We know your family, your goals, and your concerns.' },
  { icon: BookOpen, title: 'Financial Education', desc: 'We explain every decision so you understand your money and grow confident.' },
];

const iconStyles = [
  { bg: 'bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e]', shadow: 'shadow-[0_4px_14px_rgba(30,58,95,0.3)]' },
  { bg: 'bg-gradient-to-br from-[#047857] to-[#059669]', shadow: 'shadow-[0_4px_14px_rgba(4,120,87,0.3)]' },
  { bg: 'bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e]', shadow: 'shadow-[0_4px_14px_rgba(30,58,95,0.3)]' },
  { bg: 'bg-gradient-to-br from-[#047857] to-[#059669]', shadow: 'shadow-[0_4px_14px_rgba(4,120,87,0.3)]' },
];

export function WhyChooseUs() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <section className="py-20 md:py-24 px-6 bg-[var(--bg-secondary)]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-center text-[var(--text-primary)] mb-12">
          Why Families Trust Us
        </h2>
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group"
            >
              <SpotlightCard className="h-full">
                <GlassCard className="h-full overflow-hidden transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_12px_40px_rgba(30,58,95,0.12)]">
                  <div className="h-[3px] rounded-t-xl bg-gradient-to-r from-[#1e3a5f] via-[#047857] to-[#3b82f6] -mx-6 -mt-6 mb-6" />
                  <div className={`w-12 h-12 rounded-xl p-3 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105 ${iconStyles[i].bg} ${iconStyles[i].shadow}`}>
                    <item.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{item.desc}</p>
                </GlassCard>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
