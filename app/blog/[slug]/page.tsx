import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleBody from '../../../components/blog/ArticleBody'
import BlogCard from '../../../components/blog/BlogCard'
import ReadingProgress from '../../../components/blog/ReadingProgress'
import SectionContextNav from '../../../components/blog/SectionContextNav'
import TagPills from '../../../components/blog/TagPills'
import Toc from '../../../components/blog/Toc'
import type { BlogPost } from '../../../lib/blog'
import { formatDate, getCoverImage, getReadTime, getTags, isComingSoon, parseMarkdown, toDisplayText } from '../../../lib/blog'
import { fetchBlogPostBySlug, fetchBlogPosts } from '../../../lib/cms'

export const dynamic = 'force-dynamic'

type Params = {
  slug: string
}

type BlogDetailPageProps = {
  params: Promise<Params>
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchBlogPostBySlug<BlogPost>(slug)

  if (!post) {
    return {
      title: 'Post Not Found | Alexander Okonkwo',
    }
  }

  return {
    title: `${post.title} | Lab / Notes`,
    description: toDisplayText(post.summary) || 'Technical article by Alexander Okonkwo.',
    openGraph: {
      title: post.title,
      description: toDisplayText(post.summary) || 'Technical article by Alexander Okonkwo.',
      type: 'article',
      url: `/blog/${post.slug}`,
    },
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const post = await fetchBlogPostBySlug<BlogPost>(slug)
  if (!post) notFound()
  if (isComingSoon(post)) notFound()
  const summaryText = toDisplayText(post.summary)
  const bodySource = typeof post.content === 'string' ? post.content : toDisplayText(post.content) || summaryText

  const { html, toc } = parseMarkdown(bodySource)

  let relatedPosts: BlogPost[] = []
  try {
    const allPosts = (await fetchBlogPosts<{ docs?: BlogPost[] }>(20))?.docs || []
    const activeTags = new Set(getTags(post))

    relatedPosts = allPosts
      .filter((entry) => entry.slug !== post.slug)
      .map((entry) => {
        const overlap = getTags(entry).filter((tag) => activeTags.has(tag)).length
        return { entry, overlap }
      })
      .sort((a, b) => b.overlap - a.overlap)
      .map((item) => item.entry)
      .slice(0, 3)
  } catch (error) {
    console.error(error)
  }

  const coverImage = getCoverImage(post)

  return (
    <>
      <ReadingProgress />
      <main className="container page-post">
        <SectionContextNav
          items={[
            { label: 'Portfolio', href: '/' },
            { label: 'Lab / Notes', href: '/blog' },
            { label: post.title || 'Article' },
          ]}
        />
        <header className="card post-hero reveal">
          <p className="eyebrow">Engineering Article</p>
          <h1>{post.title}</h1>
          <p className="post-meta-line">By Alexander Okonkwo · {formatDate(post.publishedDate)} · {getReadTime(post)}</p>
          <TagPills className="post-tag-row" tags={getTags(post)} />
          {summaryText ? <p className="page-intro">{summaryText}</p> : null}
          {coverImage ? <img className="post-cover" src={coverImage} alt={post?.coverImage?.alt || post.title} /> : null}
        </header>

        <section className="post-layout">
          <div className="post-main card reveal">
            <ArticleBody html={html} />
            <footer className="post-footer">
              <Link className="view-all-link" href="/blog">
                ← Back to all notes
              </Link>
            </footer>
          </div>

          <Toc items={toc} />
        </section>

        <section className="card reveal">
          <div className="section-head">
            <h2>More Notes</h2>
            <Link className="view-all-link" href="/blog">
              Browse Archive
            </Link>
          </div>
          {relatedPosts.length ? (
            <div className="blog-grid archive-grid">
              {relatedPosts.map((entry) => (
                <BlogCard key={entry.id || entry.slug} post={entry} variant="archive" />
              ))}
            </div>
          ) : (
            <p className="empty-state">No related posts yet.</p>
          )}
        </section>
      </main>
    </>
  )
}
