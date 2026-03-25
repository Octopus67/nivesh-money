# Complete Website QA Audit & Review

> **Instructions for Agent:** This is a comprehensive QA audit of the entire dad-finance website. You must systematically test EVERY page, EVERY calculator, EVERY component, EVERY API call, and EVERY edge case. Do NOT skip anything. Report all findings and FIX every bug you find.

---

## 0. AUDIT OVERVIEW

**Project:** `/Users/manavmht/dad-finance` — A Next.js financial calculator website with:
- Homepage, About, Services, Contact, Blog pages
- 8 standalone calculators (SIP, SWP, Lump Sum, Retirement, Goal Planner, EMI, Tax Saving, Inflation)
- Investment Tool (7 modes: SIP, SWP, Lump Sum, Risk Profiler, Fund Explorer, Fund Comparison, Portfolio Builder)
- Contact form with API route
- Blog system with MDX content
- Legal pages (Privacy Policy, Terms, Disclaimer)

**Your job:** Find every bug, broken link, visual glitch, calculation error, API failure, accessibility issue, and UX problem. Then fix them all.

---

## 1. PRE-AUDIT SETUP

Before testing anything:

```bash
cd /Users/manavmht/dad-finance
pnpm install
pnpm build        # Must complete with ZERO errors
pnpm dev           # Start dev server
```

**Check for:**
- [ ] Build completes with no TypeScript errors
- [ ] Build completes with no ESLint errors
- [ ] No warnings about missing dependencies
- [ ] Dev server starts on localhost:3000
- [ ] No console errors on initial page load

**If build fails:** Fix ALL build errors before proceeding. Document what was broken and how you fixed it.

---

## 2. PAGE-BY-PAGE NAVIGATION AUDIT

Visit every single page and verify it loads correctly. Check each one:

### 2.1 Static Pages

| Page | Route | Check |
|------|-------|-------|
| Homepage | `/` | Hero renders, sections load, animations play, CTAs link correctly |
| About | `/about` | Content renders, no layout shifts |
| Services | `/services` | Service cards render, links work |
| Contact | `/contact` | Form renders, all fields work, validation fires |
| Blog index | `/blog` | Blog cards render, links to individual posts work |
| Blog post | `/blog/[slug]` for each: `power-of-compounding`, `retirement-planning-india`, `regular-vs-direct-mutual-funds`, `swp-retirement-income`, `what-is-sip` | MDX renders, no broken formatting |
| Privacy Policy | `/privacy-policy` | Full content renders |
| Terms | `/terms` | Full content renders |
| Disclaimer | `/disclaimer` | Full content renders |
| 404 page | `/nonexistent-page` | Custom 404 renders (not-found.tsx) |
| Calculators index | `/calculators` | All calculator cards render, links work |

### 2.2 Calculator Pages

| Calculator | Route | Check |
|------------|-------|-------|
| SIP | `/calculators/sip` | Page loads, calculator functional |
| SWP | `/calculators/swp` | Page loads, calculator functional |
| Lump Sum | `/calculators/lumpsum` | Page loads, calculator functional |
| Retirement | `/calculators/retirement` | Page loads, calculator functional |
| Goal Planner | `/calculators/goal-planner` | Page loads, calculator functional |
| EMI | `/calculators/emi` | Page loads, calculator functional |
| Tax Saving | `/calculators/tax-saving` | Page loads, calculator functional |
| Inflation | `/calculators/inflation` | Page loads, calculator functional |

### 2.3 Investment Tool

| Mode | Route/State | Check |
|------|-------------|-------|
| Investment Tool page | `/invest` | Page loads, mode pills render, default mode active |
| SIP mode | Click SIP pill | Sliders work, chart renders, results calculate |
| SWP mode | Click SWP pill | Mode switches, inputs work, chart renders |
| Lump Sum mode | Click Lump Sum pill | Mode switches, calculations correct |
| Risk Profiler | Click Risk pill | Questions render, scoring works, result shows |
| Fund Explorer | Click Explore pill | Search works, API calls succeed, cards render |
| Fund Comparison | Click Compare pill | Can add funds, table renders, chart works |
| Portfolio Builder | Click Build pill | Can add funds, allocation works, projections render |

### 2.4 Navigation & Links

- [ ] Navbar links all work (every link in the nav)
- [ ] Footer links all work
- [ ] No broken internal links (404s) anywhere on the site
- [ ] Logo links back to homepage
- [ ] Mobile hamburger menu opens/closes correctly
- [ ] Active page highlighted in nav
- [ ] Browser back/forward buttons work correctly on all pages

---

## 3. CALCULATOR MATH VERIFICATION

**This is critical. Every calculator must produce mathematically correct results.**

### 3.1 SIP Calculator

Test these exact scenarios and verify the output matches:

| Monthly SIP | Years | Return % | Expected Corpus (approx) | Pass? |
|-------------|-------|----------|--------------------------|-------|
| ₹5,000 | 10 | 12% | ₹11,61,695 | |
| ₹10,000 | 20 | 12% | ₹99,91,479 | |
| ₹1,000 | 30 | 15% | ₹70,09,685 | |
| ₹25,000 | 5 | 8% | ₹18,41,659 | |
| ₹500 | 1 | 10% | ₹6,323 | |

**Formula to verify against:**
```
FV = P × [((1 + r)^n - 1) / r] × (1 + r)
where P = monthly amount, r = monthly rate (annual/12/100), n = total months
```

**Also test:**
- Step-up SIP (if implemented): ₹5,000/mo, 10% annual step-up, 10 years, 12% → verify it's significantly higher than flat SIP
- Minimum values: ₹500, 1 year, 1%
- Maximum values: ₹10,00,000, 40 years, 30%

### 3.2 SWP Calculator

| Corpus | Monthly Withdrawal | Return % | Expected Duration | Pass? |
|--------|-------------------|----------|-------------------|-------|
| ₹1,00,00,000 | ₹50,000 | 8% | ~28-30 years | |
| ₹50,00,000 | ₹30,000 | 10% | Never depletes (withdrawal < returns) | |
| ₹10,00,000 | ₹1,00,000 | 6% | ~11 months | |

**Formula:** Each month: `corpus = corpus × (1 + monthlyRate) - withdrawal`. Stop when corpus ≤ 0.

### 3.3 Lump Sum Calculator

| Amount | Years | Return % | Expected Value | Pass? |
|--------|-------|----------|----------------|-------|
| ₹1,00,000 | 10 | 12% | ₹3,10,585 | |
| ₹10,00,000 | 20 | 10% | ₹67,27,500 | |
| ₹5,00,000 | 5 | 15% | ₹10,05,683 | |

**Formula:** `FV = PV × (1 + r)^n`

### 3.4 Retirement Calculator

- Verify it accounts for inflation
- Verify it calculates required corpus correctly
- Verify monthly SIP needed to reach corpus is correct
- Test with: Age 30, retire at 60, monthly expense ₹50,000, inflation 6%, return 12%

### 3.5 Goal Planner Calculator

- Verify future cost calculation with inflation
- Verify required SIP/lump sum to reach goal
- Test with: Goal ₹50,00,000, timeline 15 years, inflation 6%, return 12%

### 3.6 EMI Calculator

| Loan Amount | Tenure (years) | Interest % | Expected EMI | Pass? |
|-------------|---------------|------------|--------------|-------|
| ₹50,00,000 | 20 | 8.5% | ₹43,391 | |
| ₹10,00,000 | 5 | 10% | ₹21,247 | |
| ₹30,00,000 | 15 | 9% | ₹30,428 | |

**Formula:** `EMI = P × r × (1+r)^n / ((1+r)^n - 1)` where r = monthly rate

### 3.7 Tax Saving Calculator

- Verify Section 80C deduction calculation (max ₹1,50,000)
- Verify tax saved at different slabs (5%, 20%, 30%)
- Verify ELSS vs PPF vs FD comparison if present

### 3.8 Inflation Calculator

- Verify future value: ₹1,00,000 at 6% inflation for 20 years → ₹3,20,714
- Verify purchasing power erosion calculation
- Test edge: 0% inflation (value should stay same)

---

## 4. INVESTMENT TOOL DEEP AUDIT

### 4.1 Risk Profiler

- [ ] All 7 questions render with correct options
- [ ] Clicking an option auto-advances to next question
- [ ] Back button works on every question
- [ ] Step indicator updates correctly
- [ ] Live risk meter animates as answers change
- [ ] Final score maps to correct risk profile (test all 5 profiles by answering accordingly):
  - All lowest scores → Conservative
  - All highest scores → Aggressive
  - Mixed middle → Moderate
- [ ] Result screen shows correct allocation percentages
- [ ] "Build This Portfolio" CTA opens Portfolio Builder with correct pre-fill
- [ ] "Explore Matching Funds" CTA opens Explorer with correct filters
- [ ] Profile persists in localStorage after page refresh
- [ ] Profile badge appears in Context Dock
- [ ] "Retake" button resets and starts over

### 4.2 Fund Explorer

- [ ] Search bar works (type "HDFC" → results appear)
- [ ] Search debounce works (doesn't fire on every keystroke)
- [ ] API calls to MFAPI.in succeed (check Network tab)
- [ ] Fund cards render with correct data
- [ ] CAGR bars show correct proportions
- [ ] Enrichment data loads from mf.captnemo.in (AUM, rating, expense ratio)
- [ ] Filters work: test each filter individually and in combination
- [ ] Sort works: verify order changes when switching sort option
- [ ] "Compare" button adds fund to compare queue
- [ ] "Add to Portfolio" button adds fund to portfolio
- [ ] Fund detail panel/sheet opens on card click
- [ ] NAV history chart renders in fund detail
- [ ] Time range pills work on NAV chart
- [ ] Infinite scroll loads more funds
- [ ] Empty state shows when no results match filters
- [ ] Loading skeletons show during API calls
- [ ] Error state shows if API fails (test by disconnecting network)

### 4.3 Fund Comparison

- [ ] Can add 2-4 funds
- [ ] Cannot add more than 4 (shows limit message)
- [ ] Can remove funds
- [ ] Table view shows all metrics correctly
- [ ] Winner highlighting works (best value highlighted)
- [ ] Chart view shows overlay NAV lines
- [ ] Chart normalization works (all start at 100)
- [ ] Time range pills work on comparison chart
- [ ] Empty state shows when <2 funds selected
- [ ] Mobile layout works (swipeable or scrollable)

### 4.4 Portfolio Builder

- [ ] Can search and add funds
- [ ] Can set allocation percentages
- [ ] Total indicator shows correct sum
- [ ] Validation: cannot proceed if total ≠ 100%
- [ ] Auto-rebalance toggle works (if implemented)
- [ ] Projection chart renders with correct data
- [ ] SIP/Lump Sum toggle changes projection
- [ ] Blended CAGR calculation is correct (weighted average)
- [ ] Risk profile pre-fill works (if risk profile completed)
- [ ] Can remove funds from portfolio
- [ ] Max fund limit enforced
- [ ] Save/export works (if implemented)

### 4.5 Cross-Mode Integration

- [ ] Risk Profiler → Explorer: filters pre-set correctly
- [ ] Risk Profiler → Portfolio Builder: allocation pre-filled
- [ ] Explorer → Comparison: "Compare" button queues fund
- [ ] Explorer → Portfolio: "Add to Portfolio" works
- [ ] Explorer → Calculator: "Calculate SIP with this fund" pre-fills return %
- [ ] Context Dock updates in real-time across all mode switches
- [ ] Command bar (⌘K) searches across modes and funds

---

## 5. API TESTING

### 5.1 MFAPI.in

Test these endpoints directly and verify the app handles responses correctly:

```bash
# Fund list
curl "https://api.mfapi.in/mf?limit=10"

# Search
curl "https://api.mfapi.in/mf/search?q=HDFC"

# Fund NAV history
curl "https://api.mfapi.in/mf/119551"

# Latest NAV
curl "https://api.mfapi.in/mf/119551/latest"
```

- [ ] All endpoints return valid JSON
- [ ] App correctly parses the response format
- [ ] NAV string-to-number conversion works (no NaN)
- [ ] Date parsing works (DD-MM-YYYY format)
- [ ] "N.A." NAV values handled gracefully (not displayed as NaN)

### 5.2 mf.captnemo.in

```bash
# Fund detail by ISIN
curl "https://mf.captnemo.in/kuvera/INF179K01BB2"
```

- [ ] Enrichment data loads correctly
- [ ] App handles missing fields (null AUM, null rating) gracefully
- [ ] App works if this API is completely down (fallback to MFAPI data only)

### 5.3 Contact Form API

```bash
# Test the contact API route
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

- [ ] Returns success response
- [ ] Validates required fields (try empty name, invalid email, empty message)
- [ ] Rate limiting works (if implemented)
- [ ] Error response is user-friendly

### 5.4 Caching Verification

- [ ] Fund list cached in localStorage after first load
- [ ] Subsequent visits load from cache (check Network tab — no API call)
- [ ] Cache expires after TTL (24h for fund list, 6h for NAV)
- [ ] Stale-while-revalidate: cached data shows immediately, fresh data loads in background

---

## 6. EDGE CASE TESTING

### 6.1 Calculator Edge Cases

| Test | Input | Expected Behavior |
|------|-------|-------------------|
| Zero amount | ₹0 in any calculator | Prevented by slider min OR shows validation error |
| Negative number | -1000 typed manually | Rejected, shows "Must be positive" |
| Very large number | ₹99,99,99,99,999 | Handles without overflow, formats correctly |
| Very small return | 0.1% | Calculates correctly, chart shows near-flat line |
| Very high return | 30% (max) | Calculates correctly, shows warning if >30% typed |
| 0% return | 0% in any calculator | Shows flat line, invested = corpus |
| 1 month duration | Minimum duration | Calculates correctly |
| 40 year duration | Maximum duration | Calculates correctly, chart readable |
| Decimal input | ₹5,000.50 | Handles or rounds appropriately |
| Rapid slider movement | Drag slider quickly back and forth | No lag, no stale calculations, chart stays in sync |
| Browser back during calculation | Navigate away mid-interaction | No errors, state preserved or cleanly reset |

### 6.2 Fund Explorer Edge Cases

| Test | Expected Behavior |
|------|-------------------|
| Search with 1 character | No API call (min 2 chars) |
| Search with special characters | No crash, shows "no results" |
| Search with very long string | Truncated or handled gracefully |
| Apply all filters at once | Correct intersection of filters |
| Clear all filters | Returns to unfiltered state |
| Rapid filter toggling | No race conditions, correct results |
| Fund with no 10Y data | Shows "—" for 10Y, other periods show correctly |
| Fund with no rating | Shows "—" or hides rating, no crash |

### 6.3 Portfolio Builder Edge Cases

| Test | Expected Behavior |
|------|-------------------|
| Add same fund twice | Prevented or shows warning |
| Set all allocations to 0% | Total shows 0%, projection disabled |
| Set one fund to 100% | Valid, projection shows single fund |
| Set allocation to 101% | Prevented or shows error |
| Remove all funds | Shows empty state |
| Add 15 funds (max) | Works. 16th blocked with message. |
| Decimal allocation (33.33%) | Handles correctly, total can be 99.99% (acceptable) |

### 6.4 Risk Profiler Edge Cases

| Test | Expected Behavior |
|------|-------------------|
| Answer all questions, then go back and change | Score recalculates correctly |
| Refresh page mid-questionnaire | Restarts from beginning (or resumes if saved) |
| Complete profiler, then retake | Old profile replaced with new one |

---

## 7. RESPONSIVE DESIGN AUDIT

Test at these exact viewport widths:

### 7.1 Desktop (1440px)

- [ ] All layouts use full width appropriately
- [ ] No horizontal scrollbar
- [ ] Charts are readable and interactive
- [ ] Side-by-side layouts work (calculator inputs/outputs, explorer sidebar/grid)

### 7.2 Tablet (768px)

- [ ] Layouts stack appropriately
- [ ] Navigation works (hamburger menu if applicable)
- [ ] Calculator inputs stack above chart
- [ ] Fund Explorer: filter drawer works
- [ ] Charts resize correctly
- [ ] Touch targets are large enough (44px minimum)

### 7.3 Mobile (375px — iPhone SE)

- [ ] No horizontal overflow on any page
- [ ] All text readable (no truncation that hides meaning)
- [ ] Sliders usable with thumb (large enough touch target)
- [ ] Mode pills horizontally scrollable
- [ ] Fund cards single column
- [ ] Bottom sheets work for fund detail
- [ ] Charts have minimum 200px height
- [ ] Number inputs show numeric keyboard (`inputMode="decimal"`)
- [ ] No elements hidden behind fixed headers/footers

### 7.4 Ultra-wide (2560px)

- [ ] Content doesn't stretch beyond max-width
- [ ] Centered with appropriate margins
- [ ] No layout breaks

---

## 8. VISUAL & UI AUDIT

### 8.1 Design Consistency

- [ ] Color palette consistent across all pages (check dark theme tokens)
- [ ] Typography consistent (font sizes, weights, line heights)
- [ ] Spacing consistent (padding, margins follow 4px grid)
- [ ] Border radius consistent (16px glass, 12px cards, 8px inputs, 24px pills)
- [ ] No mismatched component styles between pages

### 8.2 Animations

- [ ] Mode switch crossfade works smoothly (no flash of empty content)
- [ ] Slider → chart updates are instant (no visible delay)
- [ ] Number countUp animations play on value change
- [ ] Card hover effects work (translateY, shadow)
- [ ] Stagger-fade on fund card load
- [ ] Skeleton shimmer animation plays during loading
- [ ] No janky/stuttering animations (check at 60fps in DevTools Performance)
- [ ] `prefers-reduced-motion` disables all animations

### 8.3 Dark Theme

- [ ] No pure black (#000000) backgrounds — should be blue-tinted (#0A0A0F)
- [ ] No pure white (#FFFFFF) body text — should be off-white (#E8E8ED)
- [ ] All text meets 4.5:1 contrast ratio on its background
- [ ] Green/red values readable on dark backgrounds
- [ ] Glassmorphism elements have visible borders (not invisible)
- [ ] Charts readable (lines, labels, tooltips all visible)
- [ ] Input fields have visible borders and focus states
- [ ] Placeholder text visible but muted

### 8.4 Loading States

- [ ] Every API-dependent view has a skeleton/shimmer loading state
- [ ] No blank white screens during loading
- [ ] No layout shift when data loads (skeleton matches final layout)
- [ ] Loading states match the dark theme

### 8.5 Error States

- [ ] Network error shows user-friendly message (not raw error)
- [ ] 404 page renders correctly
- [ ] API failure shows retry option
- [ ] Form validation errors are clear and visible
- [ ] No unhandled promise rejections in console

### 8.6 Empty States

- [ ] Fund Explorer with no results: helpful message + clear filters CTA
- [ ] Comparison with <2 funds: prompt to add funds
- [ ] Portfolio Builder with no funds: prompt to add or use risk profile
- [ ] Blog with no posts (if applicable): appropriate message

---

## 9. ACCESSIBILITY AUDIT

### 9.1 Keyboard Navigation

- [ ] Tab through entire page — all interactive elements reachable
- [ ] Focus indicator visible on every focusable element
- [ ] Enter/Space activates buttons and links
- [ ] Escape closes modals, command bar, bottom sheets
- [ ] Arrow keys work on sliders (fine control)
- [ ] Mode pills navigable with arrow keys
- [ ] No keyboard traps (can always Tab out of any component)

### 9.2 Screen Reader

- [ ] All images have alt text
- [ ] All icon-only buttons have aria-label
- [ ] Form inputs have associated labels
- [ ] Calculator results announced via aria-live regions
- [ ] Charts have text alternative (aria-label with summary)
- [ ] Page headings follow correct hierarchy (h1 → h2 → h3)
- [ ] No duplicate IDs on the page

### 9.3 Color & Contrast

- [ ] Run axe DevTools or Lighthouse accessibility audit on every page
- [ ] All text passes WCAG AA (4.5:1 for normal text, 3:1 for large text)
- [ ] Information not conveyed by color alone (green/red values also have +/- text)
- [ ] Focus indicators have sufficient contrast

---

## 10. PERFORMANCE AUDIT

### 10.1 Lighthouse Scores

Run Lighthouse on these pages and report scores:

| Page | Performance | Accessibility | Best Practices | SEO |
|------|-------------|---------------|----------------|-----|
| `/` (Homepage) | Target: >90 | Target: >90 | Target: >90 | Target: >90 |
| `/calculators/sip` | Target: >85 | Target: >90 | Target: >90 | Target: >90 |
| `/invest` | Target: >80 | Target: >90 | Target: >90 | Target: >85 |
| `/blog` | Target: >90 | Target: >90 | Target: >90 | Target: >90 |

### 10.2 Bundle Size

```bash
pnpm build
# Check .next/analyze or build output for bundle sizes
```

- [ ] Initial JS bundle < 200KB gzipped
- [ ] No single chunk > 500KB
- [ ] Visx/chart code lazy-loaded (not in initial bundle)
- [ ] Images optimized (using next/image)

### 10.3 Core Web Vitals

- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] No layout shifts when fonts load
- [ ] No layout shifts when images load

### 10.4 API Performance

- [ ] Fund list loads in < 2s
- [ ] Search results appear in < 1s after debounce
- [ ] NAV history loads in < 3s
- [ ] Cached data loads instantly (< 100ms)

---

## 11. SEO AUDIT

- [ ] Every page has unique `<title>` tag
- [ ] Every page has `<meta name="description">` tag
- [ ] Open Graph tags present (og:title, og:description, og:image)
- [ ] Canonical URLs set correctly
- [ ] Sitemap exists at `/sitemap.xml`
- [ ] robots.txt exists and is correct
- [ ] No duplicate content issues
- [ ] Blog posts have structured data (Article schema)
- [ ] Calculator pages have structured data (FAQPage or WebApplication)
- [ ] All internal links use Next.js `<Link>` component (not `<a>`)
- [ ] No orphan pages (every page reachable from navigation)

---

## 12. SECURITY AUDIT

- [ ] No API keys or secrets in client-side code
- [ ] No sensitive data in localStorage (only preferences, cached public API data)
- [ ] Contact form has CSRF protection or rate limiting
- [ ] No XSS vulnerabilities (user input sanitized in search, forms)
- [ ] External API calls use HTTPS
- [ ] No mixed content warnings
- [ ] Content Security Policy headers (if applicable)
- [ ] No `dangerouslySetInnerHTML` with unsanitized user input

---

## 13. CROSS-BROWSER TESTING

Test in:
- [ ] Chrome (latest)
- [ ] Safari (latest) — especially `backdrop-filter` prefix
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Android

Check for:
- [ ] `backdrop-filter` works (Safari needs `-webkit-` prefix)
- [ ] CSS custom properties work
- [ ] Animations smooth in all browsers
- [ ] Fonts load correctly
- [ ] No browser-specific layout issues

---

## 14. PRINT AUDIT

- [ ] Calculator pages print cleanly (check print.css)
- [ ] Charts render in print (or show static fallback)
- [ ] Dark theme doesn't waste ink (print should use light theme or appropriate overrides)
- [ ] No interactive elements in print output
- [ ] Page breaks in sensible places

---

## 15. REPORTING FORMAT

After completing all checks, create a report file at `/Users/manavmht/dad-finance/QA-REPORT.md` with:

```markdown
# QA Audit Report — [Date]

## Summary
- Total issues found: X
- Critical (blocks usage): X
- Major (degrades experience): X
- Minor (cosmetic/polish): X
- Fixed during audit: X
- Remaining: X

## Issues Found & Fixed
### Critical
1. [Description] — [File] — [Fix applied]

### Major
1. [Description] — [File] — [Fix applied]

### Minor
1. [Description] — [File] — [Fix applied]

## Lighthouse Scores
[Table of scores per page]

## Calculator Verification
[Table of test cases with pass/fail]

## Remaining Issues (if any)
[Issues that couldn't be fixed with explanation]
```

---

## 16. FIX EVERYTHING YOU FIND

**This is not a read-only audit.** For every bug you find:

1. Document it in the report
2. Fix it immediately
3. Verify the fix works
4. Move to the next issue

**Priority order for fixes:**
1. Build errors (nothing works if it doesn't build)
2. Calculation errors (wrong math = zero trust)
3. API failures (broken data = broken tool)
4. Navigation/routing bugs (can't reach pages)
5. Responsive layout breaks (unusable on mobile)
6. Visual glitches (looks broken)
7. Accessibility issues
8. Performance issues
9. SEO issues
10. Polish/cosmetic issues

---

*Do not declare the audit complete until every section above has been checked and every found issue has been fixed or documented with a reason why it can't be fixed.*
