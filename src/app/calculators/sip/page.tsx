import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { SIPCalculator } from '@/components/calculators/sip-calculator';

export const metadata: Metadata = {
  title: 'SIP Calculator — Plan Your Monthly Investments',
  description: 'Calculate SIP returns with step-up option. See projected growth with interactive charts.',
};

export default function SIPPage() {
  return (
    <CalculatorLayout title="SIP Calculator" description="Plan your monthly investments and visualise projected growth.">
      <Suspense>
        <SIPCalculator />
      </Suspense>
    </CalculatorLayout>
  );
}
