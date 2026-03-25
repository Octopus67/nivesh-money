'use client';

import { useEffect, useRef, useState } from 'react';
import { useSpring, useMotionValue, motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({ value, prefix = '₹', suffix = '', className }: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 20 });
  const ref = useRef<HTMLSpanElement>(null);
  const [showShimmer, setShowShimmer] = useState(false);
  const ariaRef = useRef<HTMLSpanElement>(null);
  const ariaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    motionValue.set(value);
    setShowShimmer(false);

    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        const rounded = Math.round(latest);
        ref.current.textContent = `${prefix}${rounded.toLocaleString('en-IN')}${suffix}`;
      }
    });

    if (ariaTimeout.current) clearTimeout(ariaTimeout.current);
    ariaTimeout.current = setTimeout(() => {
      if (ariaRef.current) {
        ariaRef.current.textContent = `${prefix}${value.toLocaleString('en-IN')}${suffix}`;
      }
    }, 300);

    const shimmerTimer = setTimeout(() => setShowShimmer(true), 1200);

    return () => {
      unsubscribe();
      clearTimeout(shimmerTimer);
      if (ariaTimeout.current) clearTimeout(ariaTimeout.current);
    };
  }, [value, prefix, suffix, motionValue, springValue]);

  return (
    <>
      <motion.span
        ref={ref}
        aria-hidden="true"
        className={cn(
          'font-mono tabular-nums font-bold',
          showShimmer && 'shimmer-gold',
          className
        )}
      />
      <span ref={ariaRef} className="sr-only" aria-live="polite" />
    </>
  );
}
