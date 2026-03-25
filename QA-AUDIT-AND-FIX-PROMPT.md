# Full Website Audit + Fix — Autonomous Execution

> **CRITICAL INSTRUCTIONS FOR AGENT:**
>
> 1. Read this ENTIRE prompt before doing anything.
> 2. You will work in TWO phases: **AUDIT** (find everything wrong) then **FIX** (fix everything you found).
> 3. Do NOT ask for human input until EVERYTHING is fixed and verified.
> 4. Work autonomously through all phases. If you hit a blocker you truly cannot resolve, document it and move on to the next item.
> 5. Only when ALL phases are complete and ALL fixes verified, present a final summary to the human.

---

## PHASE 0: SETUP & BUILD CHECK

```bash
cd /Users/manavmht/dad-finance
pnpm install
pnpm build 2>&1
```

If build fails: fix ALL build errors FIRST before proceeding to any audit. Build must pass with 0 errors.

Start the dev server for testing:
```bash
pnpm dev &
```

---

## PHASE 1: AUDIT (Find Everything Wrong)

Work through every section below. For each check, record: ✅ Pass or ❌ Fail + description. Write findings to `/Users/manavmht/dad-finance/QA-REPORT.md` as you go.

### 1.1 Every Page Loads

Visit every route. Verify it renders without errors (check browser console).

**Static pages:**
- `/` (Homepage)
- `/about`
- `/services`
- `/contact`
- `/blog`
- `/blog/power-of-compounding`
- `/blog/retirement-planning-india`
- `/blog/regular-vs-direct-mutual-funds`
- `/blog/swp-retirement-income`
- `/blog/what-is-sip`
- `/privacy-policy`
- `/terms`
- `/disclaimer`
- `/nonexistent-page` (should show custom 404)

**Calculator pages:**
- `/calculators` (index)
- `/calculators/sip`
- `/calculators/swp`
- `/calculators/lumpsum`
- `/calculators/retirement`
- `/calculators/goal-planner`
- `/calculators/emi`
- `/calculators/tax-saving`
- `/calculators/inflation`

**Investment tool:**
- `/invest` (should load with SIP tab active)

For each page: does it render? Any console errors? Any missing components? Any broken imports?

### 1.2 Navigation & Links

- Every navbar link works and goes to correct page
- Every footer link works
- Logo links to homepage
- Mobile hamburger menu opens/closes (if applicable)
- Browser back/forward works on all pages
- No 404s from any internal link on any page
- Calculator index page: all calculator cards link to correct pages
- Blog index: all blog cards link to correct posts

### 1.3 Calculator Math Verification

**Test each calculator with these EXACT inputs and verify output matches (within ₹100 tolerance):**

**SIP Calculator (`/calculators/sip` AND `/invest` SIP tab):**

| Monthly | Years | Return % | Expected Corpus |
|---------|-------|----------|-----------------|
| ₹5,000 | 10 | 12% | ~₹11,61,695 |
| ₹10,000 | 20 | 12% | ~₹99,91,479 |
| ₹25,000 | 5 | 8% | ~₹18,41,659 |

Formula: `FV = P × [((1 + r)^n - 1) / r] × (1 + r)` where r = annual_rate/12/100, n = months

**SWP Calculator (`/calculators/swp` AND `/invest` SWP tab):**

| Corpus | Monthly Withdrawal | Return % | Expected Duration |
|--------|-------------------|----------|-------------------|
| ₹1,00,00,000 | ₹50,000 | 8% | ~28-30 years |
| ₹50,00,000 | ₹30,000 | 10% | Never depletes |
| ₹10,00,000 | ₹1,00,000 | 6% | ~11 months |

**Lump Sum (`/calculators/lumpsum` AND `/invest` Lump Sum tab):**

| Amount | Years | Return % | Expected Value |
|--------|-------|----------|----------------|
| ₹1,00,000 | 10 | 12% | ~₹3,10,585 |
| ₹10,00,000 | 20 | 10% | ~₹67,27,500 |

Formula: `FV = PV × (1 + r)^n`

**EMI Calculator (`/calculators/emi`):**

| Loan | Tenure | Rate | Expected EMI |
|------|--------|------|-------------|
| ₹50,00,000 | 20yr | 8.5% | ~₹43,391 |
| ₹10,00,000 | 5yr | 10% | ~₹21,247 |

**Retirement Calculator (`/calculators/retirement`):**
- Age 30, retire 60, monthly expense ₹50,000, inflation 6%, return 12%
- Verify it produces a reasonable corpus and SIP requirement

**Goal Planner (`/calculators/goal-planner`):**
- Goal ₹50,00,000, 15 years, inflation 6%, return 12%
- Verify future cost and required SIP are reasonable

**Inflation Calculator (`/calculators/inflation`):**
- ₹1,00,000 at 6% for 20 years → should be ~₹3,20,714

**Tax Saving Calculator (`/calculators/tax-saving`):**
- Verify 80C deduction max ₹1,50,000
- Verify tax saved at 30% slab = ~₹46,800

### 1.4 Investment Tool Deep Audit

**Tab navigation:**
- [ ] Only 4 tabs visible: SIP, SWP, Lump Sum, Compare
- [ ] Tab switching works (content changes, no flash/blank)
- [ ] No emoji icons on tabs (should be Lucide icons)
- [ ] Active tab visually distinct

**SIP tab:**
- [ ] Sliders work (monthly amount, duration, step-up)
- [ ] Risk slider (5 levels) present and functional
- [ ] Changing risk level updates category weights
- [ ] Category weight editor present, bars update, total shows
- [ ] Weights sum to 100% validation works
- [ ] Funds auto-select based on risk + amount
- [ ] Fund count changes with investment amount (fewer funds for small SIP)
- [ ] Aggregate CAGR displayed and auto-populates return field
- [ ] User can change CAGR timeframe (1Y/3Y/5Y/10Y)
- [ ] Fund swap button works (shows alternatives)
- [ ] Chart renders and updates in real-time on slider drag
- [ ] Result cards show correct values
- [ ] Step-up comparison (dual lines) works when step-up > 0%
- [ ] Inflation toggle works
- [ ] Tax impact toggle works

**SWP tab:**
- [ ] Corpus, withdrawal, return sliders work
- [ ] Safe Withdrawal Rate field present (default 3.5%)
- [ ] SWR info tooltip/note present
- [ ] "Lasts" card shows YEARS not ₹ amount (the ₹40 bug)
- [ ] Depletion chart renders correctly
- [ ] Chart color transitions (green → amber → red) as corpus depletes
- [ ] Warning shows when withdrawal rate > SWR
- [ ] Risk slider shifts more conservative for SWP
- [ ] Funds auto-selected are more conservative than SIP equivalents

**Lump Sum tab:**
- [ ] Amount and duration sliders work
- [ ] Risk slider + allocation + fund selection works (same as SIP)
- [ ] Growth chart renders
- [ ] Results correct

**Compare tab:**
- [ ] Pre-populated with 2 default funds (not empty)
- [ ] Fund selector dropdowns work (searchable)
- [ ] Can search and select any fund
- [ ] Historical performance chart renders with both fund lines
- [ ] Chart normalized to 100 at start date
- [ ] Time range pills work (1Y/3Y/5Y/10Y/MAX)
- [ ] Comparison table shows metrics with winner highlighting
- [ ] Can swap either fund

**Cross-cutting:**
- [ ] Light theme consistent with rest of website (no dark backgrounds)
- [ ] No emoji icons anywhere in invest tool
- [ ] Command bar (⌘K) works if present
- [ ] Context dock shows relevant info
- [ ] All API calls to MFAPI.in succeed
- [ ] Enrichment from mf.captnemo.in loads (AUM, rating, expense ratio)
- [ ] Fallback works if APIs are down

### 1.5 API Verification

Test these directly:
```bash
curl -s "https://api.mfapi.in/mf/search?q=HDFC" | head -c 200
curl -s "https://api.mfapi.in/mf/119551/latest" | head -c 200
curl -s "https://mf.captnemo.in/kuvera/INF179K01BB2" | head -c 200
```

Then verify the app:
- [ ] Search returns results
- [ ] NAV data parses correctly (no NaN)
- [ ] Date parsing works (DD-MM-YYYY)
- [ ] "N.A." NAV values handled (not displayed as NaN)
- [ ] Caching works (second load is instant)
- [ ] Error handling works (disconnect network → graceful message)

### 1.6 Contact Form

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

- [ ] Returns success
- [ ] Empty name → validation error
- [ ] Invalid email → validation error
- [ ] Empty message → validation error

### 1.7 Edge Cases

Test in each calculator:
- [ ] Minimum values (₹500, 1 year, 1%)
- [ ] Maximum values (max slider, 40 years, 30%)
- [ ] 0% return → flat line, invested = corpus
- [ ] Rapid slider dragging → no lag, no stale values
- [ ] Type a value manually in slider input → validates correctly
- [ ] Negative number typed → rejected
- [ ] Very large number → formats correctly with Indian numbering

Investment tool specific:
- [ ] Category weights set to not sum to 100% → error shown
- [ ] Very small SIP (₹500) → only 1 fund selected
- [ ] Compare: select same fund for both → prevented or warned
- [ ] Fund with no 10Y data → shows "—" not NaN

### 1.8 Responsive Design

Test at these widths (use browser DevTools):

**Desktop (1440px):**
- [ ] All layouts correct, no horizontal scroll
- [ ] Charts readable and interactive

**Tablet (768px):**
- [ ] Layouts stack appropriately
- [ ] Navigation works
- [ ] Charts resize

**Mobile (375px):**
- [ ] No horizontal overflow on ANY page
- [ ] All text readable
- [ ] Sliders usable (large enough touch targets)
- [ ] Invest tool tabs all visible
- [ ] Fund cards readable
- [ ] Charts have minimum height
- [ ] Number inputs would show numeric keyboard (`inputMode="decimal"`)

**Ultra-wide (2560px):**
- [ ] Content doesn't stretch beyond max-width
- [ ] Centered with margins

### 1.9 Visual Consistency

- [ ] Invest tool uses LIGHT theme (matching rest of site)
- [ ] No dark backgrounds (#0A0A0F) anywhere in invest tool
- [ ] Color palette consistent: navy (#1e3a5f), emerald (#047857), blue (#3b82f6)
- [ ] Typography consistent (Inter for UI, monospace for numbers)
- [ ] Border radius consistent across site
- [ ] Card styles consistent (shadows, borders, padding)
- [ ] Glass effects consistent (if used)
- [ ] Positive values: green. Negative: red. On light backgrounds.
- [ ] No mismatched component styles between pages

### 1.10 Animations

- [ ] Tab switch: smooth crossfade (no blank flash)
- [ ] Slider → chart: instant update (no visible delay)
- [ ] Number countUp on result cards
- [ ] Card hover effects (lift + shadow)
- [ ] Skeleton shimmer during loading (light theme colors)
- [ ] No janky/stuttering animations
- [ ] `prefers-reduced-motion` respected (test in DevTools)

### 1.11 Accessibility

- [ ] Tab through entire page — all interactive elements reachable
- [ ] Focus indicator visible on every focusable element
- [ ] All images have alt text
- [ ] All icon-only buttons have aria-label
- [ ] Form inputs have labels
- [ ] Page headings follow h1 → h2 → h3 hierarchy
- [ ] No duplicate IDs
- [ ] Color alone doesn't convey information (green/red paired with +/- text)

### 1.12 SEO & Meta

- [ ] Every page has unique `<title>`
- [ ] Every page has `<meta name="description">`
- [ ] Open Graph tags present (og:title, og:description)
- [ ] Blog posts have proper meta
- [ ] All internal links use Next.js `<Link>` (not raw `<a>`)

### 1.13 Security

- [ ] No API keys in client-side code
- [ ] No sensitive data in localStorage
- [ ] Contact form validates/sanitizes input
- [ ] All external API calls use HTTPS
- [ ] No `dangerouslySetInnerHTML` with unsanitized input

### 1.14 Performance

Run Lighthouse on key pages:
- `/` → target >90 performance
- `/calculators/sip` → target >85
- `/invest` → target >80
- `/blog` → target >90

Check:
- [ ] No single JS chunk > 500KB
- [ ] Images use next/image
- [ ] No layout shifts on load (CLS < 0.1)
- [ ] Charts lazy-loaded (not in initial bundle)

---

## PHASE 2: TRIAGE

After completing ALL audit checks, categorize every issue found:

| Priority | Definition | Action |
|----------|-----------|--------|
| P0 — Critical | Build fails, pages crash, wrong math, data loss | Fix IMMEDIATELY |
| P1 — Major | Broken features, broken links, broken APIs, unusable on mobile | Fix in this session |
| P2 — Moderate | Visual glitches, inconsistent styling, missing states, a11y issues | Fix in this session |
| P3 — Minor | Polish, performance optimization, SEO improvements | Fix if time permits |

Write the triage to `QA-REPORT.md`:

```markdown
## Triage Summary
- P0 Critical: X issues
- P1 Major: X issues
- P2 Moderate: X issues
- P3 Minor: X issues
- Total: X issues

## P0 — Critical
1. [Description] — [File path] — [Root cause]
2. ...

## P1 — Major
1. ...

## P2 — Moderate
1. ...

## P3 — Minor
1. ...
```

---

## PHASE 3: FIX (Autonomous — Do NOT Ask for Human Input)

Work through fixes in priority order: P0 first, then P1, then P2, then P3.

### Execution Rules

1. **Fix one issue at a time.** Make the change, verify it works, then move to the next.
2. **After each fix:** run `pnpm build` to ensure you haven't broken anything.
3. **After fixing all P0s:** run `pnpm build` — must pass with 0 errors.
4. **After fixing all P1s:** re-test the specific features that were broken.
5. **After fixing all P2s:** do a visual scan of key pages.
6. **After fixing all P3s:** run final build.
7. **If a fix would require major architectural changes** that risk breaking other things: document it as "Deferred — requires separate session" and move on.
8. **Do NOT skip issues.** Fix everything you can.

### Fix Documentation

For each fix, update `QA-REPORT.md`:

```markdown
### Fix #1: [Issue title]
- **Priority:** P0
- **File(s) changed:** `src/components/invest/modes/swp-calculator.tsx`
- **What was wrong:** "Lasts" card showed ₹40 instead of "40 years"
- **What I changed:** Added format prop to ResultCard, SWP passes format="years"
- **Verified:** ✅ Now shows "40 years" correctly
```

---

## PHASE 4: VERIFICATION

After ALL fixes are applied:

### 4.1 Build Check
```bash
cd /Users/manavmht/dad-finance
pnpm build 2>&1
```
Must pass with 0 errors, 0 TypeScript errors.

### 4.2 Re-Test Failed Items

Go back through every item that was ❌ in Phase 1. Verify each is now ✅.

### 4.3 Regression Check

Verify fixes didn't break anything else:
- [ ] All 14+ static pages still render
- [ ] All 8 calculator pages still work
- [ ] All 4 invest tool tabs still work
- [ ] Navigation still works
- [ ] Mobile still works
- [ ] Animations still work

### 4.4 Final Build
```bash
pnpm build 2>&1
```
Must pass clean.

---

## PHASE 5: FINAL REPORT

Update `QA-REPORT.md` with the final summary:

```markdown
# QA Audit Report — [Date]

## Executive Summary
- Total issues found: X
- Fixed: X
- Deferred: X (with reasons)
- Remaining: 0

## Audit Results (Pass/Fail per section)
| Section | Checks | Passed | Failed | Fixed |
|---------|--------|--------|--------|-------|
| 1.1 Page loads | X | X | X | X |
| 1.2 Navigation | X | X | X | X |
| ... | ... | ... | ... | ... |

## All Fixes Applied
### P0 — Critical
[list each fix with file + description + verification]

### P1 — Major
[list each fix]

### P2 — Moderate
[list each fix]

### P3 — Minor
[list each fix]

## Deferred Items (if any)
[items that couldn't be fixed, with explanation]

## Calculator Verification Results
[table of all test cases with pass/fail]

## Final Build Status
✅ Build passes with 0 errors
```

---

## ONLY THEN: Present to Human

After Phase 5 is complete and `QA-REPORT.md` is written, present a concise summary to the human:

1. How many issues found
2. How many fixed
3. Any deferred items and why
4. Key highlights (most important fixes)
5. Anything that needs human decision

**Do NOT ask for human input at any point during Phases 0-5. Work autonomously. Fix everything you can. Only present the final result.**

---

*Begin with Phase 0. Go.*
