import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { RetirementCalculator } from '@/components/calculators/retirement-calculator';

export const metadata: Metadata = {
  title: 'Retirement Calculator',
  description: 'Find out how much corpus you need for a comfortable retirement and the monthly SIP to get there.',
};

export default function RetirementPage() {
  return (
    <CalculatorLayout title="Retirement Calculator" description="Find out how much you need for a comfortable retirement.">
      <Suspense>
        <RetirementCalculator />
      </Suspense>
    </CalculatorLayout>
  );
}
