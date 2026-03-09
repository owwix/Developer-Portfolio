import type { OpenSourceResource } from '../../lib/openSource'

const actions: Array<{
  key: keyof NonNullable<OpenSourceResource['links']>
  label: string
}> = [
  { key: 'github', label: 'View GitHub' },
  { key: 'template', label: 'Use Template' },
  { key: 'docs', label: 'Documentation' },
  { key: 'demo', label: 'Live Demo' },
]

function statusClass(status: NonNullable<OpenSourceResource['status']>): string {
  return status.toLowerCase().replace(/\s+/g, '-')
}

type OpenSourceCardProps = {
  resource: OpenSourceResource
  variant?: 'preview' | 'detail'
}

export default function OpenSourceCard({ resource, variant = 'preview' }: OpenSourceCardProps) {
  const availableActions = actions.filter((action) => Boolean(resource.links?.[action.key]))
  const hasGitHubMeta = typeof resource.githubStars === 'number' || typeof resource.githubForks === 'number'

  return (
    <article className={`open-source-card is-${variant}`.trim()}>
      <header className="open-source-card-head">
        <div className="open-source-title-wrap">
          <span aria-hidden="true" className="open-source-marker">
            {resource.marker || 'OS'}
          </span>
          <h3>{resource.title}</h3>
        </div>
        {resource.status ? <span className={`open-source-status is-${statusClass(resource.status)}`}>{resource.status}</span> : null}
      </header>

      <p className="open-source-description">{resource.description}</p>

      <div className="open-source-stack" role="list" aria-label={`${resource.title} tech stack`}>
        {resource.stack.map((tech) => (
          <span className="tag-pill" key={`${resource.id}-${tech}`} role="listitem">
            {tech}
          </span>
        ))}
      </div>

      {hasGitHubMeta ? (
        <p className="open-source-repo-meta">
          {typeof resource.githubStars === 'number' ? `Stars ${resource.githubStars}` : ''}
          {typeof resource.githubStars === 'number' && typeof resource.githubForks === 'number' ? ' · ' : ''}
          {typeof resource.githubForks === 'number' ? `Forks ${resource.githubForks}` : ''}
        </p>
      ) : null}

      {availableActions.length ? (
        <div className="open-source-actions">
          {availableActions.map((action) => (
            <a
              className="open-source-action"
              href={resource.links?.[action.key]}
              key={`${resource.id}-${action.key}`}
              rel="noreferrer"
              target="_blank"
            >
              {action.label}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  )
}
