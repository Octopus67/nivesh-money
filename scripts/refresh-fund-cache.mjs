#!/usr/bin/env node

/**
 * Fund Cache Refresh Script v3 — Dynamic Discovery via AMFI + Kuvera
 * 
 * Strategy:
 * 1. Download AMFI NAVAll.txt (official, has ALL 13,500+ schemes)
 * 2. Parse it to find ALL "Direct Growth" schemes, grouped by SEBI category
 * 3. Pick top funds per category (by NAV age = established funds)
 * 4. Fetch pre-calculated returns from Kuvera API for each
 * 5. Write to src/data/fund-cache.json
 * 
 * Target: 300+ funds across all SEBI categories
 * Rate: 1 call per 3 seconds (~15 minutes for 300 funds)
 * Schedule: Run weekly via cron
 * 
 * Usage: node scripts/refresh-fund-cache.mjs
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '../src/data/fund-cache.json');

const KUVERA_API = 'https://mf.captnemo.in/kuvera';
const AMFI_NAV_URL = 'https://portal.amfiindia.com/spages/NAVAll.txt';
const DELAY_MS = 3000;   // 3 seconds between Kuvera calls
const RETRY_DELAY = 10000; // 10 seconds between retries
const MAX_RETRIES = 3;
const TARGET_FUNDS = 1100; // aim for 1100, expect ~1000 after Kuvera misses

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// How many funds to pick per SEBI category
const CATEGORY_LIMITS = {
  // Equity
  'Large Cap Fund': 25,
  'Mid Cap Fund': 25,
  'Small Cap Fund': 25,
  'Flexi Cap Fund': 25,
  'Multi Cap Fund': 20,
  'Large & Mid Cap Fund': 20,
  'ELSS': 25,
  'Value Fund': 15,
  'Contra Fund': 10,
  'Focused Fund': 20,
  'Dividend Yield Fund': 12,
  'Sectoral/Thematic': 200,

  // Index
  'Index Funds': 80,
  'Index Fund': 80,

  // Debt
  'Short Duration Fund': 20,
  'Corporate Bond Fund': 15,
  'Banking and PSU Fund': 15,
  'Gilt Fund': 12,
  'Dynamic Bond': 12,
  'Low Duration Fund': 12,
  'Medium Duration Fund': 10,
  'Medium to Long Duration Fund': 10,
  'Long Duration Fund': 8,
  'Credit Risk Fund': 10,
  'Liquid Fund': 20,
  'Ultra Short Duration Fund': 12,
  'Money Market Fund': 10,
  'Overnight Fund': 8,
  'Floater Fund': 8,

  // Hybrid
  'Aggressive Hybrid Fund': 15,
  'Dynamic Asset Allocation': 20,
  'Balanced Advantage': 20,
  'Conservative Hybrid Fund': 12,
  'Equity Savings': 10,
  'Multi Asset Allocation': 15,
  'Arbitrage Fund': 12,

  // Others
  'Fund of Funds': 20,
  'FoF Overseas': 40,
  'FoF Domestic': 30,
  'Gold': 10,
  'Retirement Fund': 10,
  'Children\'s Fund': 8,
  'Solution Oriented': 10,
};

const DEFAULT_LIMIT = 20; // for categories not in the map

// ============================================================
// Step 1: Parse AMFI NAVAll.txt
// ============================================================

async function parseAMFIFile() {
  console.log('📥 Downloading AMFI NAVAll.txt...');
  const res = await fetch(AMFI_NAV_URL, { redirect: 'follow' });
  if (!res.ok) throw new Error(`AMFI download failed: ${res.status}`);
  const text = await res.text();
  const lines = text.split('\n');

  console.log(`   ${lines.length} lines downloaded`);

  let currentCategory = '';
  let currentFundHouse = '';
  const allFunds = [];

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r/g, '').trim();
    if (!line) continue;

    // Category header: "Open Ended Schemes(Equity Scheme - Large Cap Fund)"
    const catMatch = line.match(/^Open Ended Schemes\((.+)\)$/);
    if (catMatch) {
      currentCategory = catMatch[1].trim();
      continue;
    }

    // Close ended / interval — skip
    if (line.startsWith('Close Ended') || line.startsWith('Interval')) {
      currentCategory = '';
      continue;
    }

    // Fund house header (no semicolons, not a data line)
    if (!line.includes(';') && line.length > 3) {
      currentFundHouse = line.trim();
      continue;
    }

    // Data line: schemeCode;ISIN_Growth;ISIN_Reinvest;SchemeName;NAV;Date
    const parts = line.split(';');
    if (parts.length < 5) continue;

    const schemeCode = parseInt(parts[0].trim(), 10);
    const isin = parts[1]?.trim();
    const schemeName = parts[3]?.trim();
    const nav = parseFloat(parts[4]);

    if (!schemeCode || !schemeName) continue;

    // Only Direct Growth plans
    const nameLower = schemeName.toLowerCase();
    const isDirect = nameLower.includes('direct');
    const isGrowth = nameLower.includes('growth');
    const isIDCW = nameLower.includes('idcw') || nameLower.includes('dividend');
    const isBonus = nameLower.includes('bonus');

    if (!isDirect || !isGrowth || isIDCW || isBonus) continue;
    if (!isin || !isin.startsWith('INF')) continue;

    allFunds.push({
      schemeCode,
      isin,
      schemeName,
      fundHouse: currentFundHouse,
      category: currentCategory,
      nav: isNaN(nav) ? 0 : nav,
    });
  }

  console.log(`   ${allFunds.length} Direct Growth schemes found\n`);
  return allFunds;
}

// ============================================================
// Step 2: Select top funds per category
// ============================================================

function selectTopFunds(allFunds, target) {
  // Group by category
  const byCategory = {};
  for (const f of allFunds) {
    const cat = f.category;
    if (!cat) continue;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(f);
  }

  // For each category, pick top N by NAV (higher NAV = older/more established fund)
  const selected = [];
  const categoryStats = [];

  for (const [cat, funds] of Object.entries(byCategory)) {
    // Find matching limit
    let limit = DEFAULT_LIMIT;
    const catNorm = cat.toLowerCase().replace(/\s+/g, ' ');
    for (const [key, val] of Object.entries(CATEGORY_LIMITS)) {
      const keyNorm = key.toLowerCase().replace(/\s+/g, ' ');
      if (catNorm.includes(keyNorm) || catNorm.replace(/[^a-z]/g, '').includes(keyNorm.replace(/[^a-z]/g, ''))) {
        limit = val;
        break;
      }
    }

    // Sort by NAV descending (proxy for fund age/establishment)
    // Deduplicate by fund house (max 2 per AMC per category)
    const sorted = funds.sort((a, b) => b.nav - a.nav);
    const picked = [];
    const amcCount = {};

    for (const f of sorted) {
      const amc = f.fundHouse;
      amcCount[amc] = (amcCount[amc] || 0) + 1;
      if (amcCount[amc] > 8) continue; // max 8 per AMC per category
      picked.push(f);
      if (picked.length >= limit) break;
    }

    selected.push(...picked);
    categoryStats.push({ cat, available: funds.length, picked: picked.length, limit });
  }

  // Log category breakdown
  console.log('📊 Category breakdown:');
  categoryStats
    .sort((a, b) => b.picked - a.picked)
    .forEach(({ cat, available, picked, limit }) => {
      console.log(`   ${String(picked).padStart(3)}/${String(limit).padStart(3)} from ${cat} (${available} available)`);
    });
  console.log(`\n   Total selected: ${selected.length}\n`);

  return selected;
}

// ============================================================
// Step 3: Fetch from Kuvera
// ============================================================

async function fetchKuvera(isin) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${KUVERA_API}/${isin}`);
      if (res.status === 404) return null; // Fund not on Kuvera
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const fund = Array.isArray(data) ? data[0] : data;
      if (!fund || !fund.returns) return null;
      return fund;
    } catch (e) {
      if (attempt < MAX_RETRIES - 1) {
        console.log(`  ⏳ Retry ${attempt + 1}/${MAX_RETRIES} in 10s...`);
        await sleep(RETRY_DELAY);
      } else {
        throw e;
      }
    }
  }
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('🚀 Fund Cache Refresh v3 — Dynamic Discovery\n');

  // Load existing cache
  let existingFunds = {};
  if (existsSync(OUTPUT)) {
    try {
      const existing = JSON.parse(readFileSync(OUTPUT, 'utf-8'));
      existingFunds = existing.funds || {};
      console.log(`📦 Existing cache: ${Object.keys(existingFunds).length} funds\n`);
    } catch { /* start fresh */ }
  }

  // Step 1: Parse AMFI
  const allFunds = await parseAMFIFile();

  // Step 2: Select top funds
  const selected = selectTopFunds(allFunds, TARGET_FUNDS);

  // Step 3: Fetch from Kuvera
  const funds = { ...existingFunds }; // preserve existing
  let success = 0, failed = 0, skipped = 0, notOnKuvera = 0;
  const total = selected.length;

  console.log(`🔍 Fetching returns from Kuvera API (${total} funds, ~${Math.ceil(total * DELAY_MS / 60000)} min)...\n`);

  for (let i = 0; i < total; i++) {
    const f = selected[i];
    const key = String(f.schemeCode);

    // Skip if already cached with Kuvera data (has returnsDate)
    if (existingFunds[key]?.returnsDate && existingFunds[key]?.cagr?.['5y'] !== null) {
      skipped++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${total}] ${f.schemeName.substring(0, 55).padEnd(55)} `);

    try {
      const kuvera = await fetchKuvera(f.isin);

      if (!kuvera) {
        console.log('⚠ Not on Kuvera');
        notOnKuvera++;
        // Still save basic info from AMFI
        funds[key] = {
          schemeCode: f.schemeCode,
          schemeName: f.schemeName,
          fundHouse: f.fundHouse,
          category: f.category,
          isin: f.isin,
          cagr: { '1y': null, '3y': null, '5y': null, '10y': null },
          aum: null, expenseRatio: null, rating: null, nav: f.nav, navDate: null, returnsDate: null,
        };
      } else {
        funds[key] = {
          schemeCode: f.schemeCode,
          schemeName: kuvera.name || f.schemeName,
          fundHouse: kuvera.fund_house || f.fundHouse,
          category: kuvera.fund_category || f.category,
          isin: f.isin,
          cagr: {
            '1y': kuvera.returns?.year_1 != null ? Math.round(kuvera.returns.year_1 * 10) / 10 : null,
            '3y': kuvera.returns?.year_3 != null ? Math.round(kuvera.returns.year_3 * 10) / 10 : null,
            '5y': kuvera.returns?.year_5 != null ? Math.round(kuvera.returns.year_5 * 10) / 10 : null,
            '10y': null,
          },
          aum: kuvera.aum || null,
          expenseRatio: kuvera.expense_ratio || null,
          rating: kuvera.fund_rating || null,
          nav: kuvera.nav?.nav || f.nav,
          navDate: kuvera.nav?.date || null,
          returnsDate: kuvera.returns?.date || null,
        };
        const r = funds[key].cagr;
        console.log(`✅ 1Y=${r['1y'] ?? '—'}% 3Y=${r['3y'] ?? '—'}% 5Y=${r['5y'] ?? '—'}%`);
        success++;
      }
    } catch (e) {
      console.log(`❌ ${e.message}`);
      failed++;
    }

    // Save every 20 funds
    if ((success + failed + notOnKuvera) % 20 === 0) {
      writeFileSync(OUTPUT, JSON.stringify({ lastUpdated: new Date().toISOString(), funds }, null, 2));
    }

    await sleep(DELAY_MS);
  }

  // Final save
  writeFileSync(OUTPUT, JSON.stringify({ lastUpdated: new Date().toISOString(), funds }, null, 2));

  const totalInCache = Object.keys(funds).length;
  const withReturns = Object.values(funds).filter(f => f.cagr?.['5y'] != null).length;

  console.log(`\n${'═'.repeat(55)}`);
  console.log(`✅ Done!`);
  console.log(`   New fetched:    ${success}`);
  console.log(`   Not on Kuvera:  ${notOnKuvera}`);
  console.log(`   Failed:         ${failed}`);
  console.log(`   Skipped:        ${skipped} (already cached)`);
  console.log(`   ─────────────────────────`);
  console.log(`   Total in cache: ${totalInCache}`);
  console.log(`   With 5Y CAGR:   ${withReturns}`);
  console.log(`   Written to:     ${OUTPUT}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
