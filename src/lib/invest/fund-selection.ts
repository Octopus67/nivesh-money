import type { RiskLevel, CategoryWeights, SelectedFund } from './types';
import fundCacheData from '@/data/fund-cache.json';

// --- Fund cache types & loader ---

interface FundCacheEntry {
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  category: string;
  cagr: { '1y': number | null; '3y': number | null; '5y': number | null; '10y': number | null };
}

interface FundCacheData {
  lastUpdated: string;
  funds: Record<string, FundCacheEntry>;
}

const fundCache = fundCacheData as FundCacheData;

function getCachedCAGR(schemeCode: number): Record<string, number | null> {
  const entry = fundCache.funds[String(schemeCode)];
  if (!entry) return { '1y': null, '3y': null, '5y': null, '10y': null };
  return entry.cagr;
}

// --- Fund identity catalog (NO hardcoded returns) ---

interface CatalogFund {
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  subcategory: string;
}

export const FUND_CATALOG: Record<string, CatalogFund[]> = {
  'equity-conservative': [
    { schemeCode: 120716, schemeName: 'UTI Nifty 50 Index Fund - Direct Growth', fundHouse: 'UTI', subcategory: 'Index' },
    { schemeCode: 118989, schemeName: 'HDFC Top 100 Fund - Direct Growth', fundHouse: 'HDFC', subcategory: 'Large Cap' },
    { schemeCode: 120505, schemeName: 'UTI Mastershare Unit Scheme - Direct Growth', fundHouse: 'UTI', subcategory: 'Large Cap' },
  ],
  'equity-moderate': [
    { schemeCode: 122639, schemeName: 'Parag Parikh Flexi Cap Fund - Direct Growth', fundHouse: 'PPFAS', subcategory: 'Flexi Cap' },
    { schemeCode: 118527, schemeName: 'HDFC Flexi Cap Fund - Direct Growth', fundHouse: 'HDFC', subcategory: 'Flexi Cap' },
    { schemeCode: 120503, schemeName: 'UTI Flexi Cap Fund - Direct Growth', fundHouse: 'UTI', subcategory: 'Flexi Cap' },
    { schemeCode: 120586, schemeName: 'Kotak Flexicap Fund - Direct Growth', fundHouse: 'Kotak', subcategory: 'Flexi Cap' },
  ],
  'equity-aggressive': [
    { schemeCode: 120828, schemeName: 'Quant Small Cap Fund - Direct Growth', fundHouse: 'Quant', subcategory: 'Small Cap' },
    { schemeCode: 125354, schemeName: 'Nippon India Small Cap Fund - Direct Growth', fundHouse: 'Nippon', subcategory: 'Small Cap' },
    { schemeCode: 130502, schemeName: 'HDFC Mid-Cap Opportunities Fund - Direct Growth', fundHouse: 'HDFC', subcategory: 'Mid Cap' },
    { schemeCode: 118834, schemeName: 'Kotak Emerging Equity Fund - Direct Growth', fundHouse: 'Kotak', subcategory: 'Mid Cap' },
  ],
  debt: [
    { schemeCode: 119016, schemeName: 'HDFC Short Term Debt Fund - Direct Growth', fundHouse: 'HDFC', subcategory: 'Short Duration' },
    { schemeCode: 119551, schemeName: 'ICICI Pru Short Term Fund - Direct Growth', fundHouse: 'ICICI Prudential', subcategory: 'Short Duration' },
    { schemeCode: 119455, schemeName: 'SBI Corporate Bond Fund - Direct Growth', fundHouse: 'SBI', subcategory: 'Corporate Bond' },
  ],
  hybrid: [
    { schemeCode: 120587, schemeName: 'ICICI Pru Balanced Advantage Fund - Direct Growth', fundHouse: 'ICICI Prudential', subcategory: 'BAF' },
    { schemeCode: 119212, schemeName: 'HDFC Balanced Advantage Fund - Direct Growth', fundHouse: 'HDFC', subcategory: 'BAF' },
    { schemeCode: 118988, schemeName: 'HDFC Aggressive Hybrid Fund - Direct Growth', fundHouse: 'HDFC', subcategory: 'Aggressive Hybrid' },
  ],
  gold: [
    { schemeCode: 119778, schemeName: 'SBI Gold Fund - Direct Growth', fundHouse: 'SBI', subcategory: 'Gold' },
    { schemeCode: 135616, schemeName: 'Nippon India Gold Savings Fund - Direct Growth', fundHouse: 'Nippon', subcategory: 'Gold' },
    { schemeCode: 120831, schemeName: 'Kotak Gold Fund - Direct Growth', fundHouse: 'Kotak', subcategory: 'Gold' },
  ],
  international: [
    { schemeCode: 145552, schemeName: 'Motilal Oswal S&P 500 Index Fund - Direct Growth', fundHouse: 'Motilal Oswal', subcategory: 'International' },
    { schemeCode: 140242, schemeName: 'Franklin India Feeder - US Opportunities Fund - Direct Growth', fundHouse: 'Franklin', subcategory: 'International' },
  ],
};

// --- Helpers ---

function getEquityKey(risk: RiskLevel): string {
  if (risk <= 2) return 'equity-conservative';
  if (risk === 3) return 'equity-moderate';
  return 'equity-aggressive';
}

function getMaxFunds(amount: number, mode: 'sip' | 'swp' | 'lumpsum'): number {
  if (mode === 'sip') {
    if (amount <= 2000) return 1;
    if (amount <= 10000) return 2;
    if (amount <= 25000) return 3;
    return 4;
  }
  if (mode === 'swp') {
    if (amount <= 500000) return 2;
    if (amount <= 2500000) return 3;
    return 4;
  }
  if (amount <= 25000) return 1;
  if (amount <= 200000) return 2;
  if (amount <= 500000) return 3;
  return 4;
}

function getCatalogKey(categoryKey: string, riskLevel: RiskLevel): string {
  return categoryKey === 'equity' ? getEquityKey(riskLevel) : categoryKey;
}

// --- Public API (NOW SYNCHRONOUS) ---

export function selectFunds(
  riskLevel: RiskLevel,
  weights: CategoryWeights,
  investmentAmount: number,
  mode: 'sip' | 'swp' | 'lumpsum'
): { funds: SelectedFund[]; remainder: number } {
  const maxFunds = getMaxFunds(investmentAmount, mode);
  const categories: { key: keyof CategoryWeights; fundKey: string; weight: number }[] = [
    { key: 'equity', fundKey: getEquityKey(riskLevel), weight: weights.equity },
    { key: 'debt', fundKey: 'debt', weight: weights.debt },
    { key: 'hybrid', fundKey: 'hybrid', weight: weights.hybrid },
    { key: 'gold', fundKey: 'gold', weight: weights.gold },
    { key: 'international', fundKey: 'international', weight: weights.international },
  ];

  const eligible = categories.filter(c => c.weight > 0).sort((a, b) => b.weight - a.weight);
  const selected = eligible.slice(0, maxFunds);

  const funds = selected.map(cat => {
    const pool = FUND_CATALOG[cat.fundKey] ?? [];
    const candidate = pool[0];
    if (!candidate) return null;
    return {
      schemeCode: candidate.schemeCode,
      schemeName: candidate.schemeName,
      fundHouse: candidate.fundHouse,
      category: candidate.subcategory,
      allocation: cat.weight,
      cagr: getCachedCAGR(candidate.schemeCode),
    };
  }).filter((f): f is SelectedFund => f !== null);

  // Calculate remainder for categories that didn't get a fund
  const allocatedWeight = funds.reduce((sum, f) => sum + f.allocation, 0);
  const remainder = 100 - allocatedWeight;

  return { funds, remainder };
}

export function getAlternativeFunds(catalogKey: string, currentCode: number): CatalogFund[] {
  const pool = FUND_CATALOG[catalogKey] ?? [];
  return pool.filter(f => f.schemeCode !== currentCode);
}

import { getCategoryAverage } from './category-averages';

export function calculateAggregateReturn(
  funds: SelectedFund[],
  timeframe: '1y' | '3y' | '5y' | '10y'
): { value: number; isPartial: boolean; noData: boolean; usedCategoryAvg: number; availableFunds: number; totalFunds: number } {
  let weightedReturn = 0;
  let totalWeight = 0;
  let fundsWithData = 0;
  let usedCategoryAvg = 0;

  for (const fund of funds) {
    let ret = fund.cagr[timeframe];

    // If fund doesn't have data for this timeframe, use category average
    if (ret == null) {
      const catAvg = getCategoryAverage(fund.category, timeframe);
      if (catAvg != null) {
        ret = catAvg;
        usedCategoryAvg++;
      }
    }

    if (ret != null) {
      weightedReturn += ret * (fund.allocation / 100);
      totalWeight += fund.allocation / 100;
      fundsWithData++;
    }
  }

  const value = totalWeight > 0 ? Math.round((weightedReturn / totalWeight) * 10) / 10 : 0;
  const noData = totalWeight === 0;
  return { value, isPartial: usedCategoryAvg > 0, noData, usedCategoryAvg, availableFunds: fundsWithData, totalFunds: funds.length };
}

export { getCatalogKey };
