import Link from 'next/link'
import type { Metadata } from 'next'
import ArchiveFilters from '../../components/blog/ArchiveFilters'
import type { BlogPost } from '../../lib/blog'
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

  return (
    <main className="container page-blog">
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
