import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { GoalPlannerCalculator } from '@/components/calculators/goal-planner-calculator';

export const metadata: Metadata = {
  title: 'Goal Planner',
  description: 'Plan for your financial goals — child education, house, wedding, or any custom goal. Find the monthly SIP needed.',
};

export default function GoalPlannerPage() {
  return (
    <CalculatorLayout title="Goal Planner" description="Turn your financial goals into a concrete monthly investment plan.">
      <Suspense>
        <GoalPlannerCalculator />
      </Suspense>
    </CalculatorLayout>
  );
}
