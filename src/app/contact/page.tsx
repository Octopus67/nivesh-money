import type { Metadata } from 'next';
import { ContactContent } from '@/components/contact-content';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Nivesh.money. Book a free consultation for mutual fund advisory, SIP planning, and retirement planning.',
};

export default function ContactPage() {
  return <ContactContent />;
}
