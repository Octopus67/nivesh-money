'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Gem, Scale, Trash2, Search } from 'lucide-react';
import type { InvestMode } from '@/lib/invest/types';
import { useInvestState } from '@/lib/invest/context';
import { EASE } from '@/lib/invest/animations';

const MODE_ITEMS: { id: InvestMode; label: string; icon: React.ElementType }[] = [
  { id: 'sip', label: 'SIP Calculator', icon: TrendingUp },
  { id: 'swp', label: 'SWP Calculator', icon: TrendingDown },
  { id: 'lumpsum', label: 'Lump Sum Calculator', icon: Gem },
  { id: 'compare', label: 'Fund Comparison', icon: Scale },
];

interface CommandBarProps {
  onModeChange: (mode: InvestMode) => void;
}

export function CommandBar({ onModeChange }: CommandBarProps) {
  const [open, setOpen] = useState(false);
  const { dispatch } = useInvestState();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleReset = () => {
    dispatch({ type: 'RESET_ALL' });
    try { localStorage.removeItem('invest_v2_state'); } catch { /* noop */ }
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs flex-shrink-0"
        style={{
          background: 'var(--bg-elevated)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--glass-border)',
        }}
        aria-label="Open command bar"
      >
        <Search size={12} />
        <span className="hidden sm:inline">Search...</span>
        <kbd
          className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
        >
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.3)' }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15, ease: EASE.out }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-lg"
            >
              <Command
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: 'var(--shadow-card-hover)',
                }}
              >
                <Command.Input
                  placeholder="Search modes, actions..."
                  className="w-full px-4 py-3 text-sm outline-none"
                  style={{
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--glass-border)',
                  }}
                  autoFocus
                />
                <Command.List className="max-h-72 overflow-y-auto p-2">
                  <Command.Empty
                    className="py-6 text-center text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No results found.
                  </Command.Empty>
                  <Command.Group
                    heading="Modes"
                    className="text-xs font-medium uppercase tracking-wider mb-1 px-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {MODE_ITEMS.map(item => {
                      const Icon = item.icon;
                      return (
                        <Command.Item
                          key={item.id}
                          value={item.label}
                          onSelect={() => { onModeChange(item.id); setOpen(false); }}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <Icon size={14} />
                          <span>{item.label}</span>
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                  <Command.Group
                    heading="Actions"
                    className="text-xs font-medium uppercase tracking-wider mb-1 px-2 mt-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Command.Item
                      value="Reset all data"
                      onSelect={handleReset}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm"
                      style={{ color: 'var(--negative)' }}
                    >
                      <Trash2 size={14} />
                      <span>Reset all data</span>
                    </Command.Item>
                  </Command.Group>
                </Command.List>
              </Command>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
