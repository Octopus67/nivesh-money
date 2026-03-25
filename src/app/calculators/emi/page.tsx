import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { EMICalculator } from '@/components/calculators/emi-calculator';

export const metadata: Metadata = {
  title: 'EMI Calculator',
  description: 'Calculate your monthly EMI, total interest, and see the principal vs interest breakdown for any loan.',
};

export default function EMIPage() {
  return (
    <CalculatorLayout title="EMI Calculator" description="Calculate your monthly EMI and see the principal vs interest breakdown.">
      <Suspense>
        <EMICalculator />
      </Suspense>
    </CalculatorLayout>
  );
}
