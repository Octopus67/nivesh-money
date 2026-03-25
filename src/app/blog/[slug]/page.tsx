import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { Calendar, Clock } from 'lucide-react';
import { ReadingProgressBar } from '@/components/reading-progress-bar';
import { BackToBlog } from '@/components/back-to-blog';
import type { ComponentPropsWithoutRef } from 'react';

const mdxComponents = {
  a: (props: ComponentPropsWithoutRef<'a'>) => (
    <a {...props} className="text-[var(--color-emerald)] hover:underline" />
  ),
  h1: (props: ComponentPropsWithoutRef<'h1'>) => <h1 {...props} />,
  h2: (props: ComponentPropsWithoutRef<'h2'>) => <h2 {...props} />,
  h3: (props: ComponentPropsWithoutRef<'h3'>) => <h3 {...props} />,
  p: (props: ComponentPropsWithoutRef<'p'>) => <p {...props} />,
  ul: (props: ComponentPropsWithoutRef<'ul'>) => <ul {...props} />,
  ol: (props: ComponentPropsWithoutRef<'ol'>) => <ol {...props} />,
  li: (props: ComponentPropsWithoutRef<'li'>) => <li {...props} />,
  strong: (props: ComponentPropsWithoutRef<'strong'>) => <strong {...props} />,
  em: (props: ComponentPropsWithoutRef<'em'>) => <em {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => <blockquote {...props} />,
  code: (props: ComponentPropsWithoutRef<'code'>) => <code {...props} />,
  pre: (props: ComponentPropsWithoutRef<'pre'>) => <pre {...props} />,
  table: (props: ComponentPropsWithoutRef<'table'>) => <table {...props} />,
  thead: (props: ComponentPropsWithoutRef<'thead'>) => <thead {...props} />,
  tbody: (props: ComponentPropsWithoutRef<'tbody'>) => <tbody {...props} />,
  tr: (props: ComponentPropsWithoutRef<'tr'>) => <tr {...props} />,
  th: (props: ComponentPropsWithoutRef<'th'>) => <th {...props} />,
  td: (props: ComponentPropsWithoutRef<'td'>) => <td {...props} />,
  hr: (props: ComponentPropsWithoutRef<'hr'>) => <hr {...props} />,
  img: (props: ComponentPropsWithoutRef<'img'>) => <img {...props} />,
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

          <div className="prose prose-slate max-w-none prose-headings:text-[var(--color-navy)] prose-a:text-[var(--color-emerald)] prose-a:no-underline hover:prose-a:underline prose-strong:text-[var(--text-primary)] prose-li:text-[var(--text-secondary)] prose-p:text-[var(--text-secondary)]">
            <MDXRemote source={post.content} components={mdxComponents} />
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
