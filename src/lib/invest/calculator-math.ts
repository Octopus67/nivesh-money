// Pure calculation functions for Modes 1-3 (SIP, SWP, Lump Sum)
// All money values in rupees. Format only at display layer.

export interface SIPResult {
  invested: number;
  returns: number;
  corpus: number;
  yearlyData: { year: number; invested: number; returns: number; corpus: number }[];
}

export function sipCalculate(amount: number, years: number, rate: number, stepUp: number = 0): SIPResult {
  amount = Math.max(0, amount);
  years = Math.max(1, years);
  rate = Math.max(0, rate);
  const r = rate / 100 / 12;
  const yearlyData: SIPResult['yearlyData'] = [];

  if (r === 0) {
    let totalInvested = 0;
    let currentAmount = amount;
    for (let y = 1; y <= years; y++) {
      totalInvested += currentAmount * 12;
      yearlyData.push({ year: y, invested: totalInvested, returns: 0, corpus: totalInvested });
      if (stepUp > 0) currentAmount = Math.round(currentAmount * (1 + stepUp / 100));
    }
    return { invested: totalInvested, returns: 0, corpus: totalInvested, yearlyData };
  }

  if (stepUp === 0) {
    for (let y = 1; y <= years; y++) {
      const n = y * 12;
      const fv = amount * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
      const inv = amount * n;
      yearlyData.push({ year: y, invested: inv, returns: Math.round(fv - inv), corpus: Math.round(fv) });
    }
    const total = yearlyData[yearlyData.length - 1];
    return { invested: total.invested, returns: total.returns, corpus: total.corpus, yearlyData };
  }

  // Step-up SIP: annuity-due (payment at start of period, matching flat SIP closed-form)
  let totalValue = 0;
  let totalInvested = 0;
  let currentAmount = amount;
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      totalValue = (totalValue + currentAmount) * (1 + r);
      totalInvested += currentAmount;
    }
    yearlyData.push({
      year: y,
      invested: Math.round(totalInvested),
      returns: Math.round(totalValue - totalInvested),
      corpus: Math.round(totalValue),
    });
    currentAmount = Math.round(currentAmount * (1 + stepUp / 100));
  }
  return {
    invested: Math.round(totalInvested),
    returns: Math.round(totalValue - totalInvested),
    corpus: Math.round(totalValue),
    yearlyData,
  };
}

export interface SWPResult {
  totalWithdrawn: number;
  remaining: number;
  depletionYear: number | null;
  monthlyData: { month: number; balance: number }[];
}

export function swpCalculate(corpus: number, withdrawal: number, rate: number): SWPResult {
  corpus = Math.max(0, corpus);
  withdrawal = Math.max(0, withdrawal);
  rate = Math.max(0, rate);
  const r = rate / 100 / 12;
  let balance = corpus;
  let totalWithdrawn = 0;
  let depletionYear: number | null = null;
  const monthlyData: SWPResult['monthlyData'] = [{ month: 0, balance: corpus }];
  const maxMonths = 480; // 40 years

  for (let m = 1; m <= maxMonths; m++) {
    balance = balance * (1 + r) - withdrawal;
    totalWithdrawn += withdrawal;
    if (balance <= 0) {
      depletionYear = Math.ceil(m / 12);
      balance = 0;
      monthlyData.push({ month: m, balance: 0 });
      break;
    }
    monthlyData.push({ month: m, balance: Math.round(balance) });
  }

  return {
    totalWithdrawn: Math.round(totalWithdrawn),
    remaining: Math.max(0, Math.round(balance)),
    depletionYear,
    monthlyData,
  };
}

export interface LumpSumResult {
  invested: number;
  returns: number;
  finalValue: number;
  yearlyData: { year: number; value: number }[];
}

export function lumpSumCalculate(amount: number, years: number, rate: number): LumpSumResult {
  amount = Math.max(0, amount);
  years = Math.max(1, years);
  rate = Math.max(0, rate);
  const yearlyData: LumpSumResult['yearlyData'] = [];
  for (let y = 0; y <= years; y++) {
    yearlyData.push({ year: y, value: Math.round(amount * Math.pow(1 + rate / 100, y)) });
  }
  const finalValue = yearlyData[yearlyData.length - 1].value;
  return { invested: amount, returns: finalValue - amount, finalValue, yearlyData };
}
