'use client';

import { motion } from 'motion/react';
import { GlassCard } from '@/components/ui/glass-card';
import { ContactForm } from '@/components/contact-form';
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react';

const contactInfo = [
  { icon: Phone, label: 'Phone', value: '+91 XXXXX XXXXX', href: 'tel:+91XXXXXXXXXX' },
  { icon: Mail, label: 'Email', value: 'hello@nivesh.money', href: 'mailto:hello@nivesh.money' },
  { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', href: 'https://wa.me/91XXXXXXXXXX', pulse: true },
  { icon: MapPin, label: 'Office', value: 'Mumbai, Maharashtra, India', href: undefined },
];

export function ContactContent() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-[56px] font-bold leading-tight text-[var(--color-navy)] mb-4"
        >
          Get in Touch
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto"
        >
          Book a free consultation or ask us anything. We typically respond within 24 hours.
        </motion.p>
      </section>

      {/* Two-column layout */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard>
              <ContactForm />
            </GlassCard>
          </motion.div>

          {/* Contact Info */}
          <div className="space-y-4">
            {contactInfo.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <GlassCard variant="subtle" className="flex items-start gap-4 p-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.pulse ? 'bg-green-100' : 'bg-[var(--color-navy)]/5'}`}>
                    <item.icon className={`w-5 h-5 ${item.pulse ? 'text-green-600 animate-pulse' : 'text-[var(--color-navy)]'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className={`text-sm hover:underline ${item.pulse ? 'text-green-600' : 'text-[var(--color-navy-light)]'}`} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-[var(--text-secondary)]">{item.value}</p>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
