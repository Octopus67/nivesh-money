# Fund Cache Scripts

## What it does

The investment tool uses pre-computed mutual fund data from `src/data/fund-cache.json`.
This avoids slow API calls on every page load — funds render instantly.

**Current cache: ~340 funds with real 1Y/3Y/5Y CAGR, AUM, expense ratio, and ratings.**

## Data sources

1. **AMFI NAVAll.txt** (official) — discovers all Direct Growth schemes + ISINs
2. **Kuvera API** (via mf.captnemo.in) — pre-calculated returns, AUM, ratings

## Refresh the cache

```bash
pnpm refresh-funds
```

Takes ~13 minutes (3 seconds per fund, ~250 funds to fetch).
Skips already-cached funds — safe to re-run anytime.

## Automate weekly refresh

```bash
# Cron job — every Sunday at 6 AM
0 6 * * 0 cd /path/to/dad-finance && pnpm refresh-funds >> /tmp/fund-refresh.log 2>&1
```

## How it works

1. Downloads AMFI's official NAV file (all 13,500+ schemes)
2. Filters to ~2,500 Direct Growth plans
3. Picks top funds per SEBI category (by NAV = proxy for fund maturity)
4. Fetches returns from Kuvera API for each (1Y, 3Y, 5Y CAGR + AUM + rating)
5. Saves to `src/data/fund-cache.json`
6. Investment tool reads this JSON at build time — zero API calls on page load

## Force full refresh

To re-fetch ALL funds (even cached ones), delete the cache first:

```bash
rm src/data/fund-cache.json
pnpm refresh-funds
```
