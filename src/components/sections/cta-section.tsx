'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import Link from 'next/link';
import { Phone } from 'lucide-react';

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <section
      ref={ref}
      className="cta-gradient-bg py-20 md:py-24 px-6 relative overflow-hidden"
    >
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.05,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center relative z-10"
      >
        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
          Ready to Secure Your Financial Future?
        </h2>
        <p className="text-lg text-white/70 mb-8">
          Book a free consultation. No obligations, no pressure — just honest financial guidance.
        </p>
        <Link
          href="/contact"
          className="btn-glow inline-flex items-center justify-center h-14 px-10 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-[#d97706] to-[#ea580c] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          Book Free Consultation
        </Link>
        <p className="mt-4 text-sm text-white/60 flex items-center justify-center gap-1.5">
          or call us at{' '}
          <a href="tel:+91XXXXXXXXXX" className="inline-flex items-center gap-1 text-white/80 hover:text-white transition-colors">
            <Phone size={14} />
            +91 XXXXX XXXXX
          </a>
        </p>
      </motion.div>

      <style jsx>{`
        .cta-gradient-bg {
          background: linear-gradient(135deg, #1e3a5f 0%, #132843 50%, #1e3a5f 100%);
          background-size: 200% 200%;
          animation: gradientShift 10s ease infinite;
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
}
