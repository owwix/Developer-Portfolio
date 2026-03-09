import type { MetadataRoute } from 'next'
import type { BlogPost } from '../lib/blog'
import { isComingSoon } from '../lib/blog'
import { fetchBlogPosts } from '../lib/cms'
import { sortByDisplayOrder } from '../src/utils/order'
import { siteConfig } from '../src/utils/siteConfig'

export const dynamic = 'force-dynamic'

const STATIC_PATHS = ['/', '/blog', '/open-source', '/templates', '/reach-by-phone', '/now']

function toAbsolute(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${siteConfig.siteUrl}${path}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: toAbsolute(path),
    lastModified: new Date(),
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }))

  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const res = await fetchBlogPosts<{ docs?: BlogPost[] }>(200)
    const posts = sortByDisplayOrder(res?.docs || []).filter((post) => Boolean(post?.slug) && !isComingSoon(post))
    blogEntries = posts.map((post) => ({
      url: toAbsolute(`/blog/${post.slug}`),
      lastModified: post.updatedAt ? new Date(post.updatedAt) : post.publishedDate ? new Date(post.publishedDate) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.72,
    }))
  } catch (error) {
    console.error(error)
  }

  return [...baseEntries, ...blogEntries]
}
