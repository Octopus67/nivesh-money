# Investment Tool Bug Fixes — Autonomous Execution

> **Instructions:** Fix ALL bugs listed below. Work through them in order. Do NOT ask for human input until everything is fixed and verified. Run `pnpm build` after each fix to ensure nothing breaks.

**Project:** `/Users/manavmht/dad-finance`

---

## BUG 1: Compare Tab — Metrics Table Shows Wrong Fund

### Problem
The chart shows "UTI Nifty 50 Index Fund" and "Parag Parikh Flexi Cap Fund" but the comparison table below shows "Axis ELSS Tax Saver Fund" metrics. The table data doesn't match the chart data.

### Root Cause
In `src/components/invest/modes/fund-comparison.tsx`, the chart and table both use `dataA`/`dataB` state which comes from `fetchFund(fundA.schemeCode)` and `fetchFund(fundB.schemeCode)`. The issue is likely:
1. **Stale localStorage cache** — the cache key `mf_detail_{schemeCode}` may have stored data from a previous fund that was looked up with a different scheme code
2. **Race condition** — when the user changes Fund A via the dropdown, the old fetch may resolve after the new one, overwriting with stale data
3. **The fund selector dropdown may be updating the display name but not triggering a new data fetch**

### Fix
1. In `fund-comparison.tsx`, verify that changing either fund dropdown triggers a fresh `fetchFund` call with the NEW scheme code
2. Add an AbortController to cancel in-flight fetches when the fund selection changes (prevents race conditions)
3. Clear the specific cache entry when a fund is swapped: `localStorage.removeItem('mf_detail_' + oldSchemeCode)`
4. Add a loading state per fund (not global) so the table shows "Loading..." for the fund being changed while the other stays stable
5. Verify the `ComparisonTable` component receives `detailA` and `detailB` that match the currently selected funds — add a guard: if `detailA.schemeCode !== fundA.schemeCode`, don't render (show loading instead)

### Verification
- Select Fund A = UTI Nifty 50, Fund B = Parag Parikh Flexi Cap
- Table must show UTI Nifty 50 metrics in column A and PPFAS metrics in column B
- Change Fund A to HDFC Top 100 → table column A updates to HDFC Top 100 metrics
- No stale data from previous selections

---

## BUG 2: Compare Tab — Slow Initial Load

### Problem
The two default funds take too long to load on first visit. Multiple redundant API calls.

### Root Cause
In `fund-comparison.tsx` line 43-50, on mount it calls `fetchFund` for both defaults. Each `fetchFund` calls BOTH `getFundDetail(code)` AND `getFundNAV(code)`. But in `api.ts`, both functions call the SAME MFAPI endpoint (`/mf/{schemeCode}`) — so the same URL is fetched TWICE per fund = 4 API calls for 2 unique URLs.

### Fix

**Step 1: Deduplicate API calls in `api.ts`**

Create a single function that fetches once and returns both NAV history and detail:

```typescript
async function fetchFundData(schemeCode: number): Promise<{ nav: NAVDataPoint[], detail: FundDetail }> {
  const cacheKey = `mf_full_${schemeCode}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  // Single API call
  const raw = await fetchWithRetry(`${MFAPI_BASE}/mf/${schemeCode}`);
  const nav = parseNAVHistory(raw.data);
  const detail = buildFundDetail(raw.meta, nav);

  // Try enrichment from captnemo (non-blocking)
  try {
    const enrichment = await fetchCaptnemo(raw.meta.isin_growth);
    if (enrichment) Object.assign(detail, enrichment);
  } catch { /* ignore enrichment failures */ }

  const result = { nav, detail };
  setCache(cacheKey, result, 6 * 60 * 60 * 1000); // 6hr TTL
  return result;
}
```

**Step 2: Pre-seed cache for default comparison funds**

In `fund-comparison.tsx`, embed a small static snapshot of the 2 default funds so the UI renders instantly on first visit, then refresh from API in background:

```typescript
const DEFAULT_FUND_A_SNAPSHOT = {
  schemeCode: 120503,
  schemeName: 'UTI Nifty 50 Index Fund - Direct Plan - Growth',
  fundHouse: 'UTI Mutual Fund',
  category: 'Index Fund',
  returns: { '1y': 6, '3y': 13, '5y': 11, '10y': 12.5 },
};

const DEFAULT_FUND_B_SNAPSHOT = {
  schemeCode: 122639,
  schemeName: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
  fundHouse: 'PPFAS Mutual Fund',
  category: 'Flexi Cap',
  returns: { '1y': 7, '3y': 19, '5y': 17, '10y': null },
};
```

Show the snapshot data immediately in the table. Fetch real NAV data for the chart in background. When real data arrives, update both chart and table.

### Verification
- First visit (clear localStorage): table shows snapshot data instantly, chart loads within 2-3s
- Second visit: everything loads from cache instantly
- No duplicate API calls in Network tab

---

## BUG 3: SIP Always Shows Only 1 Fund

### Problem
Regardless of risk profile or investment amount, only 1 fund appears in the SIP tab.

### Root Cause
In `src/lib/invest/fund-selection.ts` line 52-62, `getMaxFunds` correctly maps amounts to fund counts. But the default SIP amount is ₹5,000 which maps to 1 fund. The user expects more funds to appear when they change the risk profile, but fund count is driven by AMOUNT not risk.

Additionally, the threshold ₹5,000 → 1 fund is too restrictive. Most users start at the default and never see multiple funds.

### Fix

**Step 1: Lower the thresholds in `getMaxFunds`:**

```typescript
function getMaxFunds(amount: number, tab: 'sip' | 'swp' | 'lumpsum'): number {
  if (tab === 'sip') {
    if (amount <= 2000) return 1;
    if (amount <= 10000) return 2;
    if (amount <= 25000) return 3;
    return 4;  // cap at 4, not 5
  }
  if (tab === 'swp') {
    if (amount <= 500000) return 2;
    if (amount <= 2500000) return 3;
    return 4;
  }
  // lumpsum
  if (amount <= 25000) return 1;
  if (amount <= 200000) return 2;
  if (amount <= 500000) return 3;
  return 4;
}
```

**Step 2: Change the default SIP amount to ₹10,000** (more realistic starting point, shows 2 funds by default)

**Step 3: Ensure the `investmentAmount` prop is reactive** — when the user drags the SIP amount slider, the fund count should update immediately. Verify in `sip-calculator.tsx` that the `monthly` state is passed to `FundCards` and that `FundCards` re-runs `selectFunds` when it changes.

### Verification
- Default SIP (₹10,000): shows 2 funds
- ₹2,000 SIP: shows 1 fund
- ₹15,000 SIP: shows 2 funds
- ₹30,000 SIP: shows 3 funds
- ₹50,000+ SIP: shows 4 funds
- Changing the slider updates fund count in real-time

---

## BUG 4: Unrealistic Return Percentages (28% Aggressive, 20% Moderate)

### Problem
The hardcoded CAGR values in `FALLBACK_FUNDS` are wildly inaccurate. Aggressive shows 28% 5Y returns, moderate shows 20%, conservative shows 7%. These don't reflect reality. Worse: the system NEVER fetches live data — it only uses stale hardcoded numbers.

### Root Cause
In `src/lib/invest/fund-selection.ts` lines 3-42, ALL return data is hardcoded in `FALLBACK_FUNDS` and NEVER updated from real API data. The hardcoded values are stale/optimistic. The live API (MFAPI.in) provides full NAV history for ALL 10,000+ Indian mutual funds, from which we can calculate accurate CAGR — but this is never used for fund selection.

### Fix — LIVE DATA IS PRIMARY, FALLBACK IS LAST RESORT

**CRITICAL PRINCIPLE: All return data must come from LIVE API calls. Hardcoded data is ONLY for when the API is completely unreachable (offline mode). The user explicitly does not want stale data in the system.**

**Step 1: Build a `calculateCAGR` utility from NAV history**

```typescript
// lib/invest/cagr.ts

interface CAGRResult {
  '1y': number | null;
  '3y': number | null;
  '5y': number | null;
  '10y': number | null;
}

function calculateCAGRFromNAV(navHistory: { date: Date; nav: number }[]): CAGRResult {
  if (!navHistory.length) return { '1y': null, '3y': null, '5y': null, '10y': null };

  // Sort newest first
  const sorted = [...navHistory].sort((a, b) => b.date.getTime() - a.date.getTime());
  const latest = sorted[0];

  const getCAGR = (years: number): number | null => {
    const targetDate = new Date(latest.date);
    targetDate.setFullYear(targetDate.getFullYear() - years);

    // Find the NAV closest to the target date
    const closest = sorted.reduce((prev, curr) =>
      Math.abs(curr.date.getTime() - targetDate.getTime()) <
      Math.abs(prev.date.getTime() - targetDate.getTime()) ? curr : prev
    );

    // If closest date is more than 30 days from target, data doesn't exist for this period
    const daysDiff = Math.abs(closest.date.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 30) return null;

    const actualDays = (latest.date.getTime() - closest.date.getTime()) / (1000 * 60 * 60 * 24);
    if (actualDays <= 0 || closest.nav <= 0) return null;

    const cagr = (Math.pow(latest.nav / closest.nav, 365 / actualDays) - 1) * 100;
    return Math.round(cagr * 10) / 10; // 1 decimal place
  };

  return {
    '1y': getCAGR(1),
    '3y': getCAGR(3),
    '5y': getCAGR(5),
    '10y': getCAGR(10),
  };
}
```

**Step 2: Build a `fetchFundWithCAGR` function that fetches live data**

```typescript
// lib/invest/api.ts — add this

async function fetchFundWithCAGR(schemeCode: number): Promise<{
  schemeName: string;
  fundHouse: string;
  category: string;
  cagr: CAGRResult;
  nav: NAVDataPoint[];
}> {
  const cacheKey = `mf_live_${schemeCode}`;
  const cached = getFromLocalStorage(cacheKey);

  // Cache valid for 6 hours
  if (cached && Date.now() - cached.timestamp < 6 * 60 * 60 * 1000) {
    return cached.data;
  }

  // Fetch full NAV history from MFAPI.in (single call)
  const response = await fetchWithRetry(`https://api.mfapi.in/mf/${schemeCode}`);
  const navHistory = response.data
    .map((d: { date: string; nav: string }) => ({
      date: parseDDMMYYYY(d.date),
      nav: parseFloat(d.nav),
    }))
    .filter((d: NAVDataPoint) => !isNaN(d.nav));

  const cagr = calculateCAGRFromNAV(navHistory);

  const result = {
    schemeName: response.meta.scheme_name,
    fundHouse: response.meta.fund_house,
    category: response.meta.scheme_category,
    cagr,
    nav: navHistory,
  };

  // Cache for 6 hours
  saveToLocalStorage(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}
```

**Step 3: Rewrite `FUND_CATALOG` — store only fund identity, NOT returns**

The hardcoded list should ONLY contain which funds to pick for each risk/category combo. Returns are ALWAYS fetched live.

```typescript
// lib/invest/fund-catalog.ts

interface CatalogFund {
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  subcategory: string;  // e.g., "Large Cap", "Flexi Cap", "Short Duration"
}

// This is a CURATED LIST of quality funds per category+risk.
// Return data is NEVER stored here — always fetched live from API.
const FUND_CATALOG: Record<string, CatalogFund[]> = {
  'equity-conservative': [
    { schemeCode: 120503, schemeName: 'UTI Nifty 50 Index Fund - Direct Plan - Growth', fundHouse: 'UTI Mutual Fund', subcategory: 'Index Fund' },
    { schemeCode: 118989, schemeName: 'HDFC Large Cap Fund - Direct Plan - Growth', fundHouse: 'HDFC Mutual Fund', subcategory: 'Large Cap' },
  ],
  'equity-moderate': [
    { schemeCode: 122639, schemeName: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth', fundHouse: 'PPFAS Mutual Fund', subcategory: 'Flexi Cap' },
  ],
  'equity-aggressive': [
    { schemeCode: 130502, schemeName: 'HDFC Mid-Cap Opportunities Fund - Direct Plan - Growth', fundHouse: 'HDFC Mutual Fund', subcategory: 'Mid Cap' },
    { schemeCode: 125307, schemeName: 'Quant Small Cap Fund - Direct Plan - Growth', fundHouse: 'Quant Mutual Fund', subcategory: 'Small Cap' },
    { schemeCode: 118778, schemeName: 'Nippon India Small Cap Fund - Direct Plan - Growth', fundHouse: 'Nippon India Mutual Fund', subcategory: 'Small Cap' },
  ],
  'debt': [
    { schemeCode: 119237, schemeName: 'HDFC Short Term Debt Fund - Direct Plan - Growth', fundHouse: 'HDFC Mutual Fund', subcategory: 'Short Duration' },
    { schemeCode: 119455, schemeName: 'SBI Corporate Bond Fund - Direct Plan - Growth', fundHouse: 'SBI Mutual Fund', subcategory: 'Corporate Bond' },
  ],
  'hybrid': [
    { schemeCode: 119212, schemeName: 'ICICI Prudential Balanced Advantage Fund - Direct Plan - Growth', fundHouse: 'ICICI Prudential Mutual Fund', subcategory: 'Balanced Advantage' },
    { schemeCode: 118988, schemeName: 'HDFC Aggressive Hybrid Fund - Direct Plan - Growth', fundHouse: 'HDFC Mutual Fund', subcategory: 'Aggressive Hybrid' },
    { schemeCode: 120175, schemeName: 'SBI Conservative Hybrid Fund - Direct Plan - Growth', fundHouse: 'SBI Mutual Fund', subcategory: 'Conservative Hybrid' },
  ],
  'gold': [
    { schemeCode: 135616, schemeName: 'Kotak Gold Fund - Direct Plan - Growth', fundHouse: 'Kotak Mutual Fund', subcategory: 'Gold' },
  ],
  'international': [
    { schemeCode: 145552, schemeName: 'Motilal Oswal S&P 500 Index Fund - Direct Plan - Growth', fundHouse: 'Motilal Oswal Mutual Fund', subcategory: 'International' },
  ],
};
```

**Step 4: Rewrite `selectFunds` to fetch live CAGR**

```typescript
async function selectFunds(
  riskLevel: number,
  weights: CategoryWeights,
  amount: number,
  tab: 'sip' | 'swp' | 'lumpsum'
): Promise<SelectedFund[]> {
  const maxFunds = getMaxFunds(amount, tab);
  const eligibleCategories = getEligibleCategories(weights, maxFunds);

  const selected: SelectedFund[] = [];

  // For each eligible category, pick the best fund from catalog
  for (const { category, allocation } of eligibleCategories) {
    const catalogKey = getCatalogKey(category, riskLevel);
    const candidates = FUND_CATALOG[catalogKey] || [];
    if (candidates.length === 0) continue;

    // Pick first candidate (they're pre-sorted by quality in the catalog)
    const candidate = candidates[0];

    // Fetch LIVE CAGR from API (cached for 6 hours)
    let cagr: CAGRResult;
    try {
      const liveData = await fetchFundWithCAGR(candidate.schemeCode);
      cagr = liveData.cagr;
    } catch {
      // API unreachable — use null values, show "Data unavailable"
      cagr = { '1y': null, '3y': null, '5y': null, '10y': null };
    }

    selected.push({
      schemeCode: candidate.schemeCode,
      schemeName: candidate.schemeName,
      fundHouse: candidate.fundHouse,
      category: candidate.subcategory,
      allocation,
      cagr,
    });
  }

  return selected;
}
```

**Step 5: Handle loading state in UI**

Since live data takes 1-2 seconds to fetch, the UI must handle this:
1. Show fund names + allocation immediately (from catalog — no API needed)
2. Show a small spinner or "Loading returns..." next to each fund's CAGR column
3. When live CAGR arrives, animate the numbers in (spring animation)
4. If API fails, show "—" for returns with a subtle "Live data unavailable" note
5. The aggregate return field shows "Calculating..." until all fund CAGRs are loaded

**Step 6: Verify scheme codes**

After implementing, test each scheme code:
```bash
curl -s "https://api.mfapi.in/mf/120503/latest" | head -c 200  # UTI Nifty 50
curl -s "https://api.mfapi.in/mf/122639/latest" | head -c 200  # PPFAS
curl -s "https://api.mfapi.in/mf/130502/latest" | head -c 200  # HDFC Mid Cap
curl -s "https://api.mfapi.in/mf/125307/latest" | head -c 200  # Quant Small Cap
curl -s "https://api.mfapi.in/mf/118778/latest" | head -c 200  # Nippon Small Cap
curl -s "https://api.mfapi.in/mf/119237/latest" | head -c 200  # HDFC Short Term Debt
curl -s "https://api.mfapi.in/mf/119455/latest" | head -c 200  # SBI Corporate Bond
curl -s "https://api.mfapi.in/mf/119212/latest" | head -c 200  # ICICI BAF
curl -s "https://api.mfapi.in/mf/118988/latest" | head -c 200  # HDFC Aggressive Hybrid
curl -s "https://api.mfapi.in/mf/120175/latest" | head -c 200  # SBI Conservative Hybrid
curl -s "https://api.mfapi.in/mf/135616/latest" | head -c 200  # Kotak Gold
curl -s "https://api.mfapi.in/mf/145552/latest" | head -c 200  # Motilal S&P 500
```

If any returns 404 or wrong fund name, search for the correct code:
```bash
curl -s "https://api.mfapi.in/mf/search?q=UTI%20Nifty%2050%20Index%20Direct" | head -c 500
```

**Step 7: Fund swap also uses live data**

When a user swaps a fund (clicks the swap button), the alternative funds shown in the dropdown should also have live CAGR data. Fetch in parallel for all alternatives in that category when the dropdown opens.

### Expected Results (approximate, from live data)

These are ballpark numbers to sanity-check against. The live API should return values close to these:

| Risk Level | Expected 5Y Aggregate | Why |
|------------|----------------------|-----|
| Conservative (1) | ~9-11% | Mostly debt (7%) + some equity (11%) + gold (24% recent) |
| Moderate (3) | ~12-15% | Balanced equity (17%) + debt (7%) + hybrid (13%) |
| Aggressive (5) | ~16-20% | Heavy equity (21-24%) + international (18%) |

If the live numbers are wildly different from these ranges, investigate — the CAGR calculation may have a bug.

### Verification
- Conservative risk: aggregate return shows ~9-10%, NOT 7%
- Moderate risk: aggregate return shows ~12-14%, NOT 20%
- Aggressive risk: aggregate return shows ~16-18%, NOT 28%
- All numbers should feel reasonable to a financial advisor

---

## BUG 5: SWP Shows Wrong Return % / Timeframe Issues

### Problem
SWP shows 24% return for 5Y timeframe and 12% for 10Y. When a fund doesn't have 10Y data, the aggregate calculation is skewed.

### Root Cause
Same as Bug 4 — hardcoded fallback data with inflated returns. Additionally, `calculateAggregateReturn` in `fund-selection.ts` line 93-101 excludes funds with null data for the selected timeframe, which skews the average (e.g., if only debt funds have 10Y data, the 10Y aggregate drops to ~8%).

### Fix

**Step 1:** Fixed by Bug 4 — all CAGR data now comes from live API, not hardcoded values. SWP uses the same `fetchFundWithCAGR` pipeline.

**Step 2: Fix `calculateAggregateReturn` to handle missing timeframes better:**

```typescript
function calculateAggregateReturn(
  funds: SelectedFund[],
  timeframe: '1y' | '3y' | '5y' | '10y'
): { value: number; isPartial: boolean; availableFunds: number; totalFunds: number } {
  let weightedReturn = 0;
  let totalWeight = 0;
  let fundsWithData = 0;

  for (const fund of funds) {
    const returnVal = fund.cagr[timeframe];
    if (returnVal !== null && returnVal !== undefined) {
      weightedReturn += returnVal * (fund.allocation / 100);
      totalWeight += fund.allocation / 100;
      fundsWithData++;
    }
  }

  const value = totalWeight > 0 ? weightedReturn / totalWeight : 12; // 12% fallback
  const isPartial = fundsWithData < funds.length;

  return {
    value: Math.round(value * 10) / 10,  // Round to 1 decimal
    isPartial,
    availableFunds: fundsWithData,
    totalFunds: funds.length,
  };
}
```

**Step 3: Show a warning in the UI when data is partial:**

If `isPartial` is true, show below the aggregate return:
"⚠️ {timeframe} data available for {availableFunds} of {totalFunds} funds. Aggregate may not be fully representative."

**Step 4: For SWP specifically, default to 5Y timeframe** (not 10Y) since SWP users care about medium-term sustainability. The 10Y option should still be available but with the partial-data warning.

### Verification
- SWP moderate risk, 5Y timeframe: shows ~12-14%, not 24%
- SWP moderate risk, 10Y timeframe: shows ~10-12% with partial data warning
- Switching timeframes updates the return and warning correctly

---

## BUG 6: SWP Monthly Withdrawal Scale Too Broad

### Problem
The withdrawal slider goes from ₹1,000 to ₹10,00,000 as a fixed range regardless of corpus size. For a ₹10L corpus, ₹10L/mo withdrawal is absurd (1200% annual). For a ₹50Cr corpus, max ₹10L/mo is too restrictive (2.4% annual).

### Root Cause
In `src/components/invest/modes/swp-calculator.tsx` line 42-43, the slider has fixed `min={1000} max={1000000}`.

### Fix

**Make the withdrawal slider dynamic based on corpus:**

```typescript
// Calculate sensible withdrawal range based on corpus
const minWithdrawal = Math.max(1000, Math.round(corpus * 0.005 / 12 / 1000) * 1000);
  // 0.5% annual = minimum sensible withdrawal, rounded to nearest ₹1000
const maxWithdrawal = Math.round(corpus * 0.12 / 12 / 1000) * 1000;
  // 12% annual = maximum (very aggressive), rounded to nearest ₹1000
const defaultWithdrawal = Math.round(corpus * 0.035 / 12 / 1000) * 1000;
  // 3.5% annual = safe withdrawal rate default

// Dynamic step based on range
const step = maxWithdrawal > 100000 ? 5000 : maxWithdrawal > 50000 ? 2000 : 1000;
```

**Examples of how this works:**

| Corpus | Min Withdrawal | Max Withdrawal | Default (3.5%) | Step |
|--------|---------------|----------------|-----------------|------|
| ₹10,00,000 | ₹1,000 | ₹10,000 | ₹3,000 | ₹1,000 |
| ₹50,00,000 | ₹2,000 | ₹50,000 | ₹15,000 | ₹2,000 |
| ₹1,00,00,000 | ₹4,000 | ₹1,00,000 | ₹29,000 | ₹5,000 |
| ₹5,00,00,000 | ₹21,000 | ₹5,00,000 | ₹1,46,000 | ₹5,000 |

**Also:** When the corpus slider changes, the withdrawal slider should reset to the new default (3.5% SWR) and update its min/max range. Show the annual withdrawal rate as a derived display: "Annual rate: 3.5%"

**Also:** Show the SWR recommendation inline:
- Green badge if annual rate ≤ 3.5%: "✓ Sustainable"
- Amber badge if 3.5% < rate ≤ 6%: "⚠ Moderate risk"
- Red badge if rate > 6%: "⚠ High depletion risk"

### Verification
- Corpus ₹1Cr: withdrawal slider range ~₹4K to ₹1L, default ~₹29K
- Corpus ₹10L: withdrawal slider range ~₹1K to ₹10K, default ~₹3K
- Changing corpus updates withdrawal range and default
- Annual rate badge shows correct color

---

## BUG 7: Fund Swap/Refresh Button Doesn't Work

### Problem
Clicking the swap/refresh button on a fund card does nothing. The user cannot switch a fund for an alternative.

### Root Cause (3 layered bugs)

**Bug 7a — Swap gets immediately overwritten by useMemo (PRIMARY CAUSE)**

In `src/components/invest/fund-cards.tsx` line 38-40, `funds` is computed by `useMemo` based on `[riskLevel, categoryWeights, investmentAmount, tab]`. The `swapFund` handler at line 59-68 dispatches `SET_SELECTED_FUNDS` to context, but `funds` is NOT read from context — it's always recomputed from `selectFunds()`. Since `selectFunds()` always picks `pool[0]`, the swap is immediately overwritten on the next render.

**Bug 7b — Only 2 funds per pool, no real selection UI**

Each `FALLBACK_FUNDS` category has only 2 funds. `pool.find(f => f.schemeCode !== fund.schemeCode)` returns the single alternative. There's no dropdown, no search, no way to pick from multiple options.

**Bug 7c — Silent failure, no user feedback**

If no alternative exists (`!alt`), the handler silently returns. No toast, no visual indication. User clicks and nothing happens.

### Fix

**Step 1: Separate "computed funds" from "user-overridden funds"**

The core issue is that `useMemo` always recomputes, wiping out user swaps. Fix by tracking user overrides separately:

```typescript
// In fund-cards.tsx

// Step 1: Compute default funds (runs when risk/weights/amount change)
const defaultFunds = useMemo(() =>
  selectFunds(riskLevel, categoryWeights, investmentAmount, tab),
  [riskLevel, categoryWeights, investmentAmount, tab]
);

// Step 2: Read user overrides from context
const userOverrides = useInvestState().tabs[tab]?.fundOverrides ?? {};
// userOverrides is a map: { [categoryKey: string]: schemeCode }

// Step 3: Apply overrides on top of defaults
const funds = useMemo(() => {
  return defaultFunds.map(fund => {
    const overrideCode = userOverrides[fund.category];
    if (!overrideCode || overrideCode === fund.schemeCode) return fund;

    // Find the override fund in the catalog
    const catalogKey = getCatalogKey(fund.category, riskLevel);
    const pool = FUND_CATALOG[catalogKey] ?? [];
    const override = pool.find(f => f.schemeCode === overrideCode);
    if (!override) return fund;

    return { ...override, allocation: fund.allocation, cagr: fund.cagr };
  });
}, [defaultFunds, userOverrides, riskLevel]);
```

When risk/weights/amount change → `defaultFunds` recomputes → overrides are cleared (new portfolio).
When user swaps a fund → override is stored in context → `funds` reflects the swap.

**Step 2: Build a proper fund swap dropdown/popover**

Replace the single-toggle swap with a searchable dropdown:

```
Click swap icon → Popover opens:
┌─────────────────────────────────────┐
│ Search funds...                      │
├─────────────────────────────────────┤
│ Alternatives in [Flexi Cap]:         │
│                                      │
│ ○ Parag Parikh Flexi Cap    17% 5Y  │  ← current (disabled)
│ ○ HDFC Flexi Cap Fund       15% 5Y  │
│ ○ UTI Flexi Cap Fund        14% 5Y  │
│ ○ Kotak Flexi Cap Fund      13% 5Y  │
│                                      │
│ Or search any fund:                  │
│ [Search input________________]       │
│                                      │
│ Results from search...               │
└─────────────────────────────────────┘
```

- Show alternatives from the same SEBI category first (from `FUND_CATALOG`)
- Below that, a search input that hits `MFAPI.in/mf/search?q=...` for any fund
- Each option shows: fund name + 5Y CAGR (fetched live)
- Selecting a fund: stores the override in context, fetches live CAGR, updates aggregate return
- Current fund shown as disabled/checked in the list

**Step 3: Expand `FUND_CATALOG` to have 4-6 funds per category**

Currently only 2 funds per category. Expand to at least 4-6 quality options per category so the swap dropdown has meaningful choices:

Add more funds to each catalog category. For example, `equity-moderate` should have:
- Parag Parikh Flexi Cap (existing)
- HDFC Flexi Cap Fund
- UTI Flexi Cap Fund
- Kotak Flexi Cap Fund
- DSP Flexi Cap Fund

Do this for ALL categories. Search MFAPI.in for correct scheme codes:
```bash
curl -s "https://api.mfapi.in/mf/search?q=HDFC%20Flexi%20Cap%20Direct" | head -c 500
curl -s "https://api.mfapi.in/mf/search?q=UTI%20Flexi%20Cap%20Direct" | head -c 500
# etc.
```

**Step 4: Add user feedback**

- When swap dropdown opens: show loading spinner while fetching alternative CAGRs
- When a fund is selected: brief success toast "Switched to [fund name]"
- If no alternatives available: show "No alternatives available for this category" in the dropdown
- If API fails while fetching alternatives: show "Unable to load alternatives. Try again." with retry button

**Step 5: Clear overrides when risk/weights/amount change**

When the user changes risk level, category weights, or investment amount, clear all fund overrides (the portfolio is being recomputed from scratch):

```typescript
// In context reducer
case 'SET_RISK_LEVEL':
case 'SET_CATEGORY_WEIGHTS':
  return {
    ...state,
    tabs: {
      ...state.tabs,
      [action.tab]: {
        ...state.tabs[action.tab],
        fundOverrides: {},  // Clear overrides
        ...action.payload,
      },
    },
  };
```

### Verification
- [ ] Click swap on a fund → dropdown/popover opens with 4+ alternatives
- [ ] Select an alternative → fund card updates to new fund with live CAGR
- [ ] Aggregate return recalculates with the swapped fund
- [ ] Swap persists (doesn't revert on next render)
- [ ] Change risk level → overrides cleared, fresh fund selection
- [ ] Search in swap dropdown → can find and select any fund from MFAPI.in
- [ ] If API fails → shows error message in dropdown, not silent failure

---

## EXECUTION ORDER

```
1. Fix Bug 4 FIRST (live CAGR from API, FUND_CATALOG without hardcoded returns) — root cause for Bugs 4 AND 5
2. Fix Bug 7 (fund swap: override tracking, swap dropdown, expand catalog to 4-6 per category)
3. Fix Bug 5 (calculateAggregateReturn partial data handling + SWP default timeframe)
4. Fix Bug 3 (lower fund count thresholds + default SIP to ₹10K)
5. Fix Bug 6 (dynamic SWP withdrawal slider)
6. Fix Bug 2 (deduplicate API calls + pre-seed compare defaults)
7. Fix Bug 1 (compare table data mismatch + race condition guard)
8. Verify ALL scheme codes against MFAPI.in (including new catalog entries)
9. Run pnpm build — must pass clean
10. Test each bug fix manually
```

---

## VERIFICATION CHECKLIST

After all fixes:

- [ ] Compare tab: table metrics match the funds shown in chart
- [ ] Compare tab: loads within 1-2s on first visit (snapshot data instant, chart loads in background)
- [ ] Compare tab: changing a fund updates BOTH chart AND table correctly
- [ ] SIP tab: default ₹10K shows 2 funds
- [ ] SIP tab: ₹2K shows 1 fund, ₹30K shows 3 funds, ₹50K+ shows 4 funds
- [ ] Fund swap: click swap icon → dropdown opens with 4+ alternatives from same category
- [ ] Fund swap: can search for any fund in the dropdown
- [ ] Fund swap: selecting alternative updates the card, CAGR fetched live, aggregate recalculates
- [ ] Fund swap: swap persists across renders (not overwritten by useMemo)
- [ ] Fund swap: changing risk level clears overrides and recomputes fresh
- [ ] SIP tab: CAGR values come from LIVE API (not hardcoded) — verify in Network tab that MFAPI.in calls are made
- [ ] SIP tab: Fund cards show "Loading returns..." briefly, then real numbers animate in
- [ ] SIP tab: Conservative 5Y aggregate ~9-11% (from live data)
- [ ] SIP tab: Moderate 5Y aggregate ~12-15% (from live data)
- [ ] SIP tab: Aggressive 5Y aggregate ~16-20% (from live data)
- [ ] SIP tab: If API is unreachable, shows "—" for returns with "Live data unavailable" note
- [ ] SWP tab: Same live data behavior as SIP
- [ ] SWP tab: 10Y timeframe shows partial data warning when applicable
- [ ] SWP tab: withdrawal slider range adapts to corpus size
- [ ] SWP tab: ₹1Cr corpus → withdrawal range ~₹4K to ₹1L
- [ ] SWP tab: annual rate badge shows correct color
- [ ] All scheme codes verified against MFAPI.in (no 404s)
- [ ] `pnpm build` passes with 0 errors
- [ ] No console errors on any invest tool tab

**Only present to human when ALL items are checked.**
