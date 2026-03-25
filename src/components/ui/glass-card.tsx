'use client';

import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'subtle' | 'medium' | 'heavy';
  gradientBorder?: boolean;
}

const glassStyles = {
  subtle: 'bg-white/70 backdrop-blur-sm border border-black/[0.06]',
  medium: 'bg-white/80 backdrop-blur-md border border-black/[0.06]',
  heavy: 'bg-white/[0.90] backdrop-blur-lg border border-black/[0.06]',
};

export function GlassCard({ variant = 'medium', gradientBorder = false, className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-6 shadow-lg',
        'transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
        'hover:-translate-y-[2px] hover:shadow-xl hover:border-black/[0.10]',
        glassStyles[variant],
        gradientBorder && 'gradient-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
