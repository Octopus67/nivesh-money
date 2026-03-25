// SIP: FV = P × [((1+r)^n - 1) / r] × (1+r)
export function calculateSIP(
  monthly: number,
  annualReturn: number,
  years: number,
  stepUp: number = 0
) {
  monthly = Math.max(0, monthly);
  years = Math.max(1, years);
  annualReturn = Math.max(0, annualReturn);
  if (annualReturn === 0) {
    const invested = monthly * years * 12;
    return { invested, total: invested, returns: 0 };
  }
  const r = annualReturn / 100 / 12;
  const n = years * 12;

  if (stepUp === 0) {
    const fv = monthly * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    return { invested: monthly * n, total: Math.round(fv), returns: Math.round(fv) - monthly * n };
  }

  // Step-up: year-by-year compounding
  let total = 0;
  let invested = 0;
  let currentMonthly = monthly;
  for (let year = 0; year < years; year++) {
    const fvYear = currentMonthly * (((Math.pow(1 + r, 12) - 1) / r) * (1 + r));
    total = total * Math.pow(1 + r, 12) + fvYear;
    invested += currentMonthly * 12;
    currentMonthly = Math.round(currentMonthly * (1 + stepUp / 100));
  }
  return { invested, total: Math.round(total), returns: Math.round(total) - invested };
}

// SWP: month-by-month simulation
export function calculateSWP(
  corpus: number,
  monthlyWithdrawal: number,
  annualReturn: number,
  years: number
) {
  corpus = Math.max(0, corpus);
  monthlyWithdrawal = Math.max(0, monthlyWithdrawal);
  annualReturn = Math.max(0, annualReturn);
  const r = annualReturn / 100 / 12;
  const months = years * 12;
  let balance = corpus;
  let totalWithdrawn = 0;
  const data: { month: number; balance: number }[] = [{ month: 0, balance: corpus }];
  let depletionMonth: number | null = null;

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + r) - monthlyWithdrawal;
    totalWithdrawn += monthlyWithdrawal;
    if (balance <= 0 && depletionMonth === null) {
      depletionMonth = m;
      balance = 0;
    }
    data.push({ month: m, balance: Math.max(0, Math.round(balance)) });
  }

  return {
    finalBalance: Math.max(0, Math.round(balance)),
    totalWithdrawn,
    depletionMonth,
    data,
  };
}

// Lumpsum: FV = PV × (1+r)^n
export function calculateLumpsum(amount: number, annualReturn: number, years: number) {
  amount = Math.max(0, amount);
  years = Math.max(1, years);
  annualReturn = Math.max(0, annualReturn);
  if (annualReturn === 0) return { invested: amount, total: amount, returns: 0 };
  const fv = amount * Math.pow(1 + annualReturn / 100, years);
  return { invested: amount, total: Math.round(fv), returns: Math.round(fv) - amount };
}

// Retirement: corpus needed + monthly SIP to fill gap
export function calculateRetirement(
  currentAge: number,
  retirementAge: number,
  monthlyExpenses: number,
  inflation: number,
  preReturnRate: number,
  postReturnRate: number,
  retirementYears: number,
  existingSavings: number
) {
  if (retirementAge <= currentAge) {
    return { futureMonthlyExpense: monthlyExpenses, corpusNeeded: 0, existingGrowth: existingSavings, gap: 0, monthlySIP: 0 };
  }
  const yearsToRetire = retirementAge - currentAge;
  const futureMonthlyExpense = monthlyExpenses * Math.pow(1 + inflation / 100, yearsToRetire);
  const realPostReturn = (1 + postReturnRate / 100) / (1 + inflation / 100) - 1;
  const corpusNeeded =
    realPostReturn > 0
      ? futureMonthlyExpense * 12 * ((1 - Math.pow(1 + realPostReturn, -retirementYears)) / realPostReturn)
      : futureMonthlyExpense * 12 * retirementYears;
  const existingGrowth = existingSavings * Math.pow(1 + preReturnRate / 100, yearsToRetire);
  const gap = Math.max(0, corpusNeeded - existingGrowth);
  const r = preReturnRate / 100 / 12;
  const n = yearsToRetire * 12;
  const monthlySIP = gap > 0 ? (gap * r) / (Math.pow(1 + r, n) - 1) / (1 + r) : 0;
  return {
    futureMonthlyExpense: Math.round(futureMonthlyExpense),
    corpusNeeded: Math.round(corpusNeeded),
    existingGrowth: Math.round(existingGrowth),
    gap: Math.round(gap),
    monthlySIP: Math.round(monthlySIP),
  };
}

// EMI: P × r × (1+r)^n / ((1+r)^n - 1)
export function calculateEMI(principal: number, annualRate: number, years: number) {
  principal = Math.max(0, principal);
  years = Math.max(1, years);
  annualRate = Math.max(0, annualRate);
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return { emi: Math.round(principal / n), totalInterest: 0, totalPayment: principal };
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalPayment - principal),
    totalPayment: Math.round(totalPayment),
  };
}

// Goal Planner
export function calculateGoalPlanner(
  targetAmount: number,
  years: number,
  annualReturn: number,
  inflation: number
) {
  targetAmount = Math.max(0, targetAmount);
  years = Math.max(1, years);
  const adjustedTarget = targetAmount * Math.pow(1 + inflation / 100, years);
  if (annualReturn === 0) {
    return { adjustedTarget: Math.round(adjustedTarget), monthlySIP: Math.round(adjustedTarget / (years * 12)), lumpsum: Math.round(adjustedTarget) };
  }
  const r = annualReturn / 100 / 12;
  const n = years * 12;
  const monthlySIP = (adjustedTarget * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
  const lumpsum = adjustedTarget / Math.pow(1 + annualReturn / 100, years);
  return {
    adjustedTarget: Math.round(adjustedTarget),
    monthlySIP: Math.round(monthlySIP),
    lumpsum: Math.round(lumpsum),
  };
}

// Year-by-year SIP chart data
export function generateSIPChartData(monthly: number, annualReturn: number, years: number, stepUp: number = 0) {
  const r = annualReturn / 100 / 12;
  const data: { year: number; invested: number; returns: number }[] = [];
  let totalInvested = 0;
  let totalValue = 0;
  let currentMonthly = monthly;

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      totalValue = totalValue * (1 + r) + currentMonthly;
      totalInvested += currentMonthly;
    }
    data.push({ year: y, invested: Math.round(totalInvested), returns: Math.round(totalValue - totalInvested) });
    if (stepUp > 0) currentMonthly = Math.round(currentMonthly * (1 + stepUp / 100));
  }
  return data;
}

// Tax Saving 80C: Old vs New regime comparison with ELSS
export function calculateTaxSaving(
  annualIncome: number,
  existing80C: number,
  proposedELSS: number
) {
  annualIncome = Math.max(0, annualIncome);
  const maxDeduction = 150000;
  const total80C = Math.min(existing80C + proposedELSS, maxDeduction);
  const elssUsed = Math.min(proposedELSS, maxDeduction - existing80C);

  function oldRegimeTax(income: number, deduction: number) {
    const taxable = Math.max(0, income - 50000 - deduction);
    if (taxable <= 250000) return 0;
    if (taxable <= 500000) return (taxable - 250000) * 0.05;
    if (taxable <= 1000000) return 12500 + (taxable - 500000) * 0.20;
    return 112500 + (taxable - 1000000) * 0.30;
  }

  function newRegimeTax(income: number) {
    const taxable = Math.max(0, income - 75000);
    if (taxable <= 400000) return 0;
    if (taxable <= 800000) return (taxable - 400000) * 0.05;
    if (taxable <= 1200000) return 20000 + (taxable - 800000) * 0.10;
    if (taxable <= 1600000) return 60000 + (taxable - 1200000) * 0.15;
    if (taxable <= 2000000) return 120000 + (taxable - 1600000) * 0.20;
    if (taxable <= 2400000) return 200000 + (taxable - 2000000) * 0.25;
    return 320000 + (taxable - 2400000) * 0.30;
  }

  // FY 2025-26 standard deduction: ₹50,000 (old), ₹75,000 (new)
  const oldTaxableWithout = Math.max(0, annualIncome - 50000 - existing80C);
  const oldTaxableWith = Math.max(0, annualIncome - 50000 - total80C);
  const newTaxable = Math.max(0, annualIncome - 75000);

  let oldTaxWithout = oldRegimeTax(annualIncome, existing80C);
  if (oldTaxableWithout <= 500000) oldTaxWithout = 0; // 87A rebate

  let oldTaxWith = oldRegimeTax(annualIncome, total80C);
  if (oldTaxableWith <= 500000) oldTaxWith = 0; // 87A rebate

  let newTax = newRegimeTax(annualIncome);
  if (newTaxable <= 700000) newTax = 0; // 87A rebate

  const addCess = (tax: number) => Math.round(tax * 1.04);

  return {
    oldRegimeWithout: addCess(oldTaxWithout),
    oldRegimeWith: addCess(oldTaxWith),
    newRegime: addCess(newTax),
    taxSaved: addCess(oldTaxWithout) - addCess(oldTaxWith),
    elssUsed,
    recommendedRegime: addCess(oldTaxWith) < addCess(newTax) ? 'old' as const : 'new' as const,
  };
}

// Inflation: future cost and purchasing power erosion
export function calculateInflation(currentCost: number, inflationRate: number, years: number) {
  currentCost = Math.max(0, currentCost);
  years = Math.max(1, years);
  const futureCost = currentCost * Math.pow(1 + inflationRate / 100, years);
  const purchasingPower = currentCost / Math.pow(1 + inflationRate / 100, years);
  return {
    futureCost: Math.round(futureCost),
    purchasingPower: Math.round(purchasingPower),
  };
}

// Year-by-year inflation chart data
export function generateInflationChartData(currentCost: number, inflationRate: number, years: number) {
  const data: { year: number; cost: number }[] = [];
  for (let y = 0; y <= years; y++) {
    data.push({ year: y, cost: Math.round(currentCost * Math.pow(1 + inflationRate / 100, y)) });
  }
  return data;
}