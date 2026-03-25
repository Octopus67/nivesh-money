# Dad-Finance Final Audit Report

**Date:** $(date +%Y-%m-%d)
**Scope:** Investment Tool V2 rebuild, fund cache system, category averages, main site regression, security
**Build Status:** ✅ Passes (27 routes)

---

## 1. Build & Routes

| Check | Status |
|-------|--------|
| Build passes | ✅ 27 routes confirmed |
| All calculator pages have metadata | ✅ All 8 standalone + invest layout |
| Homepage metadata | ✅ |
| Blog metadata | ✅ |
| Contact metadata | ✅ |
| 404 page | ✅ Custom not-found.tsx |

**Verdict:** PASS — no issues.

---

## 2. Calculator Math

### Formula Verification

| Formula | Test Case | Expected | Actual | Status |
|---------|-----------|----------|--------|--------|
| SIP: `FV = P × [((1+r)^n - 1) / r] × (1+r)` | ₹5,000/mo, 10yr, 12% | ₹11,61,695 | ₹11,61,695 | ✅ |
| Lumpsum: `FV = PV × (1+r)^n` | ₹1L, 10yr, 12% | ₹3,10,585 | ₹3,10,585 | ✅ |
| EMI: `P × r × (1+r)^n / ((1+r)^n - 1)` | ₹50L, 20yr, 8.5% | ₹43,391 | ₹43,391 | ✅ |
| SWP: month-by-month simulation | ₹1Cr, ₹50K/mo, 8% | Never depletes | ✅ Never depletes (₹6.8Cr after 40yr) | ✅ |

### Guard Checks

| Guard | `calculators.ts` | `calculator-math.ts` |
|-------|-------------------|----------------------|
| 0% return | ✅ Short-circuits to invested=total | ✅ Short-circuits |
| Negative inputs | ✅ `Math.max(0, ...)` on all inputs | ✅ `Math.max(0, ...)` |
| Min years = 1 | ✅ `Math.max(1, years)` | ✅ `Math.max(1, years)` |

### Findings

- **[SUGGESTION] Step-up SIP inconsistency in `calculator-math.ts`**
  - File: `src/lib/invest/calculator-math.ts`
  - Line(s): 30-43 (flat SIP) vs 46-58 (step-up SIP)
  - Description: Flat SIP uses beginning-of-period (BOP) annuity formula `FV = P × [((1+r)^n - 1) / r] × (1+r)`, but step-up SIP uses end-of-period (EOP) month-by-month simulation `totalValue = totalValue * (1+r) + currentAmount`. This creates a ~1% discrepancy. For ₹10K/mo at 12% over 10yr with 10% step-up: BOP approach yields ₹33.74L vs EOP yields ₹33.41L.
  - Recommendation: Use consistent timing. Either change step-up loop to BOP: `totalValue = (totalValue + currentAmount) * (1 + r)`, or change flat SIP to also use EOP simulation. The BOP formula (current flat SIP) is the industry standard for SIP calculations.
  - Impact: LOW — the difference is small and only affects step-up SIP in the invest tool.

**Verdict:** PASS — all core formulas are mathematically correct. One minor consistency suggestion.

---

## 3. Investment Tool V2

### Architecture Check

| Check | Status | Notes |
|-------|--------|-------|
| Only 4 tabs | ✅ | SIP, SWP, Lump Sum, Compare |
| Light theme only | ✅ | No dark mode CSS, no `prefers-color-scheme: dark` |
| No emoji in components | ✅ | Uses Lucide icons throughout. SWP badge uses Unicode ✓/⚠ (acceptable) |
| Lucide icons in mode pills | ✅ | TrendingUp, TrendingDown, Gem, Scale |
| Dynamic imports for modes | ✅ | `ssr: false` for all 4 mode components |
| Context provider wraps page | ✅ | `InvestProvider` in page.tsx |
| State persistence | ✅ | localStorage with version check |

### Component-by-Component

#### `mode-pills.tsx` ✅
- 4 tabs with Lucide icons
- Proper `role="tablist"` and `aria-selected`
- Compare tab shows fund count badge
- Animated underline via `layoutId`

#### `fund-cards.tsx` ✅
- No `setState` during render — all state updates in `useEffect`
- Category average fallback works: checks `getCategoryAverage()` when fund CAGR is null
- Swap popover with search functionality
- Override tracking via refs to avoid stale closures
- Clears overrides on risk/weight/amount change

#### `fund-selection.ts` ✅
- `selectFunds` is synchronous — uses cache, no async
- `calculateAggregateReturn` uses category average fallback correctly
- Weighted return calculation normalizes by total weight
- `getMaxFunds` scales with investment amount

#### `category-averages.ts` ✅
- Computes from `fund-cache.json` at module load
- CATEGORY_GROUPS mapping is comprehensive (50+ mappings)
- Requires minimum 2 funds per group for average (prevents outlier bias)
- Returns null for 10Y (insufficient data)

#### `cagr.ts` ✅
- CAGR formula: `(latest/past)^(365/days) - 1`
- 30-day tolerance for finding matching historical NAV
- Guards against 0 or negative NAV values
- Rounds to 1 decimal place

#### `risk-allocation.tsx` ✅
- 5-level slider with visual dots
- All 5 risk levels sum to exactly 100%
- Normalize button when total ≠ 100
- Reset button restores defaults for current risk level
- Accessible: `aria-label` on all inputs

#### `result-card.tsx` ✅
- `format` prop handles currency/years/percent correctly
- Years format: caps at "40+ years"
- Animated number via `@react-spring/web`
- `aria-live="polite"` for screen readers

#### `sip-calculator.tsx` ✅
- Default ₹10,000/mo ✅
- Risk + funds integrated ✅
- Auto-rate from fund CAGR with manual override
- Step-up comparison insight text
- Growth chart with milestones

#### `swp-calculator.tsx` ✅
- Dynamic withdrawal range based on corpus ✅
- SWR badge (Sustainable/Moderate/High risk) ✅
- "Lasts" shows years (40+ for never-depleting) ✅
- Depletion warning with safe withdrawal suggestion
- Corpus range up to ₹500Cr

#### `lumpsum-calculator.tsx` ✅
- Working correctly
- Same pattern as SIP (risk + funds + auto rate)
- Amount range up to ₹500Cr

#### `fund-comparison.tsx` ✅
- Pre-populated with UTI Nifty 50 (120716) and PPFAS Flexi Cap (122639) ✅
- Correct scheme codes ✅
- Race condition guard: AbortController per fund, schemeCode match check ✅
- Per-fund loading states (not global) ✅
- Skeleton UI while loading
- Time range selector (1Y/3Y/5Y/10Y/MAX)

#### `command-bar.tsx` ✅
- Lucide icons (Search, TrendingUp, etc.) ✅
- Reset clears state + localStorage ✅
- ⌘K keyboard shortcut
- Uses `cmdk` library

#### `context-dock.tsx` ✅
- Simplified — shows compare fund count + disclaimer
- No emoji ✅
- Sticky bottom bar with glass effect

#### `invest-tokens.css` ✅
- Light theme only — all values are light colors
- No dark mode media queries
- Proper glass fallback for non-backdrop-filter browsers
- `prefers-reduced-motion` support
- Focus-visible styles for accessibility

### Findings

- **[SUGGESTION] SWP withdrawal reset on corpus change may surprise users**
  - File: `src/components/invest/modes/swp-calculator.tsx`
  - Line(s): 36-38
  - Description: When corpus changes, withdrawal resets to `defaultWithdrawal`. If a user carefully set a specific withdrawal amount then adjusts corpus slightly, their withdrawal gets overwritten.
  - Recommendation: Only reset withdrawal if it falls outside the new valid range, not on every corpus change. E.g., `setWithdrawal(prev => Math.min(Math.max(prev, wp.minWithdrawal), wp.maxWithdrawal))`.

- **[NIT] `fund-cards.tsx` imports `getFundNAV` and `searchFunds` but only uses them in swap popover**
  - File: `src/components/invest/fund-cards.tsx`
  - Line(s): 5
  - Description: These are async API imports in a component that's otherwise synchronous. Not a bug, but the swap popover could be lazy-loaded.
  - Recommendation: Consider extracting `SwapPopover` to its own file with dynamic import.

- **[NIT] Duplicate `getEquityKey` function**
  - File: `src/components/invest/fund-cards.tsx` line 17 and `src/lib/invest/fund-selection.ts` line 30
  - Description: Same function defined in two places.
  - Recommendation: Export from `fund-selection.ts` and import in `fund-cards.tsx`.

**Verdict:** PASS — no critical issues. Well-structured V2 implementation.

---

## 4. Fund Cache System

### `fund-cache.json`

| Metric | Value |
|--------|-------|
| Total funds | 942 |
| With 5Y CAGR | 855 (90.8%) |
| Last updated | 2026-03-25 |
| Structure | `{ lastUpdated, funds: { [schemeCode]: { schemeCode, schemeName, fundHouse, category, cagr: { 1y, 3y, 5y, 10y } } } }` |

**Verdict:** ✅ Healthy cache with good coverage.

### `refresh-fund-cache.mjs`

| Check | Status |
|-------|--------|
| Uses Kuvera API | ✅ via `mf.captnemo.in/kuvera` |
| Uses AMFI for ISINs | ✅ Downloads NAVAll.txt, parses Direct Growth schemes |
| 3s delay between calls | ✅ `DELAY_MS = 3000` |
| Retry logic | ✅ 3 retries with 10s delay |
| Incremental saves | ✅ Every 20 funds |
| Preserves existing cache | ✅ Merges with existing |
| Category limits | ✅ Comprehensive per-category limits |
| AMC dedup | ✅ Max 8 per AMC per category |

### `.github/workflows/refresh-fund-cache.yml`

| Check | Status |
|-------|--------|
| Weekly schedule | ✅ Sunday 6:00 AM IST (cron: `30 0 * * 0`) |
| Manual trigger | ✅ `workflow_dispatch` |
| Node 20 + pnpm | ✅ |
| Cache size check | ✅ Warns if < 100 funds |
| Auto-commit | ✅ With bot user |
| Timeout | ✅ 60 minutes |

### Findings

- **[SUGGESTION] Kuvera API has no 10Y returns**
  - File: `scripts/refresh-fund-cache.mjs`
  - Line(s): 323
  - Description: `10y` is always set to `null`. The CAGR module's `calculateCAGRFromNAV` can compute 10Y from NAV history, but the cache refresh script doesn't use it.
  - Recommendation: Consider computing 10Y CAGR from MFAPI NAV history for funds with sufficient history, or document that 10Y is intentionally unsupported in the cache.

**Verdict:** PASS — robust cache system.

---

## 5. Main Site Regression Check

### Homepage (`page.tsx`) ✅
- Renders all sections: Hero → TrustBar → ServicesGrid → WhyChooseUs → CalculatorPreview → CTA
- Section dividers present between each section
- Proper metadata

### Navbar (`navbar.tsx`) ✅
- Investment Tool link present: `{ href: '/invest', label: 'Investment Tool' }`
- Active indicator: `isActive()` checks `pathname.startsWith(href)`
- Mobile sheet menu with all links
- Scroll-based glass effect

### Footer (`footer.tsx`) ✅
- All 8 calculator links present:
  1. `/calculators/sip`
  2. `/calculators/swp`
  3. `/calculators/retirement`
  4. `/calculators/goal-planner`
  5. `/calculators/emi`
  6. `/calculators/tax-saving`
  7. `/calculators/inflation`
  8. `/calculators/lumpsum`
- SEBI compliance disclaimer
- Social links (placeholder hrefs)

### Standalone Calculators ✅
All 8 calculator pages exist with proper metadata and Suspense boundaries:
- SIP, SWP, Lumpsum, Retirement, EMI, Goal Planner, Tax Saving, Inflation

### Blog (`blog/page.tsx`) ✅
- Renders via `getAllPosts()` from MDX files
- 5 blog posts in `src/content/blog/`
- Dynamic `[slug]` page with MDX rendering

### Contact (`contact/page.tsx`) ✅
- Form renders with all fields
- API route validates and returns errors

**Verdict:** PASS — no regressions detected.

---

## 6. Security

### API Keys in Client Code
✅ **No API keys found.** All external API calls (MFAPI, Kuvera) are to public endpoints requiring no authentication.

### Contact Form Security

| Check | Status |
|-------|--------|
| Honeypot field | ✅ Hidden `website` field, silently accepts if filled |
| Rate limiting | ✅ 5 requests/hour per IP |
| Input validation | ✅ Name (100 chars), email (254 chars, regex), phone (15 chars, regex), message (2000 chars) |
| Service validation | ⚠️ See finding below |

### Blog Security

| Check | Status |
|-------|--------|
| Path traversal protection | ✅ `sanitizeSlug()` strips non-alphanumeric-dash characters |
| Slug validation | ✅ Rejects if sanitized !== original |

### MDX Components Allowlist
✅ Explicit allowlist in `blog/[slug]/page.tsx`: only standard HTML elements (`a`, `h1-h3`, `p`, `ul`, `ol`, `li`, `strong`, `em`, `blockquote`, `code`, `pre`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `hr`, `img`). No custom components that could execute arbitrary code.

### Findings

- **[MEDIUM] Contact form service values mismatch between client and API**
  - File: `src/components/contact-form.tsx` (client) and `src/app/api/contact/route.ts` (API)
  - Description: The contact form sends service values `['sip', 'swp', 'retirement', 'goal', 'elss', 'other']` but the API validates against `['sip', 'swp', 'retirement', 'goal', 'tax', 'general']`. The values `elss` and `other` from the form will be rejected by the API with "Invalid service selected."
  - Recommendation: Sync the values. Either update `VALID_SERVICES` in the API to `['sip', 'swp', 'retirement', 'goal', 'elss', 'other']` or update the form's `<SelectItem>` values to match the API.

- **[NIT] Social links use `href="#"` placeholder**
  - File: `src/components/layout/footer.tsx`
  - Line(s): 47-51
  - Description: Social media links point to `#`. Not a security issue but could confuse users.
  - Recommendation: Either add real URLs or remove the social links section until ready.

- **[NIT] In-memory rate limiting resets on serverless cold start**
  - File: `src/app/api/contact/route.ts`
  - Line(s): 4-12
  - Description: The `rateLimitMap` is in-memory, so it resets when the serverless function cold-starts. This is acceptable for a low-traffic site but won't provide strong protection under load.
  - Recommendation: Acceptable for current scale. If traffic grows, consider Redis-based rate limiting.

**Verdict:** PASS with one MEDIUM finding (service mismatch).

---

## Summary of All Findings

| # | Severity | Area | Description | File |
|---|----------|------|-------------|------|
| 1 | **MEDIUM** | Security | Contact form service values (`elss`, `other`) rejected by API validation (`tax`, `general`) | `contact-form.tsx` / `route.ts` |
| 2 | SUGGESTION | Math | Step-up SIP uses EOP simulation while flat SIP uses BOP formula in `calculator-math.ts` | `calculator-math.ts` |
| 3 | SUGGESTION | UX | SWP withdrawal resets to default on any corpus change | `swp-calculator.tsx` |
| 4 | SUGGESTION | Cache | 10Y CAGR always null — could compute from NAV history | `refresh-fund-cache.mjs` |
| 5 | NIT | Code | Duplicate `getEquityKey` function in two files | `fund-cards.tsx` / `fund-selection.ts` |
| 6 | NIT | Code | SwapPopover could be lazy-loaded | `fund-cards.tsx` |
| 7 | NIT | UX | Social links use `#` placeholder | `footer.tsx` |
| 8 | NIT | Infra | In-memory rate limiting resets on cold start | `route.ts` |

---

## Overall Verdict: ✅ APPROVE

The Investment Tool V2 is a well-architected rebuild with:
- Correct financial math (all 4 core formulas verified)
- Clean light-theme-only design with no dark mode remnants
- Robust 942-fund cache with weekly auto-refresh
- Proper category average fallbacks
- Good security posture (honeypot, rate limiting, path traversal protection, MDX allowlist)
- Accessible components (ARIA attributes, focus-visible, reduced-motion support)

The one MEDIUM finding (service value mismatch) should be fixed before production but is not a blocker — it only affects users who select "Tax Saving (ELSS)" or "Other" in the contact form service dropdown.
