import { fetchGitHubSnapshot } from '../../lib/github'

type GitHubSnapshotProps = {
  title?: string
  description?: string
  username?: string
  featuredRepos?: string[]
}

export default async function GitHubSnapshot({ title, description, username, featuredRepos = [] }: GitHubSnapshotProps) {
  const snapshot = await fetchGitHubSnapshot({
    username,
    featuredRepos,
  })

  if (!snapshot) return null

  return (
    <article className="card reveal full github-snapshot-card">
      <div className="section-head github-snapshot-head">
        <h2>{title || 'GitHub Snapshot'}</h2>
        <a className="view-all-link" href={snapshot.profileUrl} rel="noreferrer" target="_blank">
          View Profile
        </a>
      </div>
      {description ? <p className="github-snapshot-description">{description}</p> : null}

      <div className="github-metrics-grid" role="list" aria-label="GitHub account metrics">
        <div className="github-metric" role="listitem">
          <p className="github-metric-value">{snapshot.publicRepos}</p>
          <p className="github-metric-label">Public Repos</p>
        </div>
        <div className="github-metric" role="listitem">
          <p className="github-metric-value">{snapshot.followers}</p>
          <p className="github-metric-label">Followers</p>
        </div>
        <div className="github-metric" role="listitem">
          <p className="github-metric-value">{snapshot.totalStars}</p>
          <p className="github-metric-label">Total Stars</p>
        </div>
        <div className="github-metric" role="listitem">
          <p className="github-metric-value">{snapshot.totalForks}</p>
          <p className="github-metric-label">Total Forks</p>
        </div>
      </div>

      <div className="github-repo-list">
        {snapshot.repos.map((repo) => (
          <article className="github-repo-item" key={repo.id}>
            <h3>{repo.name}</h3>
            <p className="github-repo-meta">
              {repo.language || 'Code'} · ★ {repo.stars} · Forks {repo.forks}
            </p>
            <a className="view-all-link" href={repo.url} rel="noreferrer" target="_blank">
              View Repository →
            </a>
          </article>
        ))}
      </div>
    </article>
  )
}
