import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.css';
import '@/styles/print.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nivesh.money'),
  title: {
    default: 'Nivesh.money | Smart Mutual Fund Advisory',
    template: '%s | Nivesh.money',
  },
  description: 'AMFI-registered mutual fund distributor offering SIP, SWP, retirement planning, and goal-based investing. Personalized financial advisory by Nivesh.money.',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://nivesh.money',
    siteName: 'Nivesh.money',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Nivesh.money - Smart Mutual Fund Advisory' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'FinancialService'],
  name: 'Nivesh.money',
  description: 'AMFI-registered mutual fund distributor offering SIP, SWP, retirement planning, and goal-based investing.',
  url: 'https://nivesh.money',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nashik',
    addressRegion: 'Maharashtra',
    addressCountry: 'IN',
  },
  sameAs: [],
  priceRange: 'Free Consultation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-[var(--color-navy)]">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
