import Link from 'next/link'
import type { Metadata } from 'next'
import ArchiveFilters from '../../components/blog/ArchiveFilters'
import BlogCommandPalette from '../../components/blog/BlogCommandPalette'
import ReadingListPanel from '../../components/blog/ReadingListPanel'
import SectionContextNav from '../../components/blog/SectionContextNav'
import type { BlogPost } from '../../lib/blog'
import { getTags, isComingSoon, toDisplayText } from '../../lib/blog'
import { fetchBlogPosts } from '../../lib/cms'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Lab / Notes | Alexander Okonkwo',
  description: 'Engineering notes, technical writeups, deployment lessons, and project breakdowns from Alexander Okonkwo.',
}

export default async function BlogArchivePage() {
  let posts: BlogPost[] = []

  try {
    const res = await fetchBlogPosts<{ docs?: BlogPost[] }>(200)
    posts = res?.docs || []
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
        item: 'https://www.alexok.dev',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Lab / Notes',
        item: 'https://www.alexok.dev/blog',
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
      <SectionContextNav items={[{ label: 'Portfolio', href: '/' }, { label: 'Lab / Notes' }]} />
      {commandEntries.length ? <BlogCommandPalette entries={commandEntries} /> : null}
      {commandEntries.length ? <ReadingListPanel posts={commandEntries.map((entry) => ({ slug: entry.slug, title: entry.title }))} /> : null}
      <header className="card page-hero reveal">
        <p className="eyebrow">Engineering Journal</p>
        <h1>Lab / Notes</h1>
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
