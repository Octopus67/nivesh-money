'use client';

import { useInvestState } from '@/lib/invest/context';
import type { InvestMode } from '@/lib/invest/types';

interface ContextDockProps {
  onModeChange: (mode: InvestMode) => void;
}

export function ContextDock({ onModeChange }: ContextDockProps) {
  const { state } = useInvestState();

  return (
    <footer
      className="sticky bottom-0 z-30"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--glass-border)',
        height: 56,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          {state.compareFunds.length > 0 && (
            <button
              onClick={() => onModeChange('compare')}
              className="flex items-center gap-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              {state.compareFunds.length} funds queued
            </button>
          )}
        </div>
        <p style={{ color: 'var(--text-muted)', maxWidth: 480 }} className="hidden sm:block">
          Mutual fund investments are subject to market risks. Read all scheme related documents carefully.
        </p>
      </div>
    </footer>
  );
}
