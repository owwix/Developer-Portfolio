export default function BlogMetaRow({ date, readTime, difficulty }: { date?: string; readTime?: string; difficulty?: string }) {
  return (
    <div className="blog-meta-row" aria-label="Post metadata">
      {date ? <span className="meta-chip">{date}</span> : null}
      {readTime ? <span className="meta-chip">{readTime}</span> : null}
      {difficulty ? <span className="meta-chip">{difficulty}</span> : null}
    </div>
  )
}
