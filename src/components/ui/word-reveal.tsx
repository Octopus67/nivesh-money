'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { cn } from '@/lib/utils';

interface WordRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export function WordReveal({ text, className, delay = 0 }: WordRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });
  const words = text.split(' ');

  return (
    <h1 ref={ref} className={cn('flex flex-wrap gap-x-3 gap-y-1', className)}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{
            duration: 0.4,
            delay: delay + i * 0.08,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}
