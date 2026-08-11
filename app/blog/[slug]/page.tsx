import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleBody from '../../../components/blog/ArticleBody'
import BookmarkButton from '../../../components/blog/BookmarkButton'
import BlogCard from '../../../components/blog/BlogCard'
import BlogCommandPalette from '../../../components/blog/BlogCommandPalette'
import BlogSubscribeCard from '../../../components/blog/BlogSubscribeCard'
import MobileToc from '../../../components/blog/MobileToc'
import PostAnalyticsSummary from '../../../components/blog/PostAnalyticsSummary'
import PostAnalyticsTracker from '../../../components/blog/PostAnalyticsTracker'
import ReadingProgress from '../../../components/blog/ReadingProgress'
import SectionContextNav from '../../../components/blog/SectionContextNav'
import TagPills from '../../../components/blog/TagPills'
import Toc from '../../../components/blog/Toc'
import type { BlogPost } from '../../../lib/blog'
import {
  formatDate,
  getCoverImage,
  getDifficulty,
  getPrerequisites,
  getReadTime,
  getTags,
  isComingSoon,
  parseMarkdown,
  rankRelatedPosts,
  toDisplayText,
} from '../../../lib/blog'
import { fetchBlogPostBySlug, fetchBlogPosts, fetchHome } from '../../../lib/cms'
import { sortByDisplayOrder } from '../../../src/utils/order'
import { siteConfig } from '../../../src/utils/siteConfig'

export const dynamic = 'force-dynamic'

type Params = {
  slug: string
}

type BlogDetailPageProps = {
  params: Promise<Params>
}

type HomeSettings = {
  blogCta?: {
    enabled?: boolean
    title?: string
    description?: string
    digestUrl?: string
    digestLabel?: string
  }
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchBlogPostBySlug<BlogPost>(slug)

  if (!post) {
    return {
      title: `Post Not Found | ${siteConfig.ownerName}`,
    }
  }

  return {
    title: `${post.title} | ${siteConfig.blogLabel}`,
    description: toDisplayText(post.summary) || `Technical article by ${siteConfig.ownerName}.`,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: toDisplayText(post.summary) || `Technical article by ${siteConfig.ownerName}.`,
      type: 'article',
      url: `/blog/${post.slug}`,
      images: [
        {
          url: `/blog/${post.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title || 'Blog post cover image',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title || siteConfig.blogLabel,
      description: toDisplayText(post.summary) || `Technical article by ${siteConfig.ownerName}.`,
      images: [`/blog/${post.slug}/opengraph-image`],
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
  const articleHtml = html.replace(/^<h1\b[^>]*>[\s\S]*?<\/h1>/i, '')

  let relatedPosts: BlogPost[] = []
  let commandEntries: Array<{ title: string; slug: string; summary?: string; tags?: string[] }> = []
  let seriesPosts: BlogPost[] = []
  let prevInSeries: BlogPost | null = null
  let nextInSeries: BlogPost | null = null
  let seriesPart = 0
  let home: HomeSettings | null = null
  try {
    const [allPostsRes, homeRes] = await Promise.all([fetchBlogPosts<{ docs?: BlogPost[] }>(200), fetchHome<HomeSettings>()])
    const allPosts = allPostsRes?.docs || []
    const publishedPosts = sortByDisplayOrder(allPosts.filter((entry) => Boolean(entry?.slug) && !isComingSoon(entry)))
    home = homeRes

    commandEntries = publishedPosts.map((entry) => ({
      title: String(entry.title || 'Untitled Article'),
      slug: String(entry.slug || ''),
      summary: toDisplayText(entry.summary),
      tags: getTags(entry),
    }))

    relatedPosts = rankRelatedPosts(post, publishedPosts, 3)

    const seriesName = String(post.seriesTitle || '').trim().toLowerCase()
    if (seriesName) {
      seriesPosts = publishedPosts
        .filter((entry) => String(entry.seriesTitle || '').trim().toLowerCase() === seriesName)
        .sort((a, b) => {
          const partA = Number(a.seriesOrder || 9999)
          const partB = Number(b.seriesOrder || 9999)
          if (partA !== partB) return partA - partB
          const dateA = new Date(a.publishedDate || 0).getTime()
          const dateB = new Date(b.publishedDate || 0).getTime()
          return dateA - dateB
        })

      const idx = seriesPosts.findIndex((entry) => entry.slug === post.slug)
      if (idx >= 0) {
        seriesPart = idx + 1
        prevInSeries = idx > 0 ? seriesPosts[idx - 1] : null
        nextInSeries = idx < seriesPosts.length - 1 ? seriesPosts[idx + 1] : null
      }
    }
  } catch (error) {
    console.error(error)
  }

  const coverImage = getCoverImage(post)
  const postNoun = siteConfig.blogLabel.toLowerCase().includes('note') ? 'notes' : 'posts'
  const postNounTitle = postNoun.charAt(0).toUpperCase() + postNoun.slice(1)
  const difficulty = getDifficulty(post)
  const prerequisites = getPrerequisites(post)
  const postTags = getTags(post)
  const postUrl = `${siteConfig.siteUrl}/blog/${post.slug}`
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title || siteConfig.blogLabel,
    description: summaryText || `Technical article by ${siteConfig.ownerName}.`,
    author: {
      '@type': 'Person',
      name: siteConfig.ownerName,
    },
    datePublished: post.publishedDate || undefined,
    dateModified: post.updatedAt || post.publishedDate || undefined,
    mainEntityOfPage: postUrl,
    keywords: postTags,
    articleSection: postTags[0] || undefined,
    educationalLevel: difficulty,
    image: [`${siteConfig.siteUrl}/blog/${post.slug}/opengraph-image`],
  }
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
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title || 'Article',
        item: postUrl,
      },
    ],
  }

  return (
    <>
      <ReadingProgress />
      <PostAnalyticsTracker slug={String(post.slug || '')} title={String(post.title || 'Article')} />
      <main className="container page-post">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd),
          }}
        />
        <SectionContextNav
          items={[
            { label: 'Portfolio', href: '/' },
            { label: siteConfig.blogLabel, href: '/blog' },
            { label: post.title || 'Article' },
          ]}
        />
        {commandEntries.length ? <BlogCommandPalette entries={commandEntries} /> : null}
        <header className="card post-hero reveal">
          <p className="eyebrow">Engineering Article</p>
          <h1>{post.title}</h1>
          <p className="post-meta-line">
            By {siteConfig.ownerName} · {formatDate(post.publishedDate)} · {getReadTime(post)}
          </p>
          <div className="post-learning-row">
            <span className="meta-chip">{difficulty}</span>
            {prerequisites.length ? <span className="meta-chip">{prerequisites.length} prerequisites</span> : null}
          </div>
          <PostAnalyticsSummary slug={String(post.slug || '')} />
          <TagPills className="post-tag-row" tags={postTags} />
          <div className="post-actions-row">
            <BookmarkButton slug={String(post.slug || '')} title={String(post.title || 'Untitled Article')} />
            <Link className="view-all-link" data-journey-type="contact" href="/reach-by-phone">
              Reach Out
            </Link>
          </div>
          <MobileToc items={toc} />
          {summaryText ? <p className="page-intro">{summaryText}</p> : null}
          {coverImage ? <img className="post-cover" src={coverImage} alt={post?.coverImage?.alt || post.title} /> : null}
        </header>

        {prerequisites.length ? (
          <section className="card reveal post-prerequisites-card">
            <p className="eyebrow">Before You Start</p>
            <h2>Prerequisites</h2>
            <ul>
              {prerequisites.map((item) => (
                <li key={`${post.slug}-prereq-${item}`}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {seriesPosts.length > 1 ? (
          <section className="card reveal series-nav-card">
            <p className="eyebrow">Series</p>
            <h2>{post.seriesTitle || 'Series'}</h2>
            <p className="series-nav-meta">
              Part {seriesPart || Number(post.seriesOrder || 1)} of {seriesPosts.length}
            </p>
            <div className="series-nav-links">
              {prevInSeries?.slug ? (
                <Link className="view-all-link" href={`/blog/${prevInSeries.slug}`}>
                  ← Previous: {prevInSeries.title || 'Previous Post'}
                </Link>
              ) : (
                <span className="series-nav-disabled">Start of series</span>
              )}
              {nextInSeries?.slug ? (
                <Link className="view-all-link" href={`/blog/${nextInSeries.slug}`}>
                  Next: {nextInSeries.title || 'Next Post'} →
                </Link>
              ) : (
                <span className="series-nav-disabled">End of series</span>
              )}
            </div>
          </section>
        ) : null}

        <section className="post-layout">
          <div className="post-main card reveal">
            <ArticleBody html={articleHtml} />
            <footer className="post-footer">
              <Link className="view-all-link" href="/blog">
                ← Back to all {postNoun}
              </Link>
            </footer>
          </div>

          <Toc items={toc} />
        </section>

        {home?.blogCta?.enabled !== false ? (
          <BlogSubscribeCard
            description={home?.blogCta?.description}
            digestLabel={home?.blogCta?.digestLabel}
            digestUrl={home?.blogCta?.digestUrl}
            title={home?.blogCta?.title}
          />
        ) : null}

        <section className="card reveal post-more-notes">
          <div className="section-head">
            <h2>More {postNounTitle}</h2>
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
