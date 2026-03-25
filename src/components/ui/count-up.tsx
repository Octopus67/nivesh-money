'use client';

import { useRef, useEffect } from 'react';
import { useInView, useMotionValue, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

interface CountUpOnScrollProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUpOnScroll({ value, prefix = '', suffix = '', className }: CountUpOnScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-20% 0px' });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (spanRef.current) {
        spanRef.current.textContent = `${prefix}${Math.round(latest).toLocaleString('en-IN')}${suffix}`;
      }
    });
    return unsubscribe;
  }, [springValue, prefix, suffix]);

  return (
    <div ref={containerRef} className={cn('inline-block', className)}>
      <span
        ref={spanRef}
        className="font-mono tabular-nums font-bold"
        aria-hidden="true"
      >
        {prefix}0{suffix}
      </span>
      <span className="sr-only" aria-live="polite">
        {isInView ? `${prefix}${value.toLocaleString('en-IN')}${suffix}` : `${prefix}0${suffix}`}
      </span>
    </div>
  );
}
