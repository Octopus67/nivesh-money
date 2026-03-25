import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { Calendar, Clock } from 'lucide-react';
import { ReadingProgressBar } from '@/components/reading-progress-bar';
import { BackToBlog } from '@/components/back-to-blog';
import type { ComponentPropsWithoutRef } from 'react';

const mdxComponents = {
  a: (props: ComponentPropsWithoutRef<'a'>) => (
    <a {...props} className="text-[var(--color-emerald)] hover:underline font-medium" />
  ),
  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote className="border-l-4 border-[var(--color-emerald)] bg-[var(--color-emerald)]/5 rounded-r-lg px-5 py-4 my-6 not-italic" {...props} />
  ),
  table: (props: ComponentPropsWithoutRef<'table'>) => (
    <div className="overflow-x-auto my-6 rounded-lg border border-black/10">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<'thead'>) => <thead className="bg-[#f1f5f9] text-left" {...props} />,
  tbody: (props: ComponentPropsWithoutRef<'tbody'>) => <tbody className="divide-y divide-black/5" {...props} />,
  tr: (props: ComponentPropsWithoutRef<'tr'>) => <tr className="hover:bg-black/[0.02]" {...props} />,
  th: (props: ComponentPropsWithoutRef<'th'>) => <th className="px-4 py-3 font-semibold text-[#1e3a5f] text-xs uppercase tracking-wider" {...props} />,
  td: (props: ComponentPropsWithoutRef<'td'>) => <td className="px-4 py-3" {...props} />,
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'Nivesh.money' },
  };

  return (
    <>
      <ReadingProgressBar />
      <article className="min-h-screen py-24 px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
        />
        <div className="max-w-3xl mx-auto">
          <BackToBlog />

          <header className="mb-10">
            <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-emerald)]/10 text-[var(--color-emerald)] mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-navy)] mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readingTime}
              </span>
            </div>
          </header>

          <div className="prose prose-lg prose-slate max-w-none prose-headings:text-[#1e3a5f] prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-[#374151] prose-p:leading-relaxed prose-p:mb-5 prose-a:text-[#047857] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#111827] prose-li:text-[#374151] prose-li:leading-relaxed prose-blockquote:not-italic prose-hr:my-8">
            <MDXRemote source={post.content} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </div>

          <footer className="mt-12 pt-8 border-t border-[var(--bg-muted)]">
            <p className="text-xs text-[var(--text-muted)]">
              Mutual fund investments are subject to market risks. Read all scheme-related documents carefully before investing.
              Past performance is not indicative of future returns. The information provided is for educational purposes only
              and should not be considered as investment advice.
            </p>
          </footer>
        </div>
      </article>
    </>
  );
}
