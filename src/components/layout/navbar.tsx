'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '@/components/ui/sheet';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/calculators', label: 'Calculators' },
  { href: '/invest', label: 'Investment Tool' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl transition-all',
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border border-black/[0.06] shadow-lg rounded-2xl'
          : 'bg-transparent'
      )}
      style={{ transitionDuration: 'var(--duration-normal)' }}
    >
      <nav className="flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="32" x2="32" y2="0">
                <stop offset="0%" stopColor="#1e3a5f" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>
            <rect x="4" y="20" width="6" height="8" rx="2" fill="url(#logo-grad)" opacity="0.5" />
            <rect x="13" y="12" width="6" height="16" rx="2" fill="url(#logo-grad)" opacity="0.75" />
            <rect x="22" y="4" width="6" height="24" rx="2" fill="url(#logo-grad)" />
          </svg>
          <span className="text-xl font-bold">
            <span className="text-[var(--color-navy)]">Nivesh</span>
            <span className="text-[var(--color-accent-secondary)]">.money</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'animated-underline text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-emerald)]',
                isActive(link.href)
                  ? 'text-[var(--color-emerald)] font-medium after:!w-full after:!bg-[var(--color-emerald)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--color-navy)]'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className={cn(
              buttonVariants(),
              'btn-glow bg-[var(--color-emerald)] hover:bg-[var(--color-emerald-dark)] text-white shadow-[var(--shadow-emerald)] rounded-xl',
              'hover:scale-[1.02] active:scale-[0.98] transition-transform'
            )}
          >
            Free Consultation
          </Link>
        </div>

        {/* Mobile */}
        <Sheet>
          <SheetTrigger
            className="md:hidden"
            render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-white/95 backdrop-blur-xl">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex items-center gap-2 mb-2">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="logo-grad-m" x1="0" y1="32" x2="32" y2="0">
                    <stop offset="0%" stopColor="#1e3a5f" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
                <rect x="4" y="20" width="6" height="8" rx="2" fill="url(#logo-grad-m)" opacity="0.5" />
                <rect x="13" y="12" width="6" height="16" rx="2" fill="url(#logo-grad-m)" opacity="0.75" />
                <rect x="22" y="4" width="6" height="24" rx="2" fill="url(#logo-grad-m)" />
              </svg>
              <span className="text-lg font-bold">
                <span className="text-[var(--color-navy)]">Nivesh</span>
                <span className="text-[var(--color-accent-secondary)]">.money</span>
              </span>
            </div>
            <div className="flex flex-col gap-6 mt-4">
              {navLinks.map((link, i) => (
                <SheetClose
                  key={link.href}
                  render={
                    <Link
                      href={link.href}
                      className={cn(
                        'text-lg font-medium',
                        isActive(link.href)
                          ? 'text-[var(--color-emerald)]'
                          : 'text-[var(--text-primary)] hover:text-[var(--color-emerald)]'
                      )}
                      style={{ animationDelay: `${i * 50}ms` }}
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              ))}
              <SheetClose
                render={
                  <Link
                    href="/contact"
                    className={cn(
                      buttonVariants(),
                      'btn-glow bg-[var(--color-emerald)] hover:bg-[var(--color-emerald-dark)] text-white rounded-xl mt-4'
                    )}
                  />
                }
              >
                Free Consultation
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
