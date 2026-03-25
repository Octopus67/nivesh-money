# Homepage UI Overhaul — Nivesh.money

> **Instructions:** Work through every section in order. Implement all changes. Run `pnpm build` after each major section. Do NOT ask for human input until everything is done.

---

## 1. LOGO REDESIGN (navbar.tsx)

The current logo is just plain bold text: `Nivesh.money`. It looks cheap and generic. Redesign it.

### What to build:

```
[₹ icon/symbol]  Nivesh.money
```

**Option A (recommended): Gradient text + icon mark**

Create an SVG logomark — a simple, modern symbol that represents growth/investment. Ideas:
- A stylized upward arrow made of 2-3 bars (like a mini bar chart going up)
- A simple line chart trending upward inside a rounded square
- The letter "N" stylized with an upward stroke

The logomark should be:
- 28-32px square
- Use the navy-to-emerald gradient (`from-[#1e3a5f] to-[#047857]`)
- Simple enough to work at small sizes

The text "Nivesh.money" next to it:
- "Nivesh" in `font-bold text-[var(--color-navy)]`
- ".money" in `font-medium text-[var(--color-accent-secondary)]` (emerald) — this makes the domain extension part of the brand identity
- Or: the entire "Nivesh.money" in a gradient text (`bg-gradient-to-r from-[#1e3a5f] to-[#047857] bg-clip-text text-transparent`)

**Implementation:**

```tsx
// In navbar.tsx, replace the plain text logo with:
<Link href="/" className="flex items-center gap-2">
  {/* SVG Logomark */}
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    {/* Design a simple growth chart icon or upward arrow bars */}
    {/* Use navy-to-emerald gradient */}
    <defs>
      <linearGradient id="logo-gradient" x1="0" y1="32" x2="32" y2="0">
        <stop offset="0%" stopColor="#1e3a5f" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    {/* 3 bars ascending — simple growth chart */}
    <rect x="4" y="20" width="6" height="8" rx="2" fill="url(#logo-gradient)" opacity="0.5" />
    <rect x="13" y="12" width="6" height="16" rx="2" fill="url(#logo-gradient)" opacity="0.75" />
    <rect x="22" y="4" width="6" height="24" rx="2" fill="url(#logo-gradient)" />
  </svg>

  {/* Brand text */}
  <span className="text-xl font-bold">
    <span className="text-[var(--color-navy)]">Nivesh</span>
    <span className="text-[var(--color-accent-secondary)]">.money</span>
  </span>
</Link>
```

The 3 ascending bars = growth. Simple, recognizable, works at any size. The two-tone text treatment makes "Nivesh" the brand and ".money" the accent.

**Also update:**
- Mobile menu header with the same logo
- Footer logo (if it shows the brand name)
- `print-header.tsx` with the same treatment
- Favicon: create a simple 32x32 favicon using just the 3-bar icon on a white/navy background

---

## 2. HERO SECTION OVERHAUL (hero.tsx)

The hero is currently just text centered on a nearly-invisible background. It feels empty. We need to fill the space with visual elements that communicate "financial growth" without being cheesy.

### Current layout (the problem):
```
[100vh empty space with barely visible gradients]
        [tiny AMFI badge]
        [headline text]
        [subtitle text]
        [two buttons]
[lots of empty space below buttons]
```

### New layout:
```
[Rich background: stronger gradients + dot grid + floating elements]

        [AMFI badge — slightly larger, with glow]

        [Headline — same WordReveal, but with radial glow behind it]

        [Subtitle — same]

        [Inline trust indicators: "15+ Years • 500+ Clients • ₹50Cr+ AUM"]

        [Two CTA buttons — with glow effects]

        [Scroll indicator at bottom]

[LEFT SIDE: Floating glass card with mini chart]
[RIGHT SIDE: Floating glass card with SIP stat]
```

### Specific changes:

**2.1 — Stronger background**

Increase gradient opacity from 7% to 12-15%. The current gradients are invisible on most screens.

```tsx
// Change from opacity 0.07 to 0.12-0.15
// Navy blob (top-left)
<div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-[0.12]
  bg-[radial-gradient(circle,rgba(30,58,95,0.8),transparent_70%)]
  animate-[drift_20s_ease-in-out_infinite]" />

// Emerald blob (bottom-right)
<div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.10]
  bg-[radial-gradient(circle,rgba(4,120,87,0.8),transparent_70%)]
  animate-[drift_25s_ease-in-out_infinite_reverse]" />

// Add a third blob — amber/gold (center-right)
<div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.06]
  bg-[radial-gradient(circle,rgba(217,119,6,0.8),transparent_70%)]
  animate-[drift_30s_ease-in-out_infinite]" />
```

**2.2 — Radial glow behind headline**

Add a subtle radial glow centered behind the headline text:

```tsx
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
  w-[600px] h-[300px] rounded-full opacity-[0.08]
  bg-[radial-gradient(ellipse,rgba(30,58,95,0.6),transparent_70%)]
  pointer-events-none" />
```

**2.3 — Inline trust indicators (NEW — between subtitle and buttons)**

Add a row of trust stats directly in the hero, above the CTA buttons. This fills the empty space AND builds credibility before the user clicks.

```tsx
<div className="flex items-center justify-center gap-6 mt-6 text-sm text-[var(--color-text-secondary)]">
  <div className="flex items-center gap-1.5">
    <Shield className="w-4 h-4 text-[var(--color-accent-secondary)]" />
    <span>15+ Years</span>
  </div>
  <div className="w-1 h-1 rounded-full bg-[var(--color-border-default)]" />
  <div className="flex items-center gap-1.5">
    <Users className="w-4 h-4 text-[var(--color-accent-secondary)]" />
    <span>500+ Clients</span>
  </div>
  <div className="w-1 h-1 rounded-full bg-[var(--color-border-default)]" />
  <div className="flex items-center gap-1.5">
    <TrendingUp className="w-4 h-4 text-[var(--color-accent-secondary)]" />
    <span>₹50Cr+ Managed</span>
  </div>
</div>
```

On mobile: stack vertically or show as 2 rows.

**2.4 — Floating decorative glass cards (desktop only)**

Add 2 small floating glass cards on either side of the hero text. These add visual interest and fill the empty space.

**Left card (floating, slight tilt):**
```tsx
<motion.div
  className="hidden lg:block absolute left-[8%] top-[35%] w-48"
  animate={{ y: [0, -10, 0] }}
  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
>
  <div className="glass-card p-4 rounded-xl shadow-lg rotate-[-3deg]">
    <div className="text-xs text-[var(--color-text-muted)] mb-1">SIP Returns</div>
    <div className="text-lg font-bold text-[var(--color-accent-secondary)]">₹11.8L</div>
    <div className="text-xs text-[var(--color-text-muted)]">from ₹5K/mo × 10 yrs</div>
    {/* Mini sparkline SVG — 3-4 points trending up */}
    <svg className="w-full h-8 mt-2" viewBox="0 0 100 30">
      <polyline points="0,25 25,20 50,15 75,8 100,3"
        fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
</motion.div>
```

**Right card (floating, opposite tilt):**
```tsx
<motion.div
  className="hidden lg:block absolute right-[8%] top-[45%] w-48"
  animate={{ y: [0, 10, 0] }}
  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
>
  <div className="glass-card p-4 rounded-xl shadow-lg rotate-[3deg]">
    <div className="text-xs text-[var(--color-text-muted)] mb-1">Portfolio Growth</div>
    <div className="text-lg font-bold text-[var(--color-navy)]">+14.2%</div>
    <div className="text-xs text-[var(--color-text-muted)]">5Y CAGR (Moderate)</div>
    {/* Mini donut chart — simple SVG circle */}
    <svg className="w-12 h-12 mt-2 mx-auto" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-border-default)" strokeWidth="3" />
      <circle cx="18" cy="18" r="14" fill="none" stroke="#047857" strokeWidth="3"
        strokeDasharray="60 40" strokeLinecap="round" transform="rotate(-90 18 18)" />
    </svg>
  </div>
</motion.div>
```

These cards float gently up and down (5-6s cycle), are slightly tilted, and show real financial data previews. They make the hero feel alive and give visual proof of what the tool does.

**2.5 — Reduce bottom padding**

Change `pb-32` to `pb-20` to reduce the empty space below the buttons.

**2.6 — AMFI badge upgrade**

Make the badge slightly more prominent:
- Add a subtle emerald glow/shadow behind it
- Slightly larger text (text-sm instead of text-xs)
- Add a Shield icon (Lucide) before the text

**2.7 — Button glow effects**

Primary CTA (emerald): add the `.btn-glow` effect from globals.css.
Secondary CTA (outlined): add a fill-on-hover animation (border fills with navy, text turns white).

---

## 3. TRUST BAR ADJUSTMENT (trust-bar.tsx)

Since we added inline trust indicators in the hero (§2.3), the TrustBar below the hero now has duplicate information. Two options:

**Option A (recommended):** Keep the TrustBar but change its stats to be DIFFERENT from the hero inline ones. Hero shows: "15+ Years • 500+ Clients • ₹50Cr+ AUM". TrustBar shows more specific stats:
- "₹5,000 Minimum SIP"
- "0% Advisory Fee"
- "100+ Fund Options"
- "NISM Certified"

**Option B:** Remove the TrustBar entirely since the hero now has trust indicators. This reduces redundancy.

Go with Option A — different stats, complementary information.

---

## 4. HOMEPAGE SECTION ADDITIONS

The current homepage has 6 sections. Add 2 more for a more complete page:

### 4.1 — Testimonials Section (NEW — add after WhyChooseUs)

Add a testimonials/social proof section with 3 client quotes:

```tsx
// Use placeholder testimonials (user will replace with real ones later)
const testimonials = [
  {
    quote: "Nivesh.money helped us plan our retirement with clarity. The SIP calculator alone saved us hours of confusion.",
    name: "Rajesh P.",
    role: "Retired Government Officer",
    location: "Nashik"
  },
  {
    quote: "Finally, a financial advisor who explains things in simple language. Our children's education fund is on track thanks to their guidance.",
    name: "Priya M.",
    role: "School Teacher",
    location: "Pune"
  },
  {
    quote: "I was skeptical about mutual funds, but the team at Nivesh.money made the entire process transparent and stress-free.",
    name: "Amit S.",
    role: "Business Owner",
    location: "Nashik"
  }
];
```

Design: 3 cards in a row (1 column on mobile). Each card:
- Quote text in italics
- Name + role + location below
- Star rating (5 stars, emerald)
- GlassCard with subtle left border accent
- Staggered scroll entrance animation

### 4.2 — FAQ Section (NEW — add after CalculatorPreview, before CTA)

Add 4-5 common questions:

```tsx
const faqs = [
  { q: "What is the minimum amount to start a SIP?", a: "You can start a SIP with as little as ₹500 per month. We help you choose the right funds based on your goals and risk profile." },
  { q: "Is there any advisory fee?", a: "No. As an AMFI-registered mutual fund distributor, we earn a small commission from the fund house. There is zero advisory fee for you." },
  { q: "How do I track my investments?", a: "You'll receive regular portfolio statements. Plus, our investment tool lets you track projections, compare funds, and monitor your portfolio anytime." },
  { q: "Are mutual fund investments safe?", a: "Mutual funds are subject to market risks, but with proper diversification and a long-term approach, they have historically delivered strong returns. We help you choose funds that match your risk tolerance." },
  { q: "Can I withdraw my money anytime?", a: "Most open-ended mutual funds allow withdrawal anytime. Some funds like ELSS have a 3-year lock-in. We'll always explain the terms before you invest." }
];
```

Design: Accordion style (click to expand). Use the existing Accordion component from shadcn/ui. Emerald accent on the expand icon. Smooth height animation.

---

## 5. UPDATED HOMEPAGE SECTION ORDER

After all changes, the homepage should have this order:

```
1. Hero (with floating cards, inline trust, stronger bg)
2. TrustBar (with NEW complementary stats)
3. ServicesGrid (existing — keep as is)
4. WhyChooseUs (existing — keep as is)
5. Testimonials (NEW)
6. CalculatorPreview (existing — keep as is)
7. FAQ (NEW)
8. CTASection (existing — keep as is)
```

Update `src/app/page.tsx` to include the new sections in this order.

---

## 6. SMALL POLISH ITEMS

### 6.1 — CTA Section phone number
Replace `+91 XXXXX XXXXX` with a note: `"Call us for a free consultation"` — or leave the placeholder but make it obvious it needs to be replaced (add a code comment).

### 6.2 — Section dividers
Ensure gradient line dividers exist between ALL sections (the `section-divider` class from globals.css).

### 6.3 — Scroll indicator
Verify the bouncing chevron at the bottom of the hero is visible and fades on scroll.

---

## 7. VERIFICATION

After all changes:

```bash
pnpm build
```

Must pass with 0 errors.

Check:
- [ ] Logo shows icon + two-tone "Nivesh.money" text (not plain text)
- [ ] Logo looks good at navbar size AND mobile
- [ ] Hero background is visibly richer (gradients at 12-15% opacity)
- [ ] Hero has inline trust indicators (15+ Years • 500+ Clients • ₹50Cr+)
- [ ] Hero has floating glass cards on desktop (hidden on mobile)
- [ ] Hero doesn't feel empty anymore
- [ ] TrustBar shows different stats than hero inline indicators
- [ ] Testimonials section renders with 3 cards
- [ ] FAQ section renders with accordion
- [ ] All new sections have scroll entrance animations
- [ ] Section dividers between all sections
- [ ] Mobile responsive — floating cards hidden, trust indicators stack
- [ ] No console errors
- [ ] Animations respect `prefers-reduced-motion`

**Only present to human when ALL checks pass.**
