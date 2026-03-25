'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Globe, Mail, Share2, ExternalLink, ArrowUp } from 'lucide-react';

const footerLinks = {
  services: [
    { href: '/services', label: 'SIP Planning' },
    { href: '/services', label: 'SWP Management' },
    { href: '/services', label: 'Retirement Planning' },
    { href: '/services', label: 'Goal-Based Investing' },
  ],
  calculators: [
    { href: '/calculators/sip', label: 'SIP Calculator' },
    { href: '/calculators/swp', label: 'SWP Calculator' },
    { href: '/calculators/retirement', label: 'Retirement Calculator' },
    { href: '/calculators/goal-planner', label: 'Goal Planner' },
    { href: '/calculators/emi', label: 'EMI Calculator' },
    { href: '/calculators/tax-saving', label: 'Tax Saving' },
    { href: '/calculators/inflation', label: 'Inflation' },
    { href: '/calculators/lumpsum', label: 'Lumpsum' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ],
  legal: [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/disclaimer', label: 'Disclaimer' },
  ],
};

const socialLinks = [
  { icon: Globe, href: '#', label: 'LinkedIn' },
  { icon: ExternalLink, href: '#', label: 'Twitter' },
  { icon: Share2, href: '#', label: 'Instagram' },
  { icon: Mail, href: '#', label: 'YouTube' },
];

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-5% 0px' }}
      transition={{ duration: 0.6 }}
      className="bg-[var(--color-navy-dark)] text-white/70 no-print"
    >
      {/* Gradient top border */}
      <div className="h-0.5" style={{ background: 'linear-gradient(90deg, var(--color-emerald), var(--color-blue), var(--color-navy))' }} />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="animated-underline text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Calculators</h3>
            <ul className="space-y-2">
              {footerLinks.calculators.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="animated-underline text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="animated-underline text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="animated-underline text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social icons */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <s.icon size={18} />
            </a>
          ))}
        </div>

        {/* SEBI Compliance */}
        <div className="border-t border-white/10 pt-8">
          <p className="text-xs text-white/40 mb-4">
            Mutual fund investments are subject to market risks. Read all scheme-related documents carefully before investing.
            Past performance is not indicative of future returns.
          </p>
          <p className="text-xs text-white/40 mb-4">
            AMFI Registered Mutual Fund Distributor | ARN: XXXXX
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} Nivesh.money. All rights reserved.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <ArrowUp size={14} />
              Back to top
            </button>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
