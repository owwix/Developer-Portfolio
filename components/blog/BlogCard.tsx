import Link from 'next/link'
import type { BlogPost } from '../../lib/blog'
import { formatDate, getCoverImage, getReadTime, getTags } from '../../lib/blog'
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

  return (
    <Link className={`blog-card card-link blog-card-${variant}`} href={href}>
      {image ? <img className="blog-card-image" src={image} alt={post?.coverImage?.alt || post.title || 'Article cover'} /> : null}
      <h3>{post.title || 'Untitled Article'}</h3>
      <p className="blog-card-excerpt">{post.summary || 'No summary provided yet.'}</p>
      <BlogMetaRow date={formatDate(post.publishedDate)} readTime={getReadTime(post)} />
      <TagPills tags={tags.slice(0, variant === 'preview' ? 4 : 8)} />
      <div className="blog-card-cta">Read Article <span aria-hidden="true">→</span></div>
    </Link>
  )
}
