// V2 Types

export type InvestMode = 'sip' | 'swp' | 'lumpsum' | 'compare';

export type RiskLevel = 1 | 2 | 3 | 4 | 5;

export interface CategoryWeights {
  equity: number;
  debt: number;
  hybrid: number;
  gold: number;
  international: number;
}

export interface SelectedFund {
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  category: string;
  allocation: number;
  cagr: Record<string, number | null>;
}

export interface TabState {
  riskLevel: RiskLevel;
  categoryWeights: CategoryWeights;
  selectedFunds: SelectedFund[];
  aggregateReturn: number;
  returnTimeframe: '1y' | '3y' | '5y' | '10y';
}

export interface InvestState {
  activeTab: InvestMode;
  sip: TabState;
  swp: TabState;
  lumpsum: TabState;
  compareFunds: FundSummary[];
}

export interface FundSummary {
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  category: string;
  isin: string;
}

export interface Calculation {
  id: string;
  type: 'sip' | 'swp' | 'lumpsum';
  inputs: Record<string, number>;
  results: Record<string, number>;
  savedAt: string;
}

// API types
export interface MFAPIScheme {
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  schemeType: string;
  schemeCategory: string;
  isinGrowth: string;
}

export interface MFAPINavResponse {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
    isin_growth: string;
  };
  data: Array<{ date: string; nav: string }>;
  status: string;
}

export interface NAVDataPoint {
  date: Date;
  nav: number;
}

export interface FundDetail extends FundSummary {
  aum: number | null;
  expenseRatio: number | null;
  rating: number | null;
  fundManager: string | null;
  minSip: number | null;
  returns: {
    '1y': number | null;
    '3y': number | null;
    '5y': number | null;
    '10y': number | null;
    sinceInception: number | null;
  };
  navHistory: NAVDataPoint[];
}
