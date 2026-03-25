'use client';

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { InvestState, InvestMode, RiskLevel, CategoryWeights, SelectedFund, FundSummary, TabState } from './types';

const STORAGE_KEY = 'invest_v2_state';
const STORAGE_VERSION = 2;

const DEFAULT_WEIGHTS: Record<RiskLevel, CategoryWeights> = {
  1: { equity: 15, debt: 60, hybrid: 15, gold: 10, international: 0 },
  2: { equity: 30, debt: 40, hybrid: 15, gold: 10, international: 5 },
  3: { equity: 50, debt: 20, hybrid: 15, gold: 10, international: 5 },
  4: { equity: 70, debt: 10, hybrid: 10, gold: 5, international: 5 },
  5: { equity: 85, debt: 0, hybrid: 5, gold: 0, international: 10 },
};

export function getDefaultWeights(risk: RiskLevel): CategoryWeights {
  return { ...DEFAULT_WEIGHTS[risk] };
}

function defaultTab(): TabState {
  return {
    riskLevel: 3,
    categoryWeights: getDefaultWeights(3),
    selectedFunds: [],
    aggregateReturn: 12,
    returnTimeframe: '5y',
  };
}

const initialState: InvestState = {
  activeTab: 'sip',
  sip: defaultTab(),
  swp: defaultTab(),
  lumpsum: defaultTab(),
  compareFunds: [],
};

type Action =
  | { type: 'SET_TAB'; payload: InvestMode }
  | { type: 'SET_RISK_LEVEL'; payload: { tab: 'sip' | 'swp' | 'lumpsum'; level: RiskLevel } }
  | { type: 'SET_CATEGORY_WEIGHTS'; payload: { tab: 'sip' | 'swp' | 'lumpsum'; weights: CategoryWeights } }
  | { type: 'SET_SELECTED_FUNDS'; payload: { tab: 'sip' | 'swp' | 'lumpsum'; funds: SelectedFund[] } }
  | { type: 'SET_AGGREGATE_RETURN'; payload: { tab: 'sip' | 'swp' | 'lumpsum'; value: number } }
  | { type: 'SET_RETURN_TIMEFRAME'; payload: { tab: 'sip' | 'swp' | 'lumpsum'; timeframe: '1y' | '3y' | '5y' | '10y' } }
  | { type: 'SET_COMPARE_FUNDS'; payload: FundSummary[] }
  | { type: 'RESET_ALL' }
  | { type: 'HYDRATE'; payload: InvestState };

function reducer(state: InvestState, action: Action): InvestState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_RISK_LEVEL': {
      const { tab, level } = action.payload;
      return { ...state, [tab]: { ...state[tab], riskLevel: level, categoryWeights: getDefaultWeights(level) } };
    }
    case 'SET_CATEGORY_WEIGHTS': {
      const { tab, weights } = action.payload;
      return { ...state, [tab]: { ...state[tab], categoryWeights: weights } };
    }
    case 'SET_SELECTED_FUNDS': {
      const { tab, funds } = action.payload;
      return { ...state, [tab]: { ...state[tab], selectedFunds: funds } };
    }
    case 'SET_AGGREGATE_RETURN': {
      const { tab, value } = action.payload;
      return { ...state, [tab]: { ...state[tab], aggregateReturn: value } };
    }
    case 'SET_RETURN_TIMEFRAME': {
      const { tab, timeframe } = action.payload;
      return { ...state, [tab]: { ...state[tab], returnTimeframe: timeframe } };
    }
    case 'SET_COMPARE_FUNDS':
      return { ...state, compareFunds: action.payload };
    case 'RESET_ALL':
      return { ...initialState };
    case 'HYDRATE':
      return action.payload;
    default:
      return state;
  }
}

const AppContext = createContext<{ state: InvestState; dispatch: React.Dispatch<Action> } | null>(null);

export function InvestProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed._version === STORAGE_VERSION && parsed.sip && parsed.swp && parsed.lumpsum) {
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      }
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, _version: STORAGE_VERSION }));
    } catch { /* noop */ }
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useInvestState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useInvestState must be used within InvestProvider');
  return ctx;
}
