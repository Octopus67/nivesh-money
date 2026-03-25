'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const faqs = [
  { q: 'What is the minimum amount to start a SIP?', a: 'You can start a SIP with as little as ₹500 per month. We help you choose the right funds based on your goals and risk profile.' },
  { q: 'Is there any advisory fee?', a: 'No. As an AMFI-registered mutual fund distributor, we earn a small commission from the fund house. There is zero advisory fee for you.' },
  { q: 'How do I track my investments?', a: 'You\'ll receive regular portfolio statements. Plus, our investment tool lets you track projections, compare funds, and monitor your portfolio anytime.' },
  { q: 'Are mutual fund investments safe?', a: 'Mutual funds are subject to market risks, but with proper diversification and a long-term approach, they have historically delivered strong returns. We help you choose funds that match your risk tolerance.' },
  { q: 'Can I withdraw my money anytime?', a: 'Most open-ended mutual funds allow withdrawal anytime. Some funds like ELSS have a 3-year lock-in. We\'ll always explain the terms before you invest.' },
];

export function FAQ() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <section ref={ref} className="py-20 md:py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-semibold text-center text-[var(--color-navy)] mb-12"
        >
          Frequently Asked Questions
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Accordion>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={String(i)}>
                <AccordionTrigger className="text-base font-medium text-[var(--color-navy)] py-4 [&_[data-slot=accordion-trigger-icon]]:text-[var(--color-emerald)]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[var(--text-secondary)]">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
