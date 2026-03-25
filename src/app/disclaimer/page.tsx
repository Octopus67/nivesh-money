import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Important financial disclaimers and risk disclosures for Nivesh.money.',
};

export default function DisclaimerPage() {
  return (
    <section className="min-h-screen py-24 px-6">
      <div className="max-w-3xl mx-auto prose prose-slate prose-headings:text-[var(--color-navy)] prose-p:text-[var(--text-secondary)] prose-li:text-[var(--text-secondary)]">
        <h1>Disclaimer</h1>
        <p className="text-sm text-[var(--text-muted)]">Last updated: March 2026</p>

        <h2>Investment Risks</h2>
        <p>
          Mutual fund investments are subject to market risks. Please read all scheme-related
          documents carefully before investing. The NAV of mutual fund units may go up or down
          based on market conditions and factors affecting the securities markets.
        </p>

        <h2>No Guaranteed Returns</h2>
        <p>
          Past performance of any mutual fund scheme is not indicative of future results. There is
          no assurance or guarantee that the objectives of any scheme will be achieved. Returns
          shown in calculators and articles are hypothetical and for illustration purposes only.
        </p>

        <h2>Not Investment Advice</h2>
        <p>
          The information on this website is for general educational and informational purposes only.
          It does not constitute an offer, solicitation, or recommendation to buy or sell any mutual
          fund units or other financial instruments.
        </p>

        <h2>SEBI &amp; AMFI Compliance</h2>
        <p>
          Nivesh.money operates as an AMFI-registered Mutual Fund Distributor ({/* TODO: Replace with actual ARN number */}ARN: [Your ARN Number]).
          We adhere to SEBI regulations and AMFI guidelines for mutual fund distribution.
          All recommendations are made in accordance with the suitability requirements prescribed
          by SEBI.
        </p>

        <h2>Third-Party Content</h2>
        <p>
          Any references to third-party data, research, or fund performance are sourced from
          publicly available information and are believed to be reliable but not guaranteed for
          accuracy or completeness.
        </p>

        <h2>Consult a Professional</h2>
        <p>
          Before making any investment decisions, please consult with a qualified financial advisor
          who can assess your individual circumstances, risk tolerance, and financial goals.
        </p>
      </div>
    </section>
  );
}
