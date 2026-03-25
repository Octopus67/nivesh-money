'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ContactForm() {
  const [service, setService] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    data.service = service;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success('Message sent! We\'ll get back to you within 24 hours.');
        form.reset();
        setService('');
      } else {
        toast.error(json.errors?.[0] ?? 'Something went wrong. Please try again.');
      }
    } catch {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot */}
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Name *</label>
        <Input id="name" name="name" placeholder="Your full name" required maxLength={100} className="h-10" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Email *</label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required maxLength={254} className="h-10" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Phone</label>
          <Input id="phone" name="phone" type="tel" placeholder="+91 XXXXX XXXXX" maxLength={15} className="h-10" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Service Interest</label>
        <Select value={service} onValueChange={(v) => setService(v ?? '')}>
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sip">SIP Planning</SelectItem>
            <SelectItem value="swp">SWP Management</SelectItem>
            <SelectItem value="retirement">Retirement Planning</SelectItem>
            <SelectItem value="goal">Goal-Based Investing</SelectItem>
            <SelectItem value="elss">Tax Saving (ELSS)</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Message *</label>
        <textarea id="message" name="message" rows={4} required maxLength={2000} placeholder="Tell us about your financial goals..." className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none" />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-10 bg-gradient-to-r from-[var(--color-emerald-light)] to-[var(--color-emerald)] text-white rounded-xl font-medium shadow-[var(--shadow-emerald)] disabled:opacity-60"
      >
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : 'Send Message'}
      </Button>
      <p className="text-xs text-[var(--text-muted)]">By submitting, you consent to us contacting you regarding your inquiry.</p>
    </form>
  );
}
