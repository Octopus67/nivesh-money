# Build the Ultimate Mutual Fund Investment Tool — Complete Specification

> **Instructions for Agent:** Read this ENTIRE file before writing any code. This is a self-contained specification. Do NOT reference external files. Build exactly what is described here.

---

## 0. PROJECT OVERVIEW

Build a single-page, 7-mode mutual fund investment tool embedded in the existing Next.js website. This is the flagship feature — a Bloomberg Terminal meets Apple Design aesthetic. Dark glassmorphism, real-time calculations, premium animations, deeply interactive charts.

**Target user:** Indian retail investor (20-60 years old) who wants to plan SIPs, explore funds, assess risk, and build a portfolio — all in one place.

**The 7 modes:**
1. SIP Calculator — monthly investment → future corpus projection
2. SWP Calculator — corpus → monthly withdrawal sustainability
3. Lump Sum Calculator — one-time investment → future value
4. Risk Profiler — questionnaire → risk score → recommended asset allocation
5. Fund Explorer — browse/filter/search mutual funds by category, risk, performance
6. Fund Comparison — side-by-side comparison of 2-4 funds
7. Portfolio Builder — select funds, allocate %, see combined projections

---

## 0.1 TECH STACK DECISIONS (Non-Negotiable)

| Decision | Choice | Why |
|----------|--------|-----|
| Charts | **Visx** + **Framer Motion** | Robinhood-level interactivity. NOT Recharts (too limited). |
| Command bar | `cmdk` npm package | Linear-style ⌘K palette |
| Animations | **Framer Motion** with spring physics | Premium feel |
| State management | **React Context** for cross-mode state | Risk profile, compare queue, portfolio shared across modes. No Redux/Zustand needed. |
| Persistence | **localStorage** | Saved calculations, risk profile, portfolio, compare queue survive sessions |
| Number animation | **react-spring** (`useSpring`) | countUp effects on result cards |
| API calls | `fetch` with stale-while-revalidate + `AbortController` on navigation | Performance |
| Number formatting | Indian numbering: `Intl.NumberFormat('en-IN')` | ₹1,00,000 not ₹100,000. Use Lakhs/Crores labels. |
| Input fields | `inputMode="decimal"` | NOT `type="number"` — avoids scroll-to-change bugs on mobile |
| Curve interpolation | `curveMonotoneX` from Visx | Smooth chart lines, not jagged |

---

## 1. ARCHITECTURE: Hub-and-Spoke with Command Bar

### 1.1 Layout (3 Persistent Tiers)

```
┌─────────────────────────────────────────────────────┐
│  TIER 1: Command Bar trigger (top-right, always)    │
│  ⌘K / Ctrl+K opens modal. Placeholder: "Search      │
│  funds, switch modes..."                             │
├─────────────────────────────────────────────────────┤
│  Mode Pills (horizontal, below header):              │
│  [💰 SIP] [📤 SWP] [🎯 Lump Sum] [🧠 Risk]         │
│  [🔍 Explore] [⚖️ Compare (2)] [📊 Build]           │
├─────────────────────────────────────────────────────┤
│  TIER 2: Active Mode Canvas (80% viewport)          │
│  Content changes per mode. Crossfade on switch.      │
├─────────────────────────────────────────────────────┤
│  TIER 3: Context Dock (bottom bar, collapsible)      │
│  Risk badge | Compare queue count | Portfolio value  │
│  SEBI disclaimer pinned here                         │
└─────────────────────────────────────────────────────┘
```

### 1.2 Command Bar (⌘K) — using `cmdk` package

- Fuzzy search across: mode names, fund names (from cached fund list), actions ("compare", "export", "reset")
- Results grouped: **Modes**, **Funds**, **Actions**
- Entrance animation: `scale(0.98) → scale(1)` + fade, 150ms, `cubic-bezier(0.16, 1, 0.3, 1)`
- Backdrop: `rgba(0, 0, 0, 0.5)` with 150ms fade
- Keyboard: Arrow keys navigate, Enter selects, Esc closes
- On mobile: triggered by a search icon button in header

### 1.3 Mode Pills

- Horizontal row of pill buttons. Active pill: glassmorphism glow + accent border. Inactive: subtle border only.
- Badge on Compare pill showing queued fund count: `⚖️ Compare (2)`
- On mobile: horizontally scrollable with `scroll-snap-type: x mandatory`. Current mode centered.
- Pill click triggers mode switch with crossfade animation (see Animation System §4)

### 1.4 Context Dock

Persistent bottom bar (64px height). Shows:
- **Risk profile badge** (if completed): "Moderate 🟡" — click to re-take
- **Compare queue**: "2 funds queued" — click to go to Compare mode
- **Portfolio value**: "₹12.4L invested" — click to go to Portfolio Builder
- **SEBI disclaimer**: "Mutual fund investments are subject to market risks. Read all scheme related documents carefully."
- On mobile: collapsed to a floating pill (tap to expand as bottom sheet)

### 1.5 Cross-Mode Shared State (React Context)

```typescript
interface AppState {
  riskProfile: RiskProfile | null;
  compareQueue: FundSummary[];        // Max 4 funds
  portfolio: PortfolioFund[];
  recentCalculations: Calculation[];  // Last 5
  savedCalculations: Calculation[];   // User-bookmarked
}

interface RiskProfile {
  score: number;          // 0-100
  label: string;          // "Conservative" | "Moderately Conservative" | "Moderate" | "Moderately Aggressive" | "Aggressive"
  allocation: { equity: number; debt: number; hybrid: number; gold: number; international: number };
  completedAt: string;    // ISO date
}

interface FundSummary {
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  category: string;
  isin: string;
}

interface PortfolioFund extends FundSummary {
  allocationPercent: number;  // 0-100, all must sum to 100
}

interface Calculation {
  id: string;
  type: 'sip' | 'swp' | 'lumpsum';
  inputs: Record<string, number>;
  results: Record<string, number>;
  savedAt: string;
}
```

### 1.6 Cross-Mode Data Flow

```
Risk Profiler ──→ Fund Explorer (pre-filtered by risk-appropriate categories)
              ──→ Portfolio Builder (pre-allocated by risk profile percentages)

Calculator    ──→ Fund Explorer (via "Find funds with ~X% CAGR →" CTA)

Fund Explorer ──→ Comparison (via "Compare" button on fund cards)
              ──→ Portfolio Builder (via "Add to Portfolio" button)
              ──→ Calculator (via "Calculate SIP with this fund →" in fund detail)

Comparison    ──→ Portfolio Builder (via "Add to portfolio" action)

Portfolio     ──→ Calculator (click any fund to see SIP projection)
```


---

## 2. DATA LAYER — API Integration

### 2.1 Data Sources

| Source | Base URL | Purpose | Auth | CORS | Cache TTL |
|--------|----------|---------|------|------|-----------|
| MFAPI.in | `https://api.mfapi.in` | Fund list, NAV history, search | None | ✅ | Fund list: 24h. NAV per scheme: 6h |
| mf.captnemo.in | `https://mf.captnemo.in/kuvera/{isin}` | AUM, CRISIL rating, expense ratio, returns, fund manager | None | ✅ | 24h per ISIN |

### 2.2 MFAPI.in Endpoints

| Endpoint | Description | Use |
|----------|-------------|-----|
| `GET /mf` | List all schemes (supports `?limit=100&offset=0`) | Initial fund list load |
| `GET /mf/search?q=HDFC` | Search schemes by name | Fund Explorer search |
| `GET /mf/{scheme_code}` | Full NAV history for a scheme | Fund detail charts, CAGR calculation |
| `GET /mf/{scheme_code}/latest` | Latest NAV only | Fund cards |
| `GET /mf/{scheme_code}?startDate=2023-01-01&endDate=2023-12-31` | Historical NAV with date range | Filtered chart views |

### 2.3 Caching Strategy

- **localStorage** with stale-while-revalidate pattern
- Show cached data immediately on load, fetch fresh data in background
- Cache keys: `mf_fund_list`, `mf_nav_{scheme_code}`, `mf_detail_{isin}`
- Show "Data as of [date]" timestamp on all fund data
- If cache is empty (first visit), show skeleton loading states

### 2.4 TypeScript Interfaces for API Data

```typescript
// Raw from MFAPI.in
interface MFAPIScheme {
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  schemeType: string;       // "Open Ended Schemes"
  schemeCategory: string;   // "Equity Scheme - Large Cap Fund"
  isinGrowth: string;
}

interface MFAPINavResponse {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
    isin_growth: string;
  };
  data: Array<{ date: string; nav: string }>; // date: "DD-MM-YYYY", nav: string
  status: string;
}

// Raw from mf.captnemo.in
interface CaptnemoFundDetail {
  aum: number | null;
  expense_ratio: number | null;
  crisil_rating: string | null;
  fund_manager: string | null;
  min_sip: number | null;
  returns: {
    year_1: number | null;
    year_3: number | null;
    year_5: number | null;
    inception: number | null;
  };
}

// Normalized (what components consume)
interface NAVDataPoint {
  date: Date;
  nav: number;
}

interface FundDetail {
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  category: string;
  isin: string;
  aum: number | null;           // In crores
  expenseRatio: number | null;
  rating: number | null;        // 1-5
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
```

### 2.5 Data Normalization Rules

- NAV string → `parseFloat()`. If value is `"N.A."` → `null`
- Date `"DD-MM-YYYY"` → `new Date(year, month - 1, day)`
- All money values stored in rupees internally. Format to Lakhs/Crores only at display layer.
- CAGR calculation: `CAGR = (endNAV / startNAV) ^ (365 / daysDiff) - 1`
- If NAV history < 10 years (new fund): show `"—"` for 10Y return. Show `"Since inception: X.X% (Y years)"` instead.

### 2.6 Error Handling

| Scenario | Behavior |
|----------|----------|
| Network error | Retry 3x with exponential backoff (1s, 2s, 4s). Then show: "Unable to fetch fund data. Check your connection." with "Retry" button. |
| 404 (scheme not found) | "Fund not found. It may have been merged or closed." |
| Rate limited (429) | "Too many requests. Please wait a moment." + disable search input for 30s with countdown. |
| mf.captnemo.in down but MFAPI works | Show MFAPI data only. Hide AUM/rating columns. Show "—" for missing fields. No error banner. |
| Slow network (>3s) | Show skeleton loading immediately. After 5s show: "This is taking longer than usual..." |
| Empty search results | "No funds match '[query]'. Try a different name or check spelling." |
| Partial NAV history | Calculate returns only for available periods. Show "—" for unavailable ones. |


---

## 3. DESIGN SYSTEM

### 3.1 Color Palette

```css
:root {
  /* Backgrounds — blue-tinted darks, NEVER pure black */
  --bg-base: #0A0A0F;
  --bg-surface: #12121A;
  --bg-elevated: #1A1A25;
  --bg-hover: #22222E;

  /* Text — NEVER pure white for body */
  --text-primary: #E8E8ED;
  --text-secondary: #8B8B9E;
  --text-tertiary: #5C5C6F;
  --text-numbers: #F0F0F5;  /* Slightly brighter for financial figures */

  /* Semantic */
  --positive: #00D26A;      /* Gains — NOT pure green */
  --negative: #FF4757;      /* Losses — NOT pure red */
  --warning: #FFA502;
  --info: #3B82F6;
  --accent: #635BFF;        /* Electric indigo — primary accent */
  --accent-light: #8B7FFF;
  --accent-glow: rgba(99, 91, 255, 0.3);

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.16);

  /* Chart palette (6 colors, distinguishable for colorblind users) */
  --chart-1: #635BFF;  /* Indigo */
  --chart-2: #00D4AA;  /* Teal */
  --chart-3: #FF6B6B;  /* Coral */
  --chart-4: #FFA940;  /* Amber */
  --chart-5: #36A2EB;  /* Sky blue */
  --chart-6: #9966FF;  /* Violet */
}
```

### 3.2 Typography

- **UI text:** Inter, 13px base (Linear-style density), `line-height: 1.5`
- **Financial numbers:** JetBrains Mono OR Inter with these properties:
  ```css
  .financial-number {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum";
    letter-spacing: -0.02em;
    font-weight: 600;
  }
  .financial-number .decimal {
    opacity: 0.7;
    font-size: 0.75em;
  }
  ```
- **Hero metrics** (result card main numbers): `font-size: 32px; font-weight: 700`
- **Section headings:** `font-size: 16px; font-weight: 600; color: var(--text-primary)`
- **Labels:** `font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em`

### 3.3 Glassmorphism (Use Sparingly — Max 2-3 Elements Per View)

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* Text readability on glass */
.glass p, .glass span {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Fallback for older browsers */
@supports not (backdrop-filter: blur(12px)) {
  .glass { background: rgba(18, 18, 26, 0.95); }
}
```

**Glassmorphism rules:**
- ✅ Use on: nav bar, mode pills container, command bar modal, Context Dock
- ❌ Do NOT use on: fund cards, data tables, input fields, chart containers
- ✅ Use over gradient/vibrant backgrounds (glass needs something to blur)
- ❌ Never blur >20px (GPU killer)
- ❌ Never background opacity >0.3 or <0.03

### 3.4 Spacing & Layout

- **Base unit:** 4px. Use multiples: 8, 12, 16, 24, 32, 48, 64
- **Max content width:** 1280px (`max-w-7xl mx-auto`). Side margins grow on ultra-wide screens.
- **Border radius:** 16px (glass panels), 12px (cards), 8px (inputs/buttons), 24px (pills)
- **Card padding:** 20px (desktop), 16px (mobile)
- **Grid gap:** 16px between cards

### 3.5 Component Styles

**Cards (fund cards, result cards):**
```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: 20px;
  transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 150ms ease,
              border-color 150ms ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  border-color: var(--border-strong);
}
```

**Buttons:**
```css
/* Primary */
.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: transform 100ms, background 150ms;
}
.btn-primary:hover { background: var(--accent-light); }
.btn-primary:active { transform: scale(0.97); }

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  transition: color 150ms, border-color 150ms, background 150ms;
}
.btn-ghost:hover {
  color: var(--text-primary);
  border-color: var(--border-strong);
  background: var(--bg-hover);
}
.btn-ghost:active { transform: scale(0.97); }
```

**Input fields:**
```css
.input {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 10px 14px;
  color: var(--text-primary);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  transition: border-color 150ms, box-shadow 150ms;
}
.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.input::placeholder { color: var(--text-tertiary); }
```

**Toggle switch:**
```css
.toggle {
  width: 44px; height: 24px;
  background: var(--bg-hover);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 200ms;
}
.toggle.active { background: var(--accent); }
.toggle .thumb {
  width: 20px; height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute; top: 2px; left: 2px;
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
.toggle.active .thumb { transform: translateX(20px); }
```


---

## 4. ANIMATION SYSTEM

### 4.1 Global Easing Curves

```javascript
// Use these EVERYWHERE. Do not invent new curves.
const EASE = {
  out: [0.16, 1, 0.3, 1],                                    // All enter animations
  inOut: [0.65, 0, 0.35, 1],                                  // Repositioning
  spring: { type: "spring", stiffness: 300, damping: 20 },    // General interactions
  springSnappy: { type: "spring", duration: 0.25, bounce: 0.1 }, // Quick feedback
  springHover: { type: "spring", stiffness: 400, damping: 17 },  // Hover effects
};
// RULE: NEVER use ease-in for UI — it starts slow and feels unresponsive.
```

### 4.2 Duration Rules

| Type | Duration | Examples |
|------|----------|---------|
| Micro | 100-150ms | Button hover, input focus ring, toggle switch |
| Standard | 200-300ms | Mode switch crossfade, card entrance, tooltip show |
| Complex | 300-400ms | Risk profiler card advance, bottom sheet open |
| Data | 600ms | Result card number countUp animation |
| Chart | 800ms | Initial chart line drawing, chart data morph |
| **MAX** | **800ms** | **Nothing should EVER take longer than 800ms** |

### 4.3 Specific Animation Specs

**Mode switch (pill click):**
```tsx
// Active canvas exits
<motion.div exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15, ease: EASE.out }}>

// New canvas enters
<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE.out }}>
```

**Calculator slider drag:**
- Chart redraws continuously via `requestAnimationFrame`. NO debounce, NO throttle. Must feel instant.
- Haptic feedback on mobile: `navigator.vibrate(1)` on each step change

**Result card number animation:**
```tsx
import { useSpring, animated } from '@react-spring/web';

const { value } = useSpring({
  value: targetAmount,
  from: { value: previousAmount },
  config: { duration: 600, easing: t => 1 - Math.pow(1 - t, 3) } // ease-out cubic
});

<animated.span>
  {value.to(v => formatINR(v))}
</animated.span>
```

**Risk profiler card advance:**
```tsx
// Current card exits left
<motion.div exit={{ x: -300, opacity: 0 }} transition={{ duration: 0.4, ...EASE.spring }}>

// New card enters from right
<motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, ...EASE.spring }}>
```

**Fund card stagger entrance (Explorer):**
```tsx
const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } } // 50ms between cards
};
const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE.out } }
};
```

**Fund card hover:**
- `translateY(-4px)`, shadow deepens, border brightens
- Duration: 150ms, easing: `EASE.springHover`

**Command bar entrance:**
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.98, y: -4 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.98 }}
  transition={{ duration: 0.15, ease: EASE.out }}
>
```

**Chart initial render (line drawing):**
- SVG path draws from left to right using `strokeDashoffset` animation
- Duration: 800ms, ease-out
- Area gradient fill fades in simultaneously

**Skeleton shimmer (loading states):**
```css
.skeleton {
  background: linear-gradient(90deg,
    var(--bg-surface) 25%,
    var(--bg-hover) 50%,
    var(--bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 4.4 Performance Rules

- Only animate `transform` and `opacity` (GPU-accelerated). NEVER animate `width`, `height`, `margin`, `padding`, `border-width`.
- Use `will-change: transform, opacity` on elements about to animate. Remove after animation completes.
- Max 2-3 elements animating simultaneously.
- `prefers-reduced-motion`: collapse ALL animations to instant state changes. No exceptions.
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

### 4.5 Chart Interactions (Visx)

**Crosshair on hover/touch:**
- Vertical line follows cursor position, snaps to nearest data point
- Crosshair line: 1px solid `rgba(255,255,255,0.3)`, full chart height
- Tooltip: glassmorphic card anchored to crosshair, shows date + exact value
- Tooltip on mobile: anchored to top of chart (not following finger — finger obscures it)
- Crosshair movement: INSTANT (no animation — must track cursor perfectly)

**Time range pills (below chart):**
- `[1M] [3M] [6M] [1Y] [3Y] [5Y] [MAX]`
- Active pill: accent background. Inactive: ghost style.
- Switching range: chart line morphs between states (800ms, ease-out). NOT a hard cut.

**Chart gradient fill:**
```tsx
<LinearGradient id="areaGradient" from={accentColor} to={accentColor} fromOpacity={0.3} toOpacity={0} />
```

**Comparison overlay chart:**
- Multiple fund NAV lines on same axes
- Each line uses a different `--chart-N` color
- Normalized to 100 at start date (so you compare growth, not absolute NAV)
- Legend below chart with fund names + colors


---

## 5. SLIDER COMPONENT SPEC (Used in All Calculators)

Every calculator slider must follow this exact spec. This is the most-touched component — it must feel premium.

### 5.1 Visual Design

```
  ₹5,000          ← Floating tooltip (visible on hover/focus/drag)
     ▼
─────●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ↑ filled (accent gradient)        unfilled (muted) →
     thumb (24px white circle with accent glow ring)
  ·        ·        ·        ·        ·        ·
  ₹500    ₹5K     ₹10K    ₹25K    ₹50K    ₹1L     ← Step marks
```

### 5.2 Thumb Behavior

| State | Visual |
|-------|--------|
| Default | 24px white circle, `box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px var(--accent)` |
| Hover | `scale(1.15)`, glow ring intensifies to 3px |
| Active (dragging) | `scale(1.05)`, `cursor: grabbing` |
| Focus (keyboard) | Same as hover + focus ring `0 0 0 4px var(--accent-glow)` |

### 5.3 Track

- Filled portion: `linear-gradient(90deg, var(--accent), var(--accent-light))`
- Unfilled portion: `rgba(255, 255, 255, 0.08)`
- Height: 6px, border-radius: 3px
- Step marks: 4px dots at key values, `rgba(255, 255, 255, 0.2)`

### 5.4 Floating Tooltip

- Appears above thumb on hover/focus/drag
- Background: `var(--bg-elevated)`, border-radius: 6px, padding: 4px 10px
- Font: 13px, weight 600, `tabular-nums`
- Shows formatted value (e.g., "₹5,000" or "12%")
- Opacity transition: 150ms

### 5.5 Inline Edit

- Click the displayed value (next to slider label) to switch to an input field
- Input auto-focuses, selects all text
- Press Enter or blur to confirm
- Press Escape to cancel
- Validate: clamp to min/max range. If invalid, revert to previous value.
- Show red border + "Must be between ₹500 and ₹10,00,000" if out of range.

### 5.6 Value Snapping

```javascript
// Snap to "nice" financial values for amount sliders
const AMOUNT_STEPS = [500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
const snapToNice = (value, steps) => {
  const nearest = steps.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
  return nearest;
};

// Percentage sliders: snap to 0.25% increments
const snapPercent = (value) => Math.round(value * 4) / 4;
```

### 5.7 Mobile Haptic

```javascript
const handleChange = (newValue) => {
  if (newValue !== prevValue.current && 'vibrate' in navigator) {
    navigator.vibrate(1); // 1ms micro-vibration per step
  }
  prevValue.current = newValue;
  onChange(newValue);
};
```

---

## 6. MODE SPECS

### Mode 1: SIP Calculator

**Layout:** Left panel (40%) inputs, Right panel (60%) chart + results.
**Mobile:** Stacked — inputs top, chart + results bottom.

**Default state (first visit):** Pre-filled with ₹5,000/mo, 10 years, 12% return. Chart already showing projection. User sees value immediately — no empty state.

#### Inputs

| Input | Label | Range | Default | Step | Snap Values |
|-------|-------|-------|---------|------|-------------|
| Monthly SIP | "Monthly investment" | ₹500 – ₹10,00,000 | ₹5,000 | ₹500 | 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000 |
| Duration | "Investment period" | 1 – 40 years | 10 | 1 year | — |
| Return % | "Expected annual return" | 1% – 30% | 12% | 0.25% | — |
| Step-up % | "Annual SIP increase" | 0% – 25% | 0% | 1% | — |

**Return rate guardrail:** If user manually types >30%, show orange warning: "⚠️ Historical equity returns in India average 12-15% long-term. Projections above 30% are unrealistic."

#### Outputs (Right Panel)

**1. Live Area Chart (Visx):**
- Gradient fill: accent at 30% opacity at line → 0% at baseline
- Curve: `curveMonotoneX`
- No gridlines (Robinhood-style minimal). Light Y-axis labels only.
- Time range pills below: `[5Y] [10Y] [20Y] [30Y] [MAX]`
- Crosshair on hover: vertical line + tooltip with year and corpus value
- If step-up >0%: dual lines — flat SIP (dashed, muted) vs step-up SIP (solid, accent)
- If inflation toggle ON: dual lines — nominal (solid) vs real value (dashed, labeled "After inflation")
- Initial render: line draws left-to-right (strokeDashoffset, 800ms)
- Milestone markers: dots on the line at ₹10L, ₹50L, ₹1Cr milestones with labels

**2. Three Result Cards:**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  INVESTED     │ │  RETURNS      │ │  CORPUS       │
│  ₹6,00,000   │ │  ₹5,83,491   │ │  ₹11,83,491  │
│  ██████░░░░   │ │  ░░░░██████   │ │  ██████████   │
└──────────────┘ └──────────────┘ └──────────────┘
```
- Numbers animate with react-spring countUp (600ms, ease-out cubic)
- Small progress bar under each: invested portion vs returns portion
- Corpus card: accent border glow

**3. Toggles:**
- **"Adjust for inflation"** (default OFF). When ON: dual chart lines + result shows "In today's money: ₹X". Default inflation: 6% (editable small input next to toggle).
- **"Show tax impact"** (default OFF). When ON: collapsible section showing LTCG calc:
  - Equity: STCG 20% (<1yr), LTCG 12.5% (>1yr, above ₹1.25L exemption)
  - Shows: "Estimated tax: ₹X | Post-tax corpus: ₹Y"
  - Disclaimer: "Tax calculations are indicative. Consult a tax advisor."

**4. Dynamic Insight Sentence:**
- "At 12% CAGR, your ₹5K/mo SIP grows to ₹11.8L in 10 years — 1.97x your investment"
- If step-up: "With a 10% annual step-up, your corpus jumps to ₹18.2L — 54% more than a flat SIP"

**5. CTAs:**
- "Find funds with ~12% CAGR →" (opens Explorer, pre-filtered)
- "Save this calculation" (bookmarks to localStorage)
- "Share" (generates branded dark-theme image card via canvas-to-image)

**6. What-if Section (collapsible, below results):**
- "What if you started 5 years ago?" — shows comparison line on chart
- "What if you invested ₹10K instead?" — shows second projection line

#### SIP Formula
```
// Without step-up:
FV = P × [((1 + r)^n - 1) / r] × (1 + r)
where P = monthly amount, r = monthly rate (annual/12), n = total months

// With step-up:
For each year Y (0 to totalYears-1):
  monthlyAmount = baseAmount × (1 + stepUpRate)^Y
  Calculate FV for that year's 12 months, compound forward to end
  Sum all years
```

---

### Mode 2: SWP Calculator

**Same layout skeleton as SIP.** Sub-pills at top: `[SIP] [SWP] [Lump Sum]` — active highlighted.

#### Inputs

| Input | Label | Range | Default | Step |
|-------|-------|-------|---------|------|
| Corpus | "Initial investment" | ₹1,00,000 – ₹50,00,00,000 | ₹1,00,00,000 | ₹1,00,000 |
| Withdrawal | "Monthly withdrawal" | ₹1,000 – ₹10,00,000 | ₹50,000 | ₹1,000 |
| Return % | "Expected annual return" | 1% – 20% | 8% | 0.25% |

#### Outputs

- **Depletion curve chart:** Corpus declining over time. Line color transitions: green → amber → red as it approaches zero.
- **Red zone shading** on chart when corpus < 6 months of withdrawals
- **Result cards:** Total Withdrawn | Remaining Corpus (at 30 years or depletion) | Years Until Depleted
- **Warning banner** if unsustainable: "⚠️ At this rate, your corpus depletes in X years. Consider reducing withdrawal to ₹Y/mo for a 30-year horizon."
- **Insight:** "Your ₹1 Cr corpus can sustain ₹50K/mo for 28 years at 8% returns"
- **Safe withdrawal rate indicator:** Green if withdrawal < 4% of corpus annually, amber 4-6%, red >6%

#### SWP Formula
```
For each month:
  corpus = corpus × (1 + monthlyRate) - withdrawal
  If corpus <= 0: record depletion month, stop
```

---

### Mode 3: Lump Sum Calculator

**Same layout skeleton. Sub-pill active on "Lump Sum".**

#### Inputs

| Input | Label | Range | Default | Step |
|-------|-------|-------|---------|------|
| Amount | "Investment amount" | ₹1,000 – ₹50,00,00,000 | ₹1,00,000 | ₹1,000 |
| Duration | "Investment period" | 1 – 40 years | 10 | 1 year |
| Return % | "Expected annual return" | 1% – 30% | 12% | 0.25% |

#### Outputs

- Growth curve chart (exponential, accent gradient fill)
- Result cards: Invested | Returns | Final Value
- Inflation toggle (same as SIP)
- Tax impact toggle (same as SIP)
- **Year-by-year breakdown table** (collapsible): Year | Opening | Returns | Closing
- **Milestone markers** on chart: "₹10L at year 8", "₹1 Cr at year 19"

#### Formula
```
FV = PV × (1 + r)^n
where PV = investment, r = annual rate, n = years
```


---

### Mode 4: Risk Profiler

**Full-canvas card-based questionnaire. Each question = one card, centered. NOT a scrollable form.**

#### Card UI

- Card centered in canvas, `max-width: 600px`
- Question text: 20px, `font-weight: 600`, `color: var(--text-primary)`
- Answer options: large clickable cards (NOT radio buttons). Each = a card with emoji + text.
- Click an option → auto-advance to next question (400ms slide animation)
- Step indicator at top: filled dots. Completed = accent. Current = accent with pulse animation. Upcoming = muted.
- "Back" button (subtle ghost, top-left) to revisit previous question
- Progress bar below dots: fills proportionally

#### Questions (7 Total, Weighted Scoring)

| # | Question | Options (score) | Weight |
|---|----------|-----------------|--------|
| 1 | "What's your age?" | 18-25 (5) / 26-35 (4) / 36-45 (3) / 46-55 (2) / 56+ (1) | 15% |
| 2 | "What's your annual income range?" | <₹5L (1) / ₹5-10L (2) / ₹10-25L (3) / ₹25-50L (4) / ₹50L+ (5) | 10% |
| 3 | "How long do you plan to stay invested?" | <1 year (1) / 1-3 years (2) / 3-5 years (3) / 5-10 years (4) / 10+ years (5) | 25% |
| 4 | "How experienced are you with investing?" | Complete beginner 🌱 (1) / Know the basics 📚 (2) / Invested for years 📈 (4) / I'm a pro 🧠 (5) | 15% |
| 5 | "If your portfolio dropped 20% in a month, you would..." | Sell everything → FD 😰 (1) / Sell some to reduce risk 😟 (2) / Do nothing, wait 😐 (3) / Buy more at lower prices 🤑 (5) | 20% |
| 6 | "What's your primary investment goal?" | Emergency fund 🏥 (1) / Tax saving 🧾 (2) / Child's education 👶 (3) / Wealth creation 💰 (4) / Retirement 🏖️ (4) | 10% |
| 7 | "How many people depend on your income?" | 0 (5) / 1-2 (3) / 3-4 (2) / 5+ (1) | 5% |

#### Scoring

```
weightedScore = Σ (answer_score × weight) for all questions
normalizedScore = (weightedScore / maxPossibleScore) × 100
```

#### Risk Profile Mapping

| Score | Profile | Color | Badge |
|-------|---------|-------|-------|
| 0-20 | Conservative | #3B82F6 (blue) | 🔵 |
| 21-40 | Moderately Conservative | #00D4AA (teal) | 🟢 |
| 41-60 | Moderate | #FFA502 (amber) | 🟡 |
| 61-80 | Moderately Aggressive | #FF6B6B (coral) | 🟠 |
| 81-100 | Aggressive | #FF4757 (red) | 🔴 |

#### Live Risk Meter (Visible During Questionnaire)

- Horizontal gradient bar at bottom of card area: blue → teal → amber → orange → red
- Thumb/indicator animates to current score position as user answers each question
- Score number displayed inside thumb circle
- Smooth spring animation on each answer

#### Result Screen (After All 7 Questions)

- Profile label: large text (24px, bold) with color badge
- **Animated donut chart** showing recommended allocation (draws in with rotation animation):

| Profile | Equity | Debt | Hybrid | Gold | International |
|---------|--------|------|--------|------|---------------|
| Conservative | 15% | 70% | 10% | 5% | 0% |
| Mod Conservative | 30% | 50% | 10% | 5% | 5% |
| Moderate | 50% | 25% | 10% | 10% | 5% |
| Mod Aggressive | 70% | 10% | 10% | 5% | 5% |
| Aggressive | 85% | 0% | 5% | 0% | 10% |

- Recommended fund categories listed below donut (e.g., "Large Cap, Flexi Cap, Index Funds" for Moderate)
- **Investment IQ score:** "Your Investment IQ: 72/100 — Informed Investor" (based on experience + behavioral answers)
- Two CTAs:
  - **"Build This Portfolio →"** (opens Portfolio Builder, pre-fills allocation %)
  - **"Explore Matching Funds →"** (opens Explorer, pre-filtered by risk categories)
- "Retake" button (subtle ghost)
- Profile saved to localStorage + Context Dock badge updates immediately

---

### Mode 5: Fund Explorer

**Layout:** Left sidebar (280px, collapsible on desktop) for filters. Right area for search + fund cards grid.
**Mobile:** Filters in bottom sheet (swipe up to open). Search bar sticky at top.

#### Search Bar (Top of Right Area)

- Full-width input with search icon
- Placeholder: "Search by fund name, AMC, or category..."
- Debounce: 300ms after last keystroke
- Min chars: 2 before triggering search
- API: `GET /mf/search?q={query}` from MFAPI.in
- While typing (before results): "Type a fund name to search..."
- Loading: skeleton cards appear
- No results: "No funds match '[query]'. Try a different name or check spelling." + "Clear search" button

#### Filter Sidebar

| Filter | Type | Options |
|--------|------|---------|
| Category | Multi-select chips | Large Cap, Mid Cap, Small Cap, Flexi Cap, Multi Cap, ELSS, Sectoral/Thematic, Index Funds, Aggressive Hybrid, BAF/Dynamic, Conservative Hybrid, Multi-Asset, Liquid, Short Duration, Corporate Bond, Gilt, International |
| Risk Level | Single-select radio | Low, Low-Moderate, Moderate, Moderately High, High, Very High |
| Fund House | Searchable dropdown, multi-select | HDFC, ICICI Prudential, SBI, Axis, Kotak, Nippon India, Aditya Birla, UTI, DSP, Tata, Mirae Asset, Motilal Oswal, PPFAS, Quant, Others |
| Min Rating | Star selector (click star) | ≥1★, ≥2★, ≥3★, ≥4★, ≥5★ |
| Sort By | Dropdown | 3Y Return (default), 1Y Return, 5Y Return, 10Y Return, AUM (high→low), Expense Ratio (low→high) |

**If risk profile exists:** Filters auto-set to match profile categories. Banner: "Showing funds matching your [Moderate] risk profile [Change] [Clear filters]"

**"Clear all filters" button** always visible when any filter is active.

#### Fund Card Design

```
┌─────────────────────────────────────────┐
│  HDFC Top 100 Fund - Direct Growth      │  ← 14px, weight 600, text-primary
│  Large Cap · ★★★★☆ · High              │  ← 12px, text-secondary
├─────────────────────────────────────────┤
│  1Y  ████████████████████  +24.3%       │  ← Horizontal proportional bars
│  3Y  ██████████████        +18.1%       │     Green = positive, Red = negative
│  5Y  ████████████████      +20.5%       │     "—" if data unavailable
│  10Y ██████████████        +16.8%       │     Monospace numbers, right-aligned
├─────────────────────────────────────────┤
│  AUM: ₹42,380 Cr    ER: 1.21%          │  ← 11px, text-secondary
│  NAV: ₹892.45       Min SIP: ₹500      │
├─────────────────────────────────────────┤
│  [⚖️ Compare]    [📊 Add to Portfolio]   │  ← Ghost buttons
└─────────────────────────────────────────┘
```

- Card style: `bg-surface`, `border-default`, `border-radius: 12px`
- Hover: `translateY(-4px)`, shadow deepens, border → `border-strong`
- CAGR bars: proportional width relative to max value in visible set
- "Compare" button: shows ✓ checkmark when fund is in compare queue. Click toggles.
- "Add to Portfolio": adds fund to Portfolio Builder with 0% allocation
- Grid: 3 columns desktop, 2 tablet, 1 mobile. Gap: 16px.
- **Infinite scroll** with intersection observer. Load 20 funds per batch.
- **Stagger-fade entrance:** each card fades in with 50ms offset on load/filter change.

#### Fund Detail (Click Card to Expand)

Opens as **side panel** on desktop (slides in from right, 480px wide) or **bottom sheet** on mobile.

Contents:
- Fund name + category + rating (header)
- **NAV history chart** (Visx area chart):
  - Time range pills: `[1M] [3M] [6M] [1Y] [3Y] [5Y] [MAX]`
  - Crosshair + tooltip on hover
  - Gradient fill
- **Returns table:**
  | Period | Return |
  |--------|--------|
  | 1 Week | +1.2% |
  | 1 Month | +3.4% |
  | 3 Months | +8.1% |
  | 6 Months | +14.2% |
  | 1 Year | +24.3% |
  | 3 Years | +18.1% |
  | 5 Years | +20.5% |
  | 10 Years | +16.8% |
  | Since Inception | +15.2% (12 years) |
- **Fund info grid:** AUM, NAV, Expense Ratio, Fund Manager, Inception Date, Min SIP, Min Lump Sum, Exit Load, SEBI Category
- **CTA:** "Calculate SIP with this fund →" (opens SIP calculator with return % pre-filled from fund's 5Y CAGR)

#### Loading State
- Skeleton cards: 3×grid of card-shaped rectangles with shimmer animation
- Each skeleton has: title line (60% width), subtitle line (40%), 4 bar lines, 2 info lines, 2 button shapes

#### Empty State
- Illustration: simple line-art magnifying glass (CSS/SVG, no image file)
- "No funds match your filters"
- "Try broadening your search or clearing some filters"
- [Clear all filters] button


---

### Mode 6: Fund Comparison

**Entry points:** "Compare" button on fund cards in Explorer, or command bar search ("compare HDFC Top 100 vs Axis Bluechip").

#### Layout

**Top:** Sticky header row with:
- Fund names (max 4 columns) + "✕" remove button on each
- "+ Add Fund" button (opens a search popover/modal)
- Toggle: `[📊 Table] [📈 Chart]` view switcher

**If <2 funds selected:** Show prompt: "Add at least 2 funds to compare. Search above or add from Fund Explorer."

#### Table View

Grouped rows with collapsible section headers:

**Returns Section:**
| Metric | Fund 1 | Fund 2 | Fund 3 | Fund 4 |
|--------|--------|--------|--------|--------|
| 1Y Return | +24.3% | +21.1% | +19.8% | — |
| 3Y Return | +18.1% ✨ | +16.4% | +17.2% | — |
| 5Y Return | +20.5% ✨ | +18.9% | +19.1% | — |
| 10Y Return | +16.8% | +17.2% ✨ | — | — |
| Since Inception | +15.2% | +14.8% | +16.1% ✨ | — |

**Cost Section:**
| Expense Ratio | 1.21% | 0.98% ✨ | 1.45% | — |
| Exit Load | 1% (<1yr) | 1% (<1yr) | Nil ✨ | — |

**Info Section:**
| AUM | ₹42,380 Cr | ₹28,100 Cr | ₹15,200 Cr | — |
| NAV | ₹892.45 | ₹456.78 | ₹234.56 | — |
| Inception | 2003 | 2010 | 2018 | — |
| Fund Manager | Name A | Name B | Name C | — |
| Min SIP | ₹500 | ₹500 | ₹100 | — |
| Category | Large Cap | Large Cap | Flexi Cap | — |

**Winner highlighting:** Best value in each row gets:
- Subtle accent background: `rgba(99, 91, 255, 0.1)`
- "✨ Best" micro-badge (small pill, accent color)

**Table styling:**
- Sticky first column (metric names) on horizontal scroll
- Row height: 44px
- Alternating row backgrounds: `bg-surface` / `bg-base`
- Section headers: collapsible, `text-secondary`, uppercase, 11px

#### Chart View

- **Overlay NAV chart:** All selected funds' NAV lines on same axes
- **Normalized to 100** at the start date (so you compare growth rate, not absolute NAV)
- Each line: different `--chart-N` color, 2px stroke
- Legend below chart: fund name + color swatch + current value
- Time range pills: `[1M] [3M] [6M] [1Y] [3Y] [5Y] [MAX]`
- Crosshair shows all fund values at that date in tooltip

#### Mobile Layout

- Swipeable card stack: one fund visible at a time, swipe left/right to see others
- Comparison metrics shown as a vertical list per fund
- "Compare" button at bottom opens a side-by-side overlay for 2 funds

---

### Mode 7: Portfolio Builder

**The most complex mode. Three-panel layout on desktop, 3-step wizard on mobile.**

#### Desktop Layout

```
┌──────────────────┬────────────────────────┬──────────────────┐
│  FUND PICKER      │  ALLOCATION CANVAS     │  PROJECTIONS     │
│  (280px)          │  (flexible)            │  (360px)         │
│                   │                        │                  │
│  Search input     │  Fund allocation bars  │  Combined growth │
│  ─────────────    │  ┌────────────────┐    │  chart (area)    │
│  Recent funds     │  │ HDFC Top 100   │    │                  │
│  Risk-matched     │  │ ████████ 40%   │    │  Donut chart     │
│  funds            │  └────────────────┘    │  (allocation)    │
│                   │  ┌────────────────┐    │                  │
│  Click to add →   │  │ Axis Bluechip  │    │  Blended CAGR:   │
│                   │  │ █████ 25%      │    │  14.2% (est)     │
│                   │  └────────────────┘    │                  │
│                   │  ┌────────────────┐    │  Risk score:     │
│                   │  │ SBI Small Cap  │    │  Moderate 🟡     │
│                   │  │ ███████ 35%    │    │                  │
│                   │  └────────────────┘    │  SIP/Lump toggle │
│                   │                        │  for projection   │
│                   │  Total: 100% ✓         │                  │
│                   │  [Auto-rebalance]      │                  │
└──────────────────┴────────────────────────┴──────────────────┘
```

#### Left Panel: Fund Picker

- Search input (same as Explorer search, debounced)
- **"Recommended" section** (if risk profile exists): shows 5-6 funds matching risk profile
- **"Recently viewed" section:** last 5 funds the user interacted with
- Click a fund → adds to Allocation Canvas with 0% allocation
- Max 15 funds. After 15: "Remove a fund to add more. Diversification beyond 15 funds has diminishing returns."

#### Center Panel: Allocation Canvas

- Each fund = a row with:
  - Fund name + category (truncated)
  - Editable percentage input (number field, `inputMode="decimal"`)
  - Horizontal bar showing proportion (accent gradient, proportional to %)
  - "✕" remove button
- **Total indicator** at bottom: "Total: 85%" — turns green ✓ at exactly 100%, red ✗ if over
- **Auto-rebalance toggle:** When ON, adjusting one fund auto-adjusts others proportionally to maintain 100%
- **Donut chart** (small, inline) showing allocation by category (Equity/Debt/Hybrid/etc.)
- If risk profile exists: "Suggested allocation" button generates a model portfolio

#### Right Panel: Projections

- **Combined growth chart** (Visx stacked area): shows portfolio growth over time
  - Each fund's contribution shown as a stacked layer (different chart colors)
  - Total line on top
- **Toggle:** SIP mode (monthly investment) vs Lump Sum mode (one-time)
  - SIP: input for monthly amount (default ₹10,000)
  - Lump Sum: input for one-time amount (default ₹1,00,000)
  - Duration slider: 1-30 years (default 10)
- **Blended metrics:**
  - Weighted CAGR (based on each fund's historical returns × allocation %)
  - Weighted expense ratio
  - Portfolio risk score (based on category mix)
- **Expected corpus** with countUp animation
- **Confidence range:** "Expected: ₹18-24L (based on 5Y historical returns)"

#### Mobile Layout: 3-Step Wizard

1. **Step 1: Pick Funds** — search + add funds (full screen)
2. **Step 2: Allocate** — set percentages with sliders (full screen)
3. **Step 3: Project** — see charts and results (full screen)
- Bottom nav: `[← Back] [Step 1/3] [Next →]`
- Swipe between steps

#### Empty State (No Funds Added)

- "Start building your portfolio"
- "Add funds from the search above, or let us suggest based on your risk profile"
- If risk profile exists: [Build suggested portfolio] button (auto-adds recommended funds with allocation)
- If no risk profile: [Take risk assessment first →] button

#### Save/Export

- "Save portfolio" → localStorage with name (user-provided)
- "Export as PDF" → generates clean report with allocation table, projection chart, fund details
- "Share" → generates shareable URL with fund codes + allocations encoded in query params


---

## 7. ONBOARDING — First-Time User Experience

When a user visits the tool for the first time (no localStorage data):

1. **Default mode: SIP Calculator** — most familiar, lowest barrier to entry
2. **Pre-filled with sensible defaults:** ₹5,000/mo, 10 years, 12% return. Chart already showing a projection. User sees value immediately — NO empty screen.
3. **Subtle pulsing dot** on Risk Profiler pill: "New here? Start with your risk profile →" (tooltip, dismissible, shown once via localStorage flag)
4. **Context Dock message:** "Complete your risk profile for personalized fund recommendations"
5. **NO modal, NO wizard, NO blocking onboarding.** Let them explore freely. The tool should be self-explanatory.

---

## 8. MOBILE RESPONSIVENESS

**Breakpoints:** 1280px (desktop), 768px (tablet), 480px (mobile)

| Component | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| Command bar | Full width with suggestions dropdown | Full width, compact | Search icon → full-screen overlay |
| Mode pills | All 7 visible in row | All visible, smaller text | Horizontally scrollable, scroll-snap |
| Calculator layout | Side-by-side (40/60 split) | Stacked (inputs top, chart bottom) | Stacked, full-width sliders |
| Explorer layout | Sidebar (280px) + 3-col grid | Filter drawer (hamburger) + 2-col grid | Bottom sheet filters + 1-col cards |
| Comparison | Side-by-side columns (2-4) | Horizontal scroll table | Swipeable card stack |
| Portfolio Builder | 3-panel layout | 2-panel (picker collapses to search bar) | 3-step wizard with bottom nav |
| Context Dock | Persistent bottom bar (64px) | Persistent bottom bar | Floating pill (tap to expand) |
| Fund detail | Side panel (480px, slides from right) | Side panel (full width) | Bottom sheet (drag up to expand) |
| Charts | Full width within panel | Full width | Full width, min-height 200px |

**Mobile-specific rules:**
- Touch targets: minimum 44×44px for all interactive elements
- Sliders: full-width, larger thumb (28px visual, 48px touch target)
- Charts: tooltip anchored to top of chart (not following finger)
- Fund cards: swipe-left gesture hint on first visit to reveal "Compare" action
- Bottom sheets: drag handle at top, drag down to dismiss
- `inputMode="decimal"` on all number inputs (shows numeric keyboard)
- No hover states on mobile — use active/pressed states instead

---

## 9. ACCESSIBILITY

### 9.1 Contrast & Color

- Minimum 4.5:1 contrast ratio for all text on dark backgrounds
- Green (#00D26A) on dark bg: verify contrast. If insufficient, use brighter variant.
- Red (#FF4757) on dark bg: verify contrast.
- **High-contrast toggle** in settings/footer: increases all text to `#FFFFFF`, borders to `rgba(255,255,255,0.3)`
- Never convey information by color alone — always pair with text/icon (e.g., "+24.3%" text alongside green bar)

### 9.2 Keyboard Navigation

- All modes navigable via Tab key
- Mode pills: arrow keys to switch between modes
- Sliders: arrow keys for fine control (1 step), Page Up/Down for large jumps (10 steps)
- Fund cards: Enter to expand detail, Space to toggle Compare
- Command bar: ⌘K to open, Esc to close, arrows to navigate results
- Focus visible: `box-shadow: 0 0 0 3px var(--accent-glow)` on all focusable elements
- Skip-to-content link for screen readers

### 9.3 Screen Reader Support

- `aria-live="polite"` on result card numbers (announces new values when calculations update)
- `aria-label` on all icon-only buttons
- Chart: provide `aria-label` with text summary ("SIP projection chart showing corpus growth from ₹0 to ₹11.8 lakhs over 10 years")
- Risk profiler: announce question number and total ("Question 3 of 7")
- Fund cards: meaningful `aria-label` ("HDFC Top 100 Fund, Large Cap, 4 stars, 3-year return 18.1%")

### 9.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
- Charts: show final state immediately, no line-drawing animation
- Mode switch: instant swap, no crossfade
- Number countUp: show final number immediately

---

## 10. PERFORMANCE

### 10.1 Code Splitting

- Each mode is a **lazy-loaded** component: `React.lazy(() => import('./modes/SIPCalculator'))`
- Visx chart components: lazy-loaded per mode (don't load chart code until mode is activated)
- `cmdk` package: lazy-loaded (only when ⌘K is pressed)
- Suspense fallback: skeleton of the mode's layout

### 10.2 Chart Performance

- Visx renders SVG — fine for <1000 data points (typical NAV history)
- For 5Y+ NAV data (1000+ points): downsample to 1 point per week for display, full data for calculations
- Use `requestAnimationFrame` for slider-driven chart updates
- Debounce API calls on search (300ms), but NEVER debounce slider → chart updates

### 10.3 API Optimization

- **Batch fund list load:** Fetch top 100 popular funds on first visit, cache for 24h
- **Lazy enrichment:** Only fetch mf.captnemo.in data when fund card is visible (intersection observer)
- **AbortController:** Cancel in-flight requests when user navigates away from a mode
- **Stale-while-revalidate:** Show cached data instantly, refresh in background

### 10.4 Bundle Size

- Tree-shake Visx (import only needed modules: `@visx/shape`, `@visx/scale`, `@visx/gradient`, `@visx/event`, `@visx/curve`)
- Don't import all of Framer Motion — use `motion` and `AnimatePresence` only
- Target: <200KB gzipped for initial load (excluding lazy-loaded modes)

---

## 11. EDGE CASES

| Scenario | Handling |
|----------|----------|
| User enters ₹0 | Slider min prevents this. Manual input: show "Amount must be at least ₹500" with red border. |
| Negative numbers | Reject. Show "Amount must be positive" with red border. |
| Return rate >30% | Allow but show orange warning (see §6 Mode 1). |
| Return rate = 0% | Allow. Chart shows flat line. Insight: "At 0% return, your money doesn't grow." |
| Fund has no 10Y data | Show "—" for 10Y. Show "Since inception: X.X% (Y years)" instead. |
| Fund has no rating (captnemo down) | Show "—" for rating. Don't show star selector. |
| Compare with <2 funds | Show prompt: "Add at least 2 funds to compare." |
| Compare with funds from different time periods | Normalize chart to start from the latest fund's inception date. Note: "Comparison starts from [date] (earliest common date)." |
| Portfolio allocations don't sum to 100% | Show red indicator: "Total: 85% — must equal 100%". Disable projection chart until 100%. |
| Portfolio with >15 funds | Block adding: "Remove a fund to add more." |
| Ultra-wide screen (3440px+) | Content capped at 1280px (`max-w-7xl mx-auto`). Side margins grow. |
| Very small screen (<360px) | Mode pills: show only icons, no text. Cards: single column, reduced padding. |
| Offline / no network | Show last cached data with banner: "You're offline. Showing cached data from [date]." Calculators still work (client-side math). |
| localStorage full | Graceful degradation: tool works without persistence. Show subtle warning: "Unable to save. Clear browser storage for full functionality." |
| API returns malformed data | Validate all API responses. If NAV is not a valid number, skip that data point. Never crash. |

---

## 12. BUILD ORDER (Dependency Chain)

Build in this exact order. Do NOT start a later phase until the previous one is complete and working.

```
Phase 1: Foundation
├── Design tokens (CSS variables, fonts, base styles)
├── Shared components (Button, Card, Input, Toggle, Slider, Skeleton)
├── App layout (3-tier: header + canvas + dock)
├── Mode pill navigation (switching between modes)
└── React Context (AppState provider)

Phase 2: Calculators (no API dependency)
├── Calculator math functions (pure functions, testable)
│   ├── sipCalculate(amount, years, rate, stepUp) → { invested, returns, corpus, yearlyData[] }
│   ├── swpCalculate(corpus, withdrawal, rate) → { totalWithdrawn, remaining, depletionYear, monthlyData[] }
│   └── lumpSumCalculate(amount, years, rate) → { invested, returns, finalValue, yearlyData[] }
├── Slider component (full spec from §5)
├── SIP Calculator mode (inputs + chart + results)
├── SWP Calculator mode
└── Lump Sum Calculator mode

Phase 3: Risk Profiler (no API dependency)
├── Question card component
├── Scoring engine
├── Result screen with donut chart
└── localStorage persistence + Context Dock integration

Phase 4: API Layer
├── MFAPI.in client (fetch, cache, normalize)
├── mf.captnemo.in client (fetch, cache, normalize)
├── Error handling + retry logic
├── Stale-while-revalidate pattern
└── TypeScript interfaces

Phase 5: Fund Explorer (depends on Phase 4)
├── Search bar with debounced API calls
├── Filter sidebar
├── Fund card component
├── Fund detail panel/sheet
├── Infinite scroll
└── Integration with Risk Profiler (pre-filtering)

Phase 6: Fund Comparison (depends on Phase 4 + 5)
├── Compare queue management (Context)
├── Comparison table
├── Overlay NAV chart
└── Winner highlighting

Phase 7: Portfolio Builder (depends on Phase 4 + 5 + 3)
├── Fund picker panel
├── Allocation canvas
├── Projection panel with combined chart
├── Save/export functionality
└── Risk profile integration

Phase 8: Polish
├── Command bar (⌘K) with cmdk
├── All animations refined
├── Mobile responsiveness pass
├── Accessibility audit
├── Performance optimization (lazy loading, code splitting)
├── Edge case handling
└── Final visual polish
```

---

## 13. MANDATORY REQUIREMENTS CHECKLIST

Before declaring this feature complete, ALL of these must be true:

- [ ] All 7 modes functional and navigable
- [ ] All 3 calculators produce correct results (verify with manual calculation)
- [ ] Risk profiler scoring matches the mapping table exactly
- [ ] Fund Explorer loads real data from MFAPI.in
- [ ] Fund cards show enriched data from mf.captnemo.in (AUM, rating, ER)
- [ ] Fund Comparison works with 2-4 funds side by side
- [ ] Portfolio Builder allocations sum to 100% with validation
- [ ] Command bar (⌘K) searches across modes and funds
- [ ] Context Dock shows risk badge, compare count, portfolio value
- [ ] Cross-mode navigation works (all CTAs link correctly between modes)
- [ ] All charts interactive (crosshair, tooltips, time range pills)
- [ ] Indian number formatting everywhere (₹1,00,000)
- [ ] Skeleton loading states for all API-dependent views
- [ ] Error states for all failure scenarios (network, 404, rate limit)
- [ ] Empty states for all modes (no blank screens ever)
- [ ] Mobile responsive at 480px, 768px, 1280px breakpoints
- [ ] Keyboard navigable (Tab through all interactive elements)
- [ ] `prefers-reduced-motion` respected
- [ ] SEBI disclaimer visible in Context Dock
- [ ] localStorage persistence working (risk profile, portfolio, saved calcs)
- [ ] No TypeScript errors, no console errors
- [ ] Animations smooth at 60fps (check with Chrome DevTools Performance tab)

---

## 14. SEBI DISCLAIMER (Required)

Pin this in the Context Dock, always visible:

> "Mutual fund investments are subject to market risks. Read all scheme related documents carefully. Past performance is not indicative of future returns. This tool is for informational purposes only and does not constitute financial advice."

---

*End of specification. Build exactly this. No shortcuts, no skipped modes, no placeholder implementations.*
