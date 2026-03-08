export default function TagPills({ tags = [], className = '' }: { tags?: string[]; className?: string }) {
  if (!tags.length) return null

  return (
    <div className={`tag-row ${className}`.trim()}>
      {tags.map((tag) => (
        <span className="tag-pill" key={tag}>
          {tag}
        </span>
      ))}
    </div>
  )
}
