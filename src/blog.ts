import { getCollection, type CollectionEntry } from 'astro:content'
import { format } from 'date-fns'

export type BlogPost = CollectionEntry<'blog'>

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog')
  return posts.sort((a, b) => {
    const dateDiff = b.data.date.getTime() - a.data.date.getTime()
    if (dateDiff !== 0) return dateDiff
    return a.data.order - b.data.order
  })
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getAllPosts()
  return posts.find(post => post.data.slug === slug)
}

export function formatPostDate(date: Date): string {
  return format(date, 'MMMM d, yyyy')
}

export function getPostExcerpt(post: BlogPost): string {
  if (post.data.excerpt) return post.data.excerpt

  const text = post.body
    .replace(/^#.*$/gm, '')
    .replace(/\*\*/g, '')
    .replace(/^-\s+/gm, '')
    .trim()

  const firstParagraph = text.split('\n\n')[0]?.trim() ?? ''
  if (firstParagraph.length <= 200) return firstParagraph
  return `${firstParagraph.slice(0, 197).trim()}…`
}
