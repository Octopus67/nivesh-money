import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readingTime: string;
  content: string;
}

/** Sanitize slug to prevent path traversal */
function sanitizeSlug(slug: string): string | null {
  const safe = slug.replace(/[^a-zA-Z0-9-]/g, '');
  if (!safe || safe !== slug) return null;
  return safe;
}

export function getAllPosts(): Omit<BlogPost, 'content'>[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));
  return files
    .map(file => {
      const slug = file.replace('.mdx', '');
      if (!sanitizeSlug(slug)) return null;
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
      const { data, content } = matter(raw);
      const stats = readingTime(content);
      return {
        slug,
        title: data.title || slug,
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        category: data.category || 'General',
        readingTime: stats.text,
      };
    })
    .filter((post): post is NonNullable<typeof post> => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const safeSlug = sanitizeSlug(slug);
  if (!safeSlug) return null;

  const filePath = path.join(BLOG_DIR, `${safeSlug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const stats = readingTime(content);
  return {
    slug: safeSlug,
    title: data.title || safeSlug,
    description: data.description || '',
    date: data.date || new Date().toISOString(),
    category: data.category || 'General',
    readingTime: stats.text,
    content,
  };
}
