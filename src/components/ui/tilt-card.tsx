'use client';

import { useRef, useCallback } from 'react';
import { useMotionValue, useSpring, useTransform, motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export function TiltCard({ className, children, maxTilt = 5 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left) / rect.width - 0.5);
      y.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function TiltCardWrapper({ className, children, maxTilt = 5 }: TiltCardProps) {
  return (
    <>
      {/* Desktop: with tilt */}
      <TiltCard className={cn('hidden md:block', className)} maxTilt={maxTilt}>
        {children}
      </TiltCard>
      {/* Mobile: no tilt, just render children */}
      <div className={cn('md:hidden', className)}>{children}</div>
    </>
  );
}
