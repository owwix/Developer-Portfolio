import Link from 'next/link'
import type { BlogPost } from '../../lib/blog'
import { formatDate, getCoverImage, getDifficulty, getReadTime, getTags, isComingSoon, toDisplayText } from '../../lib/blog'
import BlogMetaRow from './BlogMetaRow'
import TagPills from './TagPills'

export default function BlogCard({
  post,
  variant = 'preview',
}: {
  post: BlogPost
  variant?: 'preview' | 'archive'
}) {
  const href = `/blog/${post.slug}`
  const image = getCoverImage(post)
  const tags = getTags(post)
  const summaryText = toDisplayText(post.summary)
  const comingSoon = isComingSoon(post)
  const cardClassName = `blog-card card-link blog-card-${variant}${comingSoon ? ' is-coming-soon' : ''}`
  const content = (
    <>
      {image ? <img className="blog-card-image" src={image} alt={post?.coverImage?.alt || post.title || 'Article cover'} /> : null}
      <h3>{post.title || 'Untitled Article'}</h3>
      <p className="blog-card-excerpt">{summaryText || 'No summary provided yet.'}</p>
      {comingSoon ? (
        <div className="blog-meta-row">
          <span className="meta-chip">Coming Soon</span>
        </div>
      ) : (
        <BlogMetaRow date={formatDate(post.publishedDate)} difficulty={getDifficulty(post)} readTime={getReadTime(post)} />
      )}
      {post.seriesTitle ? (
        <div className="blog-meta-row">
          <span className="meta-chip">
            {post.seriesTitle}
            {post.seriesOrder ? ` · Part ${post.seriesOrder}` : ''}
          </span>
        </div>
      ) : null}
      <TagPills tags={tags.slice(0, variant === 'preview' ? 4 : 8)} />
      <div className="blog-card-cta">
        {comingSoon ? 'Coming Soon' : 'Read Article'} {!comingSoon ? <span aria-hidden="true">→</span> : null}
      </div>
    </>
  )

  if (comingSoon) {
    return <article className={cardClassName}>{content}</article>
  }

  return (
    <Link className={cardClassName} href={href}>
      {content}
    </Link>
  )
}
