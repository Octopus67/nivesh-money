'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function BackToBlog() {
  return (
    <Link
      href="/blog"
      className="group inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--color-emerald)] transition-colors mb-8"
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
      Back to Blog
    </Link>
  );
}
