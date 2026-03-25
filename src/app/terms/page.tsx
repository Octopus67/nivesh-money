import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using Nivesh.money website and advisory services.',
};

export default function TermsPage() {
  return (
    <section className="min-h-screen py-24 px-6">
      <div className="max-w-3xl mx-auto prose prose-slate prose-headings:text-[var(--color-navy)] prose-p:text-[var(--text-secondary)] prose-li:text-[var(--text-secondary)]">
        <h1>Terms of Service</h1>
        <p className="text-sm text-[var(--text-muted)]">Last updated: March 2026</p>

        <h2>Service Description</h2>
        <p>
          Nivesh.money provides mutual fund distribution and financial advisory services as an
          AMFI-registered Mutual Fund Distributor. Our website offers educational content, financial
          calculators, and tools for informational purposes.
        </p>

        <h2>Use of Calculators</h2>
        <p>
          The calculators on this website are for illustrative purposes only. Results are based on
          assumed rates of return and do not guarantee actual investment performance. Actual returns
          may vary based on market conditions, fund selection, and other factors.
        </p>

        <h2>No Investment Advice</h2>
        <p>
          Content on this website does not constitute personalized investment advice. Investment
          decisions should be made after considering your financial situation, goals, and risk
          tolerance, ideally in consultation with a qualified advisor.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          Nivesh.money shall not be liable for any losses arising from investment decisions made
          based on information provided on this website. All investments are subject to market risks.
        </p>

        <h2>Intellectual Property</h2>
        <p>
          All content, design, and tools on this website are the property of Nivesh.money and may
          not be reproduced without written permission.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to update these terms at any time. Continued use of the website
          constitutes acceptance of the revised terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? Reach out via our <a href="/contact">contact page</a>.
        </p>
      </div>
    </section>
  );
}
