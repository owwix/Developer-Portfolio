import Link from 'next/link'
import type { Metadata } from 'next'
import ArchiveFilters from '../../components/blog/ArchiveFilters'
import BlogCommandPalette from '../../components/blog/BlogCommandPalette'
import ReadingListPanel from '../../components/blog/ReadingListPanel'
import SectionContextNav from '../../components/blog/SectionContextNav'
import type { BlogPost } from '../../lib/blog'
import { getTags, isComingSoon, toDisplayText } from '../../lib/blog'
import { fetchBlogPosts } from '../../lib/cms'
import { sortByDisplayOrder } from '../../src/utils/order'
import { siteConfig } from '../../src/utils/siteConfig'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `${siteConfig.blogLabel} | ${siteConfig.ownerName}`,
  description: `Engineering notes, technical writeups, deployment lessons, and project breakdowns from ${siteConfig.ownerName}.`,
}

export default async function BlogArchivePage() {
  let posts: BlogPost[] = []

  try {
    const res = await fetchBlogPosts<{ docs?: BlogPost[] }>(200)
    posts = sortByDisplayOrder(res?.docs || [])
  } catch (error) {
    console.error(error)
  }

  const commandEntries = posts
    .filter((post) => Boolean(post?.slug) && !isComingSoon(post))
    .map((post) => ({
      title: String(post.title || 'Untitled Article'),
      slug: String(post.slug || ''),
      summary: toDisplayText(post.summary),
      tags: getTags(post),
    }))

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Portfolio',
        item: siteConfig.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: siteConfig.blogLabel,
        item: `${siteConfig.siteUrl}/blog`,
      },
    ],
  }

  return (
    <main className="container page-blog">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <SectionContextNav items={[{ label: 'Portfolio', href: '/' }, { label: siteConfig.blogLabel }]} />
      {commandEntries.length ? <BlogCommandPalette entries={commandEntries} /> : null}
      {commandEntries.length ? <ReadingListPanel posts={commandEntries.map((entry) => ({ slug: entry.slug, title: entry.title }))} /> : null}
      <header className="card page-hero reveal">
        <p className="eyebrow">Engineering Journal</p>
        <h1>{siteConfig.blogLabel}</h1>
        <p className="page-intro">
          Technical writeups covering engineering decisions, architecture tradeoffs, deployment lessons, and build logs from
          real projects.
        </p>
        <Link className="view-all-link" href="/">
          ← Back to Portfolio
        </Link>
      </header>

      {posts.length ? (
        <ArchiveFilters posts={posts} />
      ) : (
        <section className="card reveal">
          <p className="empty-state">No posts yet. Publish your first technical note from Payload admin.</p>
        </section>
      )}
    </main>
  )
}
