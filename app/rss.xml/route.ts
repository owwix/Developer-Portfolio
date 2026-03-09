import { fetchBlogPosts } from '../../lib/cms'
import type { BlogPost } from '../../lib/blog'
import { isComingSoon, parseMarkdown, toDisplayText } from '../../lib/blog'
import { sortByDisplayOrder } from '../../src/utils/order'
import { siteConfig } from '../../src/utils/siteConfig'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function escapeXML(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toRFC822(value?: string): string {
  if (!value) return new Date().toUTCString()
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return new Date().toUTCString()
  return date.toUTCString()
}

function safeCDATA(value: string): string {
  return String(value || '').replace(/]]>/g, ']]]]><![CDATA[>')
}

export async function GET() {
  let posts: BlogPost[] = []

  try {
    const res = await fetchBlogPosts<{ docs?: BlogPost[] }>(200)
    posts = sortByDisplayOrder(res?.docs || [])
      .filter((post) => Boolean(post?.slug) && !isComingSoon(post))
      .slice(0, 50)
  } catch (error) {
    console.error(error)
  }

  const items = posts
    .map((post) => {
      const title = String(post.title || 'Untitled Article')
      const slug = String(post.slug || '').trim()
      if (!slug) return ''

      const summary = toDisplayText(post.summary)
      const contentSource = typeof post.content === 'string' ? post.content : toDisplayText(post.content)
      const parsedContent = contentSource ? parseMarkdown(contentSource).html : ''
      const link = `${siteConfig.siteUrl}/blog/${slug}`

      return `
      <item>
        <title>${escapeXML(title)}</title>
        <link>${escapeXML(link)}</link>
        <guid isPermaLink="true">${escapeXML(link)}</guid>
        <pubDate>${toRFC822(post.publishedDate || post.createdAt)}</pubDate>
        <description><![CDATA[${safeCDATA(summary || '')}]]></description>
        <content:encoded><![CDATA[${safeCDATA(parsedContent || '')}]]></content:encoded>
      </item>`
    })
    .filter(Boolean)
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXML(`${siteConfig.ownerName} · ${siteConfig.blogLabel}`)}</title>
    <link>${escapeXML(`${siteConfig.siteUrl}/blog`)}</link>
    <description>${escapeXML(`Engineering notes and build logs from ${siteConfig.ownerName}.`)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=1800, stale-while-revalidate=86400',
    },
  })
}
