import type { Metadata } from 'next';
import { AboutContent } from '@/components/about-content';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Nivesh.money — AMFI-registered mutual fund distributor with 15+ years of experience helping families grow their wealth.',
};

export default function AboutPage() {
  return <AboutContent />;
}
