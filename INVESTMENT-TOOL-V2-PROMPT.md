# Investment Tool V2 — Complete Redesign Prompt

> **Instructions:** Read this ENTIRE file before writing any code. This replaces the previous `INVESTMENT-TOOL-PROMPT.md`. The investment tool is being fundamentally redesigned — simpler, smarter, and visually consistent with the rest of the website.

---

## 0. WHAT CHANGED (V1 → V2)

| V1 (Current — Delete) | V2 (New — Build This) |
|------------------------|----------------------|
| 7 tabs: SIP, SWP, Lump Sum, Risk, Explore, Compare, Portfolio | **4 tabs: SIP, SWP, Lump Sum, Compare** |
| Risk Profiler = separate full-screen card questionnaire | **Inline 5-level slider** embedded in each calculator tab |
| Fund Explorer = separate search/browse mode | **Auto-selected funds** shown inline based on risk + inputs |
| Portfolio Builder = separate 3-panel mode | **Removed for now** (may revisit later) |
| Dark glassmorphism theme (#0A0A0F backgrounds) | **Light theme** matching the rest of the website |
| Emoji icons on pills (💰📤🎯🧠🔍⚖️📊) | **Lucide icons** everywhere |
| Compare tab starts empty | **Pre-populated** with 2 popular funds |
| User manually picks return % | **Auto-populated** from aggregate historical CAGR of selected funds |
| SWP "Lasts" card shows ₹40 | **Fixed** — shows "40 years" |

---

## 1. ARCHITECTURE

### 1.1 Tabs (Only 4)

```
[📈 SIP]  [📉 SWP]  [💎 Lump Sum]  [⚖️ Compare]
```

- Use **Lucide icons** (TrendingUp, TrendingDown, Gem, Scale) — NOT emoji
- Replace emoji icons across the ENTIRE app (mode pills, command bar, context dock)
- Active tab: accent underline or filled background matching site theme
- On mobile: all 4 visible (they fit), no horizontal scroll needed

### 1.2 Theme — Match the Website (LIGHT)

**Delete `invest-tokens.css` dark theme.** Replace with tokens that match `globals.css`:

```css
.invest-tool {
  /* Backgrounds — match main site */
  --bg-base: #ffffff;
  --bg-surface: #fafbfc;
  --bg-elevated: #f1f5f9;
  --bg-hover: #e2e8f0;

  /* Text — match main site */
  --text-primary: #111827;
  --text-secondary: #374151;
  --text-muted: #6b7280;
  --text-subtle: #9ca3af;

  /* Accents — match main site */
  --accent-primary: #1e3a5f;    /* Navy */
  --accent-secondary: #047857;  /* Emerald */
  --accent-blue: #3b82f6;
  --accent-amber: #d97706;

  /* Financial */
  --positive: #047857;          /* Emerald — works on light bg */
  --negative: #dc2626;          /* Red — works on light bg */
  --warning: #d97706;           /* Amber */

  /* Glass — match main site GlassCard */
  --glass-bg: rgba(255, 255, 255, 0.80);
  --glass-border: rgba(0, 0, 0, 0.06);
  --glass-border-hover: rgba(0, 0, 0, 0.10);

  /* Shadows — match main site */
  --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.06);
  --shadow-card-hover: 0 8px 30px rgba(0, 0, 0, 0.10);

  /* Chart palette (works on light bg) */
  --chart-1: #1e3a5f;  /* Navy */
  --chart-2: #047857;  /* Emerald */
  --chart-3: #dc2626;  /* Red */
  --chart-4: #d97706;  /* Amber */
  --chart-5: #3b82f6;  /* Blue */
  --chart-6: #7c3aed;  /* Purple */
}
```

**Use the existing site components** wherever possible: `GlassCard`, `SpotlightCard`, existing `Button`, `Card`, `Input` from `components/ui/`. Don't reinvent.

### 1.3 Shared State (Simplified)

```typescript
interface InvestState {
  activeTab: 'sip' | 'swp' | 'lumpsum' | 'compare';

  // Per-tab risk + fund selections
  sip: TabState;
  swp: TabState;
  lumpsum: TabState;

  // Compare
  compareFunds: FundSummary[];  // 2 funds, pre-populated
}

interface TabState {
  riskLevel: 1 | 2 | 3 | 4 | 5;  // 1=Conservative, 5=Aggressive
  categoryWeights: CategoryWeights;  // User-adjustable allocation %
  selectedFunds: SelectedFund[];     // Auto-selected, user can swap
  aggregateReturn: number;           // Weighted 5Y CAGR (auto-calculated)
  returnTimeframe: '1y' | '3y' | '5y' | '10y';  // User can change, default 5y
}

interface CategoryWeights {
  equity: number;      // %
  debt: number;        // %
  hybrid: number;      // %
  gold: number;        // %
  international: number; // %
  // Must sum to 100
}

interface SelectedFund {
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  category: string;
  allocation: number;  // % of portfolio
  cagr: Record<string, number | null>;  // { '1y': 24.3, '3y': 18.1, ... }
}
```


---

## 2. RISK LEVEL → AUTO-ALLOCATION LOGIC

### 2.1 The 5-Level Risk Slider

Inline within each calculator tab. NOT a separate mode. Simple horizontal slider with 5 labeled positions:

```
Conservative ─── Mod Conservative ─── Moderate ─── Mod Aggressive ─── Aggressive
     1                  2                 3               4                5
```

- Visual: segmented track with 5 dots/stops. Active position highlighted with accent color.
- Label below shows current selection: "Moderate Risk"
- Changing this slider immediately recalculates: category weights → fund selection → aggregate return → projection

### 2.2 Default Category Weights Per Risk Level

These are the DEFAULTS when user selects a risk level. User can then manually adjust.

| Risk Level | Equity | Debt | Hybrid | Gold | International |
|------------|--------|------|--------|------|---------------|
| 1 — Conservative | 15% | 60% | 15% | 10% | 0% |
| 2 — Mod Conservative | 30% | 40% | 15% | 10% | 5% |
| 3 — Moderate | 50% | 20% | 15% | 10% | 5% |
| 4 — Mod Aggressive | 70% | 10% | 10% | 5% | 5% |
| 5 — Aggressive | 85% | 0% | 5% | 0% | 10% |

**SWP override:** For SWP mode, shift allocations more conservative regardless of risk level:
- Risk level 3 (Moderate) in SWP → use weights closer to level 2 in SIP
- Risk level 5 (Aggressive) in SWP → use weights closer to level 3 in SIP
- Rationale: SWP users are withdrawing, need more stability

### 2.3 Category Weight Editor (User-Adjustable)

Below the risk slider, show a compact allocation bar + editable fields:

```
Equity ████████████████████████████████████████████████████  50%  [input]
Debt   ████████████████████                                 20%  [input]
Hybrid ███████████████                                      15%  [input]
Gold   ██████████                                           10%  [input]
Int'l  █████                                                 5%  [input]
                                                    Total: 100% ✓
```

- Each row: colored bar (proportional width) + percentage + editable input field
- Changing any value auto-adjusts: if user increases equity to 60%, other categories proportionally decrease to maintain 100%
- OR: user can manually set each one, with a "Total: X%" indicator that turns red if ≠ 100%
- "Reset to default" link restores the risk-level defaults
- Changing risk slider resets weights to that level's defaults (with confirmation if user had customized)

### 2.4 Number of Funds Based on Investment Amount

**For SIP (monthly amount):**
| Monthly SIP | Number of Funds |
|-------------|----------------|
| ₹500 – ₹5,000 | 1 fund |
| ₹5,001 – ₹15,000 | 2 funds |
| ₹15,001 – ₹25,000 | 3 funds |
| ₹25,001+ | 3-5 funds (dynamic based on category diversity) |

**For Lump Sum (one-time amount):**
| Lump Sum Amount | Number of Funds |
|-----------------|----------------|
| ₹1,000 – ₹50,000 | 1 fund |
| ₹50,001 – ₹2,00,000 | 2 funds |
| ₹2,00,001 – ₹5,00,000 | 3 funds |
| ₹5,00,001+ | 3-5 funds |

**For SWP (corpus amount):**
| Corpus | Number of Funds |
|--------|----------------|
| ₹1,00,000 – ₹10,00,000 | 2 funds |
| ₹10,00,001 – ₹50,00,000 | 3 funds |
| ₹50,00,001+ | 3-5 funds |

The exact number within a range depends on how many categories have >0% weight. If user sets 50% equity + 50% debt (only 2 categories), max 2 funds even if amount qualifies for more.

---

## 3. FUND AUTO-SELECTION ALGORITHM

### 3.1 How It Works

When risk level, category weights, or investment amount changes:

1. **Determine number of funds** (from §2.4 table)
2. **Determine which categories get a fund** — only categories with ≥10% weight get their own fund. Categories with <10% weight get folded into the nearest larger category.
3. **For each category, pick the top fund** using this scoring:
   - Primary: 5Y CAGR (or 3Y if 5Y unavailable)
   - Tiebreaker: lower expense ratio wins
   - Filter: only Direct-Growth plans, AUM > ₹500 Cr (avoid tiny funds)
4. **Set each fund's allocation** = its category's weight percentage

### 3.2 Fund Selection Per Category

When a category needs a fund, pick from these SEBI sub-categories:

| Category | Risk 1-2 (Conservative) | Risk 3 (Moderate) | Risk 4-5 (Aggressive) |
|----------|------------------------|--------------------|-----------------------|
| Equity | Large Cap, Nifty 50 Index | Flexi Cap, Large & Mid Cap | Mid Cap, Small Cap |
| Debt | Short Duration, Banking & PSU | Corporate Bond, Dynamic Bond | Credit Risk (only risk 5) |
| Hybrid | Conservative Hybrid | Balanced Advantage / BAF | Aggressive Hybrid |
| Gold | Gold ETF / Gold Fund | Gold ETF / Gold Fund | Gold ETF / Gold Fund |
| International | — | S&P 500 Index FoF | Nasdaq 100 FoF |

### 3.3 Data Source for Fund Ranking

Use **mf.captnemo.in** for returns data (has pre-calculated 1Y/3Y/5Y returns).
Use **MFAPI.in** for NAV history when captnemo data is unavailable.

**Fallback:** If APIs are slow/down, use a hardcoded list of top 20 funds across categories (updated periodically). This ensures the tool always works even offline.

### 3.4 Hardcoded Fallback Fund List

Include a static JSON with ~20 well-known funds as fallback:

```typescript
const FALLBACK_FUNDS: Record<string, SelectedFund[]> = {
  'equity-conservative': [
    { schemeCode: 120503, schemeName: 'UTI Nifty 50 Index Fund - Direct Growth', category: 'Index', ... },
    { schemeCode: 118989, schemeName: 'HDFC Top 100 Fund - Direct Growth', category: 'Large Cap', ... },
  ],
  'equity-moderate': [
    { schemeCode: 125497, schemeName: 'Parag Parikh Flexi Cap Fund - Direct Growth', category: 'Flexi Cap', ... },
  ],
  'equity-aggressive': [
    { schemeCode: 125307, schemeName: 'Quant Small Cap Fund - Direct Growth', category: 'Small Cap', ... },
  ],
  'debt': [
    { schemeCode: 119237, schemeName: 'HDFC Short Term Debt Fund - Direct Growth', category: 'Short Duration', ... },
  ],
  'hybrid': [
    { schemeCode: 119212, schemeName: 'ICICI Pru Balanced Advantage Fund - Direct Growth', category: 'BAF', ... },
  ],
  'gold': [
    { schemeCode: 135616, schemeName: 'Nippon India Gold Savings Fund - Direct Growth', category: 'Gold', ... },
  ],
  'international': [
    { schemeCode: 145552, schemeName: 'Motilal Oswal S&P 500 Index Fund - Direct Growth', category: 'International', ... },
  ],
};
```

**Important:** Verify these scheme codes are correct by testing against MFAPI.in. Update if any are wrong.

### 3.5 Aggregate Return Calculation

```typescript
function calculateAggregateReturn(
  funds: SelectedFund[],
  timeframe: '1y' | '3y' | '5y' | '10y'
): number {
  let weightedReturn = 0;
  let totalWeight = 0;

  for (const fund of funds) {
    const returnVal = fund.cagr[timeframe];
    if (returnVal !== null && returnVal !== undefined) {
      weightedReturn += returnVal * (fund.allocation / 100);
      totalWeight += fund.allocation / 100;
    }
  }

  // Normalize if some funds don't have data for this timeframe
  return totalWeight > 0 ? weightedReturn / totalWeight : 12; // 12% fallback
}
```

This aggregate return **auto-populates** the "Expected annual return" field in the calculator. User can still override it manually.


---

## 4. TAB SPECS

### 4.1 SIP Calculator Tab

**Layout (top to bottom, single column, max-width 900px centered):**

```
┌─────────────────────────────────────────────────────────┐
│  SECTION 1: Calculator Inputs                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Monthly Investment    [slider] ────── ₹5,000    │    │
│  │ Investment Period     [slider] ────── 10 years  │    │
│  │ Annual Step-up        [slider] ──────  0%       │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  SECTION 2: Risk & Allocation                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Risk Profile:                                    │    │
│  │ ●───●───●───●───●                               │    │
│  │ Con  MC   Mod  MA  Agg                          │    │
│  │                                                  │    │
│  │ Category Allocation:          [Reset to default] │    │
│  │ Equity  ██████████████████████████████  50% [__] │    │
│  │ Debt    ████████████                   20% [__] │    │
│  │ Hybrid  █████████                      15% [__] │    │
│  │ Gold    ██████                          10% [__] │    │
│  │ Int'l   ███                              5% [__] │    │
│  │                                  Total: 100% ✓  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  SECTION 3: Auto-Selected Funds                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Based on your inputs, here's your portfolio:     │    │
│  │ Aggregate 5Y CAGR: 14.2%  [▼ Change timeframe]  │    │
│  │ Expected Annual Return: 14.2% (auto) [edit]      │    │
│  │                                                  │    │
│  │ ┌─────────────────────────────────────────┐      │    │
│  │ │ 1. Parag Parikh Flexi Cap    50%  14.8% │ [🔄] │    │
│  │ │    Flexi Cap · ★★★★★                    │      │    │
│  │ ├─────────────────────────────────────────┤      │    │
│  │ │ 2. HDFC Short Term Debt      20%   7.2% │ [🔄] │    │
│  │ │    Short Duration · ★★★★                │      │    │
│  │ ├─────────────────────────────────────────┤      │    │
│  │ │ 3. ICICI Pru BAF             15%  12.1% │ [🔄] │    │
│  │ │    Balanced Advantage · ★★★★★           │      │    │
│  │ └─────────────────────────────────────────┘      │    │
│  │ [🔄] = Swap fund (opens dropdown of alternatives)│    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  SECTION 4: Projection Chart                            │
│  ┌─────────────────────────────────────────────────┐    │
│  │         📈 Growth Projection                     │    │
│  │  ₹30L ┤                              ╱          │    │
│  │       ┤                           ╱              │    │
│  │  ₹20L ┤                       ╱                  │    │
│  │       ┤                   ╱                      │    │
│  │  ₹10L ┤              ╱                           │    │
│  │       ┤          ╱                               │    │
│  │    ₹0 ┤─────╱────────────────────────────────    │    │
│  │       0    5    10    15    20    25    30 yrs    │    │
│  │                                                  │    │
│  │  [5Y] [10Y] [20Y] [30Y] [MAX]                   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  SECTION 5: Results                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │  INVESTED     │ │  RETURNS      │ │  CORPUS       │    │
│  │  ₹6,00,000   │ │  ₹5,83,491   │ │  ₹11,83,491  │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                         │
│  SECTION 6: Toggles & Insights                          │
│  [  ] Adjust for inflation (6%)                         │
│  [  ] Show tax impact                                   │
│  💡 "Your ₹5K/mo SIP grows to ₹11.8L in 10 years"     │
│                                                         │
│  [Save] [Share]                                         │
└─────────────────────────────────────────────────────────┘
```

**Key behaviors:**
- Sections 1-3 are the "input zone" — changing anything here recalculates everything below in real-time
- The "Expected Annual Return" field is AUTO-POPULATED from the aggregate CAGR of selected funds, but user can click "edit" to override manually
- If user overrides the return %, show a subtle note: "Using custom return rate (portfolio average: 14.2%)"
- Step-up slider: when >0%, chart shows dual lines (flat vs step-up) like V1
- Chart updates continuously on slider drag — no debounce, no "Calculate" button

**Fund card swap behavior:**
- Click the 🔄 (swap) icon on any fund → opens a dropdown/popover showing 3-5 alternative funds in the same category
- Alternatives sorted by 5Y CAGR descending
- Selecting an alternative swaps the fund, recalculates aggregate return
- Use a Lucide icon (RefreshCw or ArrowLeftRight) instead of 🔄 emoji

### 4.2 SWP Calculator Tab

**Same layout structure as SIP, with these differences:**

**Section 1 — Inputs:**
| Input | Range | Default | Step |
|-------|-------|---------|------|
| Initial Corpus | ₹1,00,000 – ₹50,00,00,000 | ₹1,00,00,000 | ₹1,00,000 |
| Monthly Withdrawal | ₹1,000 – ₹10,00,000 | ₹50,000 | ₹1,000 |
| Safe Withdrawal Rate | 1% – 8% | 3.5% | 0.5% |

**The Safe Withdrawal Rate (SWR) field:**
- This is a NEW configurable field, shown as a slider
- Default: 3.5% (Indian market appropriate)
- Info tooltip: "The safe withdrawal rate is the annual percentage you can withdraw without depleting your corpus. Indian markets suggest 3-3.5% for long-term sustainability. The global '4% rule' may be too aggressive for Indian conditions."
- This SWR is used to calculate the "recommended monthly withdrawal" = `(corpus × SWR) / 12`
- Show this as a suggestion: "At 3.5% SWR, recommended withdrawal: ₹29,167/mo"

**Section 2 — Risk & Allocation:**
- Same 5-level slider, but defaults shift more conservative (see §2.2 SWP override)
- For SWP, the allocation should favor: Balanced Advantage, Conservative Hybrid, Short Duration Debt

**Section 3 — Auto-Selected Funds:**
- Same as SIP, but fund selection logic picks more conservative funds within each category
- For equity allocation in SWP: prefer Large Cap / BAF over Mid/Small Cap

**Section 4 — Chart:**
- **Depletion curve** (corpus declining over time), NOT growth curve
- Line color: starts green, transitions to amber when corpus < 50% of initial, turns red when < 6 months of withdrawals remaining
- If corpus never depletes (returns > withdrawals): line stays green, shows "Corpus sustains indefinitely" label

**Section 5 — Results:**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  TOTAL        │ │  REMAINING    │ │  LASTS        │
│  WITHDRAWN    │ │  CORPUS       │ │  28 years     │  ← NOT ₹28, show "28 years"
│  ₹1,68,00,000│ │  ₹12,45,000  │ │               │
└──────────────┘ └──────────────┘ └──────────────┘
```

**BUG FIX — "Lasts" card:**
- The `ResultCard` component currently always formats with `formatINR()`. Add a `format` prop:
  - `format="currency"` (default) → `formatINR(value)`
  - `format="years"` → `${value} years` or `${value}+ years`
  - `format="percent"` → `${value}%`
- SWP "Lasts" card must use `format="years"`

**Section 6 — Insights:**
- Show SWR comparison: "Your withdrawal rate: 6% (₹50K/mo on ₹1Cr). Recommended: 3.5% (₹29,167/mo). ⚠️ Current rate may deplete corpus in 18 years."
- Warning banner if withdrawal rate > SWR: amber background, clear text

### 4.3 Lump Sum Calculator Tab

**Same layout structure as SIP, with these differences:**

**Section 1 — Inputs:**
| Input | Range | Default | Step |
|-------|-------|---------|------|
| Investment Amount | ₹1,000 – ₹50,00,00,000 | ₹1,00,000 | ₹1,000 |
| Investment Period | 1 – 40 years | 10 | 1 year |

(No step-up slider — doesn't apply to lump sum)

**Section 2-3:** Same risk slider + allocation + fund selection as SIP.

**Section 4 — Chart:** Growth curve (exponential), same as SIP but without step-up comparison.

**Section 5 — Results:**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  INVESTED     │ │  RETURNS      │ │  FINAL VALUE  │
│  ₹1,00,000   │ │  ₹2,10,585   │ │  ₹3,10,585   │
└──────────────┘ └──────────────┘ └──────────────┘
```

**Section 6:** Same toggles (inflation, tax) + insights.

### 4.4 Compare Tab

**Pre-populated with 2 popular funds by default.** User can change either fund.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  FUND A: [Nifty 50 Index Fund ▼]                        │
│  vs                                                      │
│  FUND B: [Parag Parikh Flexi Cap ▼]                     │
│                                                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Historical Performance Chart                      │   │
│  │  (Both funds plotted, normalized to 100)           │   │
│  │                                                    │   │
│  │  ── Fund A (Navy)                                  │   │
│  │  ── Fund B (Emerald)                               │   │
│  │                                                    │   │
│  │  [1Y] [3Y] [5Y] [10Y] [MAX]                       │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Comparison Table                                  │   │
│  │                    Fund A          Fund B          │   │
│  │  ─────────────────────────────────────────────     │   │
│  │  1Y Return         +18.2%          +24.3%  ✨     │   │
│  │  3Y Return         +14.5%          +18.1%  ✨     │   │
│  │  5Y Return         +12.8%  ✨      +12.1%         │   │
│  │  10Y Return        +12.2%          +14.8%  ✨     │   │
│  │  ─────────────────────────────────────────────     │   │
│  │  Expense Ratio     0.18%  ✨       0.63%          │   │
│  │  AUM               ₹12,400 Cr     ₹42,380 Cr     │   │
│  │  Category          Index           Flexi Cap       │   │
│  │  Risk Level        High            Very High       │   │
│  │  Min SIP           ₹500            ₹1,000         │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Fund selector dropdowns:**
- Each is a searchable dropdown (combobox pattern)
- Type to search funds (debounced, hits MFAPI.in search)
- Shows fund name + category + 5Y return in dropdown options
- Can compare ANY fund vs ANY fund (no same-category restriction)

**Chart:**
- Both funds' NAV history plotted on same axes
- **Normalized to 100** at the start date (compare growth rate, not absolute NAV)
- Each line: different color from chart palette (Navy vs Emerald)
- Time range pills: 1Y, 3Y, 5Y, 10Y, MAX
- Crosshair on hover showing both values at that date
- Start date = later of the two funds' inception dates. Note: "Comparison starts from [date]"

**Comparison table:**
- Winner per row: subtle accent background + "✨ Best" indicator (use Lucide Star icon, not emoji)
- Clean rows, alternating subtle backgrounds
- Collapsible sections if many rows

**Default pre-populated funds:**
- Fund A: UTI Nifty 50 Index Fund - Direct Growth (popular index fund)
- Fund B: Parag Parikh Flexi Cap Fund - Direct Growth (popular active fund)
- These are just defaults — user can change either immediately


---

## 5. BUGS TO FIX (From V1)

These must be fixed as part of the redesign:

| # | Bug | File | Fix |
|---|-----|------|-----|
| 1 | SWP "Lasts" card shows ₹40 instead of "40 years" | `result-card.tsx` | Add `format` prop: `"currency"` / `"years"` / `"percent"`. SWP uses `format="years"`. |
| 2 | Emoji icons on mode pills | `mode-pills.tsx`, `command-bar.tsx`, `context-dock.tsx` | Replace ALL emoji with Lucide icons throughout the entire invest tool. |
| 3 | SWP math caps at 30yr but UI says 40 | `calculator-math.ts` | Fix: either increase maxMonths to 480 (40yr) or change the fallback text to say "30+ years". |
| 4 | Comparison table shows all dashes (no real data) | `comparison-table.tsx` | `buildSections()` returns null for all values. Must actually fetch fund details and populate. |
| 5 | Risk profiler CTA buttons are dead | Being removed in V2 (risk profiler deleted) | N/A — whole mode removed. |
| 6 | Portfolio projections hardcoded 12% CAGR | Being removed in V2 (portfolio builder deleted) | N/A — whole mode removed. |
| 7 | Command bar "Reset all data" does nothing | `command-bar.tsx` | Wire up to dispatch a RESET action that clears all state + localStorage. |
| 8 | `fundHouse` extracted by splitting scheme name (hacky) | `api.ts` | Use the `fund_house` field from MFAPI.in meta response instead. |

---

## 6. FILES TO DELETE

Remove these files/directories entirely (modes being removed):

```
src/components/invest/modes/risk-profiler.tsx     — DELETE
src/components/invest/modes/fund-explorer.tsx      — DELETE
src/components/invest/modes/portfolio-builder.tsx   — DELETE
```

Update these files to remove references to deleted modes:
- `src/lib/invest/types.ts` — remove `'risk' | 'explore' | 'portfolio'` from `InvestMode`
- `src/lib/invest/context.tsx` — remove risk profiler state, portfolio state
- `src/components/invest/mode-pills.tsx` — remove 3 pills, keep only SIP/SWP/Lump Sum/Compare
- `src/components/invest/command-bar.tsx` — remove mode shortcuts for deleted modes
- `src/components/invest/context-dock.tsx` — remove risk badge, portfolio value (simplify)
- `src/app/invest/page.tsx` — remove lazy imports for deleted modes

---

## 7. ANIMATIONS & INTERACTIONS

Keep the existing animation system from V1 but adapt to light theme:

### 7.1 What to Keep
- Slider → chart real-time updates (no debounce)
- Result card number countUp animations (react-spring)
- Tab switch crossfade (framer-motion AnimatePresence)
- Chart line drawing animation on initial render
- Card hover effects (translateY, shadow)
- Skeleton shimmer for loading states

### 7.2 What to Change
- Skeleton shimmer: adapt colors from dark to light (`#f1f5f9` → `#e2e8f0` → `#f1f5f9`)
- Chart gradient fill: use navy/emerald at 15% opacity (not bright accent at 30%)
- Glass effects: use `rgba(255,255,255,0.80)` with `rgba(0,0,0,0.06)` borders (light glass)
- Focus rings: use `rgba(30,58,95,0.3)` (navy glow) instead of purple glow

### 7.3 Fund Selection Animations
- When risk slider changes → fund cards do a quick fade-out/fade-in (200ms)
- When a fund is swapped → the specific card does a flip animation (300ms)
- Allocation bars animate width changes smoothly (200ms ease-out)

---

## 8. MOBILE RESPONSIVENESS

Only 4 tabs now — much simpler:

| Component | Desktop (>768px) | Mobile (<768px) |
|-----------|-----------------|-----------------|
| Tab pills | All 4 visible in row | All 4 visible (they fit at small size) |
| Calculator inputs | Full width, generous spacing | Full width, tighter spacing |
| Risk slider | Full width | Full width |
| Allocation bars | Full width with inline inputs | Full width, inputs below bars |
| Fund cards | Horizontal layout (name + allocation + CAGR in row) | Stacked (name on top, details below) |
| Projection chart | Full width, 300px height | Full width, 200px min height |
| Result cards | 3 in a row | 3 in a row (compact) or stacked |
| Compare chart | Full width | Full width |
| Compare table | Side-by-side columns | Side-by-side (2 columns always fit) |
| Fund selector dropdown | Inline dropdown | Full-screen search overlay |

---

## 9. EDGE CASES

| Scenario | Handling |
|----------|----------|
| API down (both MFAPI + captnemo) | Use hardcoded fallback fund list (§3.4). Show banner: "Using cached fund data. Live data unavailable." |
| Fund has no 5Y data | Fall back to 3Y CAGR. If no 3Y, use 1Y. If nothing, show "—" and exclude from aggregate calculation. |
| Category weights don't sum to 100% | Show red "Total: 85%" indicator. Disable projection chart. Show: "Adjust allocations to total 100%." |
| User overrides return % then changes risk | Reset return % to new aggregate CAGR. Show brief toast: "Return rate updated to match new portfolio." |
| SWP withdrawal > monthly returns | Show amber warning: "Your withdrawal exceeds monthly returns. Corpus will deplete." |
| SWP corpus = 0 after depletion | Chart stops at depletion point. "Lasts" card shows exact years/months. |
| Very small SIP (₹500) with 5 categories | Only 1 fund selected (from highest-weight category). Other categories ignored. Note: "With ₹500/mo, we recommend a single diversified fund." |
| Compare: both funds selected are the same | Prevent: "Please select two different funds to compare." |
| Compare: one fund has much shorter history | Chart starts from later inception date. Note shown. |
| Swap fund: no alternatives available | Show: "No alternative funds available in this category." Keep current fund. |

---

## 10. BUILD ORDER

```
Phase 1: Cleanup
├── Delete risk-profiler.tsx, fund-explorer.tsx, portfolio-builder.tsx
├── Delete invest-tokens.css dark theme
├── Update types.ts, context.tsx, mode-pills.tsx to remove deleted modes
├── Replace ALL emoji icons with Lucide icons
└── Verify build passes with 0 errors

Phase 2: Light Theme
├── Create new invest-tokens.css with light theme tokens (§1.2)
├── Update all invest components to use light theme
├── Verify visual consistency with rest of website
└── Test: invest tool looks like it belongs on the same site

Phase 3: Risk Slider + Allocation
├── Build 5-level risk slider component
├── Build category weight editor with editable bars
├── Wire up: risk change → weight defaults
├── Wire up: weight change → total validation
└── Test: changing risk updates weights, weights sum to 100%

Phase 4: Fund Auto-Selection
├── Build fund scoring/selection algorithm
├── Create hardcoded fallback fund list
├── Build fund card component (with swap button)
├── Build fund swap dropdown (search alternatives)
├── Wire up: inputs change → fund count changes → funds re-selected
├── Wire up: aggregate CAGR calculation → auto-populate return %
└── Test: changing amount/risk/weights triggers correct fund selection

Phase 5: Fix Calculator Bugs
├── Fix ResultCard format prop (currency/years/percent)
├── Fix SWP "Lasts" display
├── Fix SWP math 30yr cap
├── Fix command bar "Reset all data"
├── Fix fundHouse extraction in api.ts
└── Test: all 3 calculators produce correct results

Phase 6: Compare Tab
├── Build searchable fund selector dropdowns
├── Pre-populate with 2 default funds
├── Build normalized overlay chart
├── Build comparison table with winner highlighting
├── Wire up time range pills
└── Test: can search, select, compare any 2 funds

Phase 7: Polish
├── All animations working on light theme
├── Mobile responsive pass
├── Loading/error/empty states
├── Skeleton shimmers adapted to light theme
├── Final visual consistency check
└── Test: everything works, looks good, no console errors
```

---

## 11. CHECKLIST

Before declaring complete:

- [ ] Only 4 tabs visible: SIP, SWP, Lump Sum, Compare
- [ ] No emoji icons anywhere in the invest tool (all Lucide)
- [ ] Light theme matching rest of website (no dark backgrounds)
- [ ] Risk slider (5 levels) works in SIP, SWP, and Lump Sum tabs
- [ ] Category weight editor works, sums to 100%
- [ ] Funds auto-select based on risk + amount + weights
- [ ] Fund swap works (dropdown with alternatives)
- [ ] Aggregate CAGR auto-populates return field
- [ ] User can change CAGR timeframe (1Y/3Y/5Y/10Y)
- [ ] User can override return % manually
- [ ] SWP has configurable Safe Withdrawal Rate field (default 3.5%)
- [ ] SWP "Lasts" card shows years, not ₹ amount
- [ ] SWP math handles 40-year horizon correctly
- [ ] Compare tab pre-populated with 2 funds
- [ ] Compare chart shows normalized historical performance
- [ ] Compare table shows winner highlighting
- [ ] All calculators produce mathematically correct results
- [ ] Mobile responsive at 375px and 768px
- [ ] No TypeScript errors, no console errors
- [ ] Build passes with 0 errors

---

*This replaces the V1 prompt. Build exactly this — simpler, smarter, consistent with the website.*
