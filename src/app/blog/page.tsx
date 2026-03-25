import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import { BlogContent } from '@/components/blog-content';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Financial insights, investment guides, and mutual fund education to help you make smarter money decisions.',
};

export default function BlogPage() {
  const posts = getAllPosts();
  return <BlogContent posts={posts} />;
}
