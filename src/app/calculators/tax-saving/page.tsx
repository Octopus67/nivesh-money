import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { TaxSavingCalculator } from '@/components/calculators/tax-saving-calculator';

export const metadata: Metadata = {
  title: 'Tax Saving Calculator — Section 80C ELSS Optimizer',
  description: 'Compare old vs new tax regime. See how ELSS investments under Section 80C reduce your tax liability.',
};

export default function TaxSavingPage() {
  return (
    <CalculatorLayout title="Tax Saving Calculator" description="Compare tax regimes and optimise your Section 80C investments.">
      <Suspense>
        <TaxSavingCalculator />
      </Suspense>
    </CalculatorLayout>
  );
}
