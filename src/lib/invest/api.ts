import type { FundSummary, FundDetail, NAVDataPoint, MFAPINavResponse } from './types';

const MFAPI_BASE = 'https://api.mfapi.in';

const TTL = { FUND_LIST: 24 * 60 * 60 * 1000, NAV: 6 * 60 * 60 * 1000, DETAIL: 24 * 60 * 60 * 1000 };

// --- Cache ---

function getCached<T>(key: string, ttlMs: number): { data: T; stale: boolean } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    return { data, stale: Date.now() - timestamp > ttlMs };
  } catch { return null; }
}

function setCache(key: string, data: unknown): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() })); } catch {}
}

// --- Fetch with retry ---

async function fetchWithRetry(url: string, signal?: AbortSignal, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { signal });
      if (res.ok) return res;
      if (res.status === 429) throw new Error('RATE_LIMITED');
      if (res.status === 404) throw new Error('NOT_FOUND');
    } catch (e) {
      if (i === retries - 1 || (e instanceof Error && e.name === 'AbortError')) throw e;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('NETWORK_ERROR');
}

// --- Normalization ---

function parseNAV(data: Array<{ date: string; nav: string }>): NAVDataPoint[] {
  const points: NAVDataPoint[] = [];
  for (const d of data) {
    const nav = parseFloat(d.nav);
    if (isNaN(nav)) continue;
    const [dd, mm, yyyy] = d.date.split('-');
    points.push({ date: new Date(+yyyy, +mm - 1, +dd), nav });
  }
  return points;
}

// --- Public API ---

export async function searchFunds(query: string, signal?: AbortSignal): Promise<FundSummary[]> {
  if (query.length < 2) return [];

  const cacheKey = `mf_search_${query.toLowerCase()}`;
  const cached = getCached<FundSummary[]>(cacheKey, TTL.FUND_LIST);
  if (cached && !cached.stale) return cached.data;

  const res = await fetchWithRetry(`${MFAPI_BASE}/mf/search?q=${encodeURIComponent(query)}`, signal);
  const raw: Array<{ schemeCode: number; schemeName: string }> = await res.json();

  const funds: FundSummary[] = raw.slice(0, 50).map(s => ({
    schemeCode: s.schemeCode,
    schemeName: s.schemeName,
    fundHouse: '',
    category: '',
    isin: '',
  }));

  setCache(cacheKey, funds);
  if (cached?.stale) return funds;
  return funds;
}

/** Enrich a single fund's fundHouse from MFAPI meta */
export async function enrichFundHouse(fund: FundSummary, signal?: AbortSignal): Promise<FundSummary> {
  if (fund.fundHouse) return fund;
  try {
    const res = await fetchWithRetry(`${MFAPI_BASE}/mf/${fund.schemeCode}`, signal);
    const raw: MFAPINavResponse = await res.json();
    return { ...fund, fundHouse: raw.meta.fund_house ?? '', category: raw.meta.scheme_category ?? '' };
  } catch {
    return fund;
  }
}

export async function getFundNAV(schemeCode: number, signal?: AbortSignal): Promise<NAVDataPoint[]> {
  const cacheKey = `mf_nav_${schemeCode}`;
  const cached = getCached<NAVDataPoint[]>(cacheKey, TTL.NAV);

  // Return cached (dates need rehydration)
  if (cached && !cached.stale) {
    return cached.data.map(p => ({ ...p, date: new Date(p.date) }));
  }

  const res = await fetchWithRetry(`${MFAPI_BASE}/mf/${schemeCode}`, signal);
  const raw: MFAPINavResponse = await res.json();
  const points = parseNAV(raw.data);

  setCache(cacheKey, points);
  return points;
}

export async function getLatestNAV(schemeCode: number, signal?: AbortSignal): Promise<number | null> {
  const cacheKey = `mf_latest_${schemeCode}`;
  const cached = getCached<number>(cacheKey, TTL.NAV);
  if (cached && !cached.stale) return cached.data;

  try {
    const res = await fetchWithRetry(`${MFAPI_BASE}/mf/${schemeCode}/latest`, signal);
    const raw: MFAPINavResponse = await res.json();
    const nav = raw.data?.[0] ? parseFloat(raw.data[0].nav) : null;
    if (nav !== null && !isNaN(nav)) {
      setCache(cacheKey, nav);
      return nav;
    }
    return null;
  } catch {
    return cached?.data ?? null;
  }
}

export async function getFundDetail(schemeCode: number, signal?: AbortSignal): Promise<Partial<FundDetail>> {
  const cacheKey = `mf_detail_${schemeCode}`;
  const cached = getCached<Partial<FundDetail>>(cacheKey, TTL.DETAIL);
  if (cached && !cached.stale) return cached.data;

  try {
    const res = await fetchWithRetry(`${MFAPI_BASE}/mf/${schemeCode}`, signal);
    const raw: MFAPINavResponse = await res.json();
    const navHistory = parseNAV(raw.data);

    const detail: Partial<FundDetail> = {
      schemeCode: raw.meta.scheme_code,
      schemeName: raw.meta.scheme_name,
      fundHouse: raw.meta.fund_house,
      category: raw.meta.scheme_category,
      isin: raw.meta.isin_growth,
      navHistory,
      returns: calculateReturns(navHistory),
    };

    setCache(cacheKey, detail);
    return detail;
  } catch {
    return cached?.data ?? {};
  }
}

// --- Helpers ---

function calculateReturns(navHistory: NAVDataPoint[]): FundDetail['returns'] {
  if (!navHistory.length) return { '1y': null, '3y': null, '5y': null, '10y': null, sinceInception: null };

  const sorted = [...navHistory].sort((a, b) => b.date.getTime() - a.date.getTime());
  const latest = sorted[0];

  const cagr = (years: number): number | null => {
    const target = new Date(latest.date);
    target.setFullYear(target.getFullYear() - years);
    const past = sorted.find(p => p.date <= target);
    if (!past) return null;
    const days = (latest.date.getTime() - past.date.getTime()) / (1000 * 60 * 60 * 24);
    return (Math.pow(latest.nav / past.nav, 365 / days) - 1) * 100;
  };

  const oldest = sorted[sorted.length - 1];
  const inceptionDays = (latest.date.getTime() - oldest.date.getTime()) / (1000 * 60 * 60 * 24);
  const sinceInception = inceptionDays > 365
    ? (Math.pow(latest.nav / oldest.nav, 365 / inceptionDays) - 1) * 100
    : null;

  return { '1y': cagr(1), '3y': cagr(3), '5y': cagr(5), '10y': cagr(10), sinceInception };
}
