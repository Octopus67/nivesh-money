'use client';

import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Gem, Scale } from 'lucide-react';
import type { InvestMode } from '@/lib/invest/types';
import { useInvestState } from '@/lib/invest/context';

const TABS: { key: InvestMode; label: string; icon: React.ElementType }[] = [
  { key: 'sip', label: 'SIP', icon: TrendingUp },
  { key: 'swp', label: 'SWP', icon: TrendingDown },
  { key: 'lumpsum', label: 'Lump Sum', icon: Gem },
  { key: 'compare', label: 'Compare', icon: Scale },
];

interface ModePillsProps {
  activeMode: InvestMode;
  onModeChange: (mode: InvestMode) => void;
}

export function ModePills({ activeMode, onModeChange }: ModePillsProps) {
  const { state } = useInvestState();
  const compareCount = state.compareFunds.length;

  return (
    <nav className="flex gap-1.5 sm:gap-2" role="tablist" aria-label="Investment tool modes">
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = activeMode === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onModeChange(key)}
            className="relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              background: isActive ? 'var(--accent-primary)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              border: isActive
                ? '1px solid var(--accent-primary)'
                : '1px solid var(--glass-border)',
            }}
          >
            <Icon size={14} />
            {label}
            {key === 'compare' && compareCount > 0 && (
              <span className="ml-0.5 text-xs">({compareCount})</span>
            )}
            {isActive && (
              <motion.span
                layoutId="mode-pill-underline"
                className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full"
                style={{ background: '#fff' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
