export default function BlogMetaRow({ date, readTime }: { date?: string; readTime?: string }) {
  return (
    <div className="blog-meta-row" aria-label="Post metadata">
      {date ? <span className="meta-chip">{date}</span> : null}
      {readTime ? <span className="meta-chip">{readTime}</span> : null}
    </div>
  )
}
