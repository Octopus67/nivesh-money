import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { LumpsumCalculator } from '@/components/calculators/lumpsum-calculator';

export const metadata: Metadata = {
  title: 'Lumpsum Calculator',
  description: 'Calculate returns on a one-time lumpsum investment. See the power of compounding with our interactive growth chart.',
};

export default function LumpsumPage() {
  return (
    <CalculatorLayout title="Lumpsum Calculator" description="Calculate returns on a one-time investment.">
      <Suspense fallback={<div>Loading...</div>}>
        <LumpsumCalculator />
      </Suspense>
    </CalculatorLayout>
  );
}
