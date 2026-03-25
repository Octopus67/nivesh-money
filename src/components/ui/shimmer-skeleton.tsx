import { cn } from '@/lib/utils';

interface ShimmerSkeletonProps {
  variant?: 'text' | 'card' | 'chart' | 'number';
  className?: string;
}

const variants = {
  text: 'h-4 w-3/4 rounded',
  card: 'h-48 w-full rounded-2xl',
  chart: 'h-64 w-full rounded-2xl',
  number: 'h-12 w-40 rounded-lg',
};

export function ShimmerSkeleton({ variant = 'text', className }: ShimmerSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={cn(
        'relative overflow-hidden bg-[var(--bg-muted)]',
        variants[variant],
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}
