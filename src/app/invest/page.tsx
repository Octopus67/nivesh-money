'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { InvestProvider } from '@/lib/invest/context';
import { ModePills } from '@/components/invest/mode-pills';
import { CommandBar } from '@/components/invest/command-bar';
import { ContextDock } from '@/components/invest/context-dock';
import type { InvestMode } from '@/lib/invest/types';
import { EASE } from '@/lib/invest/animations';

const SIPCalculator = dynamic(() => import('@/components/invest/modes/sip-calculator'), { ssr: false });
const SWPCalculator = dynamic(() => import('@/components/invest/modes/swp-calculator'), { ssr: false });
const LumpSumCalculator = dynamic(() => import('@/components/invest/modes/lumpsum-calculator'), { ssr: false });
const FundComparison = dynamic(() => import('@/components/invest/modes/fund-comparison'), { ssr: false });

const MODE_COMPONENTS: Record<InvestMode, React.ComponentType> = {
  sip: SIPCalculator,
  swp: SWPCalculator,
  lumpsum: LumpSumCalculator,
  compare: FundComparison,
};

export default function InvestPage() {
  const [mode, setMode] = useState<InvestMode>('sip');
  const ActiveMode = MODE_COMPONENTS[mode];

  return (
    <InvestProvider>
      <div className="flex flex-col min-h-screen pt-20">
        {/* Tier 1: Mode Pills */}
        <div
          className="sticky top-[72px] z-30"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--glass-border)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <ModePills activeMode={mode} onModeChange={setMode} />
            </div>
            <div className="flex-shrink-0">
              <CommandBar onModeChange={setMode} />
            </div>
          </div>
        </div>

        {/* Tier 2: Active Mode Canvas */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: EASE.out }}
            >
              <ActiveMode />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tier 3: Context Dock */}
        <ContextDock onModeChange={setMode} />
      </div>
    </InvestProvider>
  );
}
