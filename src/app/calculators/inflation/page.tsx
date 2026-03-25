import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { InflationCalculator } from '@/components/calculators/inflation-calculator';

export const metadata: Metadata = {
  title: 'Inflation Calculator — Future Cost & Purchasing Power',
  description: 'See how inflation erodes your purchasing power. Calculate the future cost of your monthly expenses.',
};

export default function InflationPage() {
  return (
    <CalculatorLayout title="Inflation Calculator" description="Understand how inflation impacts your savings and future expenses.">
      <Suspense>
        <InflationCalculator />
      </Suspense>
    </CalculatorLayout>
  );
}
