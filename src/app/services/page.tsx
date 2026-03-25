import type { Metadata } from 'next';
import { ServicesContent } from '@/components/services-content';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore our mutual fund advisory services — SIP planning, SWP management, retirement planning, goal-based investing, and ELSS tax saving.',
};

export default function ServicesPage() {
  return <ServicesContent />;
}
