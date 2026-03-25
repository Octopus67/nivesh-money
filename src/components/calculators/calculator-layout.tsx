'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedSection } from '@/components/ui/animated-section';

interface CalculatorLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function CalculatorLayout({ title, description, children }: CalculatorLayoutProps) {
  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection>
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-navy)] mb-2">{title}</h1>
            <p className="text-[var(--text-muted)]">{description}</p>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.15}>
          <GlassCard variant="heavy" gradientBorder className="p-6 md:p-8">
            {children}
          </GlassCard>
        </AnimatedSection>
      </div>
    </div>
  );
}
