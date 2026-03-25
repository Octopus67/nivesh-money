import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { SWPCalculator } from '@/components/calculators/swp-calculator';

export const metadata: Metadata = {
  title: 'SWP Calculator — Plan Your Withdrawals',
  description: 'Calculate systematic withdrawal plan from your investment corpus. See how long your money lasts.',
};

export default function SWPPage() {
  return (
    <CalculatorLayout title="SWP Calculator" description="Plan systematic withdrawals from your investment corpus.">
      <Suspense>
        <SWPCalculator />
      </Suspense>
    </CalculatorLayout>
  );
}
