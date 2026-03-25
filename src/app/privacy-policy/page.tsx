import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Nivesh.money collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <section className="min-h-screen py-24 px-6">
      <div className="max-w-3xl mx-auto prose prose-slate prose-headings:text-[var(--color-navy)] prose-p:text-[var(--text-secondary)] prose-li:text-[var(--text-secondary)]">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-[var(--text-muted)]">Last updated: March 2026</p>

        <h2>Information We Collect</h2>
        <p>When you use our website or contact us, we may collect:</p>
        <ul>
          <li>Name, email address, and phone number (when you submit our contact form)</li>
          <li>Financial goals and investment preferences (when you request a consultation)</li>
          <li>Usage data such as pages visited, time spent, and calculator inputs (anonymized)</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To respond to your enquiries and provide financial advisory services</li>
          <li>To send relevant investment insights (only with your consent)</li>
          <li>To improve our website, calculators, and user experience</li>
        </ul>

        <h2>Cookies &amp; Analytics</h2>
        <p>
          We use Google Analytics to understand how visitors interact with our site. This data is anonymized
          and used solely to improve our services. You can opt out by disabling cookies in your browser settings.
        </p>

        <h2>Data Sharing</h2>
        <p>
          We do not sell, trade, or rent your personal information to third parties. Your data may be shared
          only with mutual fund houses as required to process your investments, and only with your explicit consent.
        </p>

        <h2>Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your personal information. However,
          no method of electronic transmission is 100% secure.
        </p>

        <h2>Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal data at any time
          by contacting us.
        </p>

        <h2>Digital Personal Data Protection Act, 2023 (DPDP Act)</h2>
        <p>
          In compliance with the Digital Personal Data Protection Act, 2023, we recognise the following
          rights and obligations:
        </p>
        <h3>Data Principal Rights</h3>
        <ul>
          <li>Right to access information about your personal data being processed</li>
          <li>Right to correction and erasure of your personal data</li>
          <li>Right to grievance redressal</li>
          <li>Right to nominate another person to exercise your rights</li>
        </ul>
        <h3>Consent</h3>
        <p>
          We collect and process your personal data only with your free, specific, informed, unconditional,
          and unambiguous consent. You may withdraw consent at any time by contacting us, after which we
          will cease processing your data (subject to legal retention requirements).
        </p>
        <h3>Data Retention</h3>
        <p>
          Personal data is retained only for as long as necessary to fulfil the purpose for which it was
          collected, or as required by applicable law. Once the purpose is fulfilled, data is erased
          unless retention is required by law.
        </p>
        <h3>Grievance Officer</h3>
        <p>
          For any concerns regarding your personal data, you may contact our Grievance Officer
          via our <a href="/contact">contact page</a>. We will acknowledge your grievance within
          48 hours and resolve it within 30 days.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy-related queries, please reach out via our <a href="/contact">contact page</a>.
        </p>
      </div>
    </section>
  );
}
