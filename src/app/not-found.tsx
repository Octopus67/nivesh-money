import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--bg-soft)]">
      <GlassCard className="max-w-md w-full text-center py-12 px-8 shadow-[var(--shadow-lg)]">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">Page Not Found</h1>
        <p className="text-[var(--text-secondary)] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button className="h-10 px-6 bg-gradient-to-r from-[var(--color-emerald-light)] to-[var(--color-emerald)] text-white rounded-xl font-medium shadow-[var(--shadow-emerald)]">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </Link>
      </GlassCard>
    </div>
  );
}
