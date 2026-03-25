'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { GlassCard } from '@/components/ui/glass-card';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readingTime: string;
}

export function BlogContent({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <section className="min-h-screen flex items-center justify-center px-6">
        <GlassCard className="max-w-md text-center py-12">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Coming Soon</h1>
          <p className="text-[var(--text-secondary)]">We&apos;re working on insightful articles. Check back soon!</p>
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-[var(--color-navy)] mb-3"
        >
          Blog
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-[var(--text-secondary)] mb-12 max-w-2xl"
        >
          Financial insights and investment guides to help you build lasting wealth.
        </motion.p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <GlassCard className="h-full flex flex-col hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                  <span className="inline-block self-start text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-emerald)]/10 text-[var(--color-emerald)] mb-3">
                    {post.category}
                  </span>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--color-emerald)] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-4 flex-1">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readingTime}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--color-emerald)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
