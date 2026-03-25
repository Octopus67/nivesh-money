import type { Metadata } from 'next';
import { HeroSection } from '@/components/sections/hero';
import { TrustBar } from '@/components/sections/trust-bar';
import { ServicesGrid } from '@/components/sections/services-grid';
import { WhyChooseUs } from '@/components/sections/why-choose-us';
import { Testimonials } from '@/components/sections/testimonials';
import { CalculatorPreview } from '@/components/sections/calculator-preview';
import { FAQ } from '@/components/sections/faq';
import { CTASection } from '@/components/sections/cta-section';

export const metadata: Metadata = {
  title: 'Nivesh.money | Smart Mutual Fund Advisory',
  description: 'AMFI-registered mutual fund distributor offering SIP, SWP, retirement planning, and goal-based investing. Personalized financial advisory by Nivesh.money.',
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="section-divider" />
      <TrustBar />
      <div className="section-divider" />
      <ServicesGrid />
      <div className="section-divider" />
      <WhyChooseUs />
      <div className="section-divider" />
      <Testimonials />
      <div className="section-divider" />
      <CalculatorPreview />
      <div className="section-divider" />
      <FAQ />
      <div className="section-divider" />
      <CTASection />
    </>
  );
}
