type TagTone = 'framework' | 'language' | 'platform' | 'ops' | 'topic' | 'default'

function getTagTone(tag: string): TagTone {
  const value = String(tag || '').trim().toLowerCase()
  if (!value) return 'default'

  if (/(next\.js|react|vue|svelte|angular|tailwind)/.test(value)) return 'framework'
  if (/(typescript|javascript|python|java|go|rust|sql)/.test(value)) return 'language'
  if (/(payload|node\.js|nodejs|postgres|postgresql|mongodb|cloudflare|railway|vercel|aws|gcp|azure)/.test(value))
    return 'platform'
  if (/(security|deployment|devops|infrastructure|cloud|ci\/cd|ops)/.test(value)) return 'ops'
  if (/(engineering notes|portfolio|frontend|backend|full stack|design|product)/.test(value)) return 'topic'

  return 'default'
}

export default function TagPills({ tags = [], className = '' }: { tags?: string[]; className?: string }) {
  if (!tags.length) return null

  return (
    <div className={`tag-row ${className}`.trim()}>
      {tags.map((tag) => (
        <span className={`tag-pill tag-pill-${getTagTone(tag)}`} key={tag}>
          {tag}
        </span>
      ))}
    </div>
  )
}
