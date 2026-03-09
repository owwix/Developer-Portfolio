export type GitHubRepoSnapshot = {
  id: number
  name: string
  fullName: string
  url: string
  stars: number
  forks: number
  language: string
}

export type GitHubSnapshot = {
  username: string
  profileUrl: string
  followers: number
  following: number
  publicRepos: number
  totalStars: number
  totalForks: number
  repos: GitHubRepoSnapshot[]
}

type GitHubUserResponse = {
  login?: string
  html_url?: string
  followers?: number
  following?: number
  public_repos?: number
}

type GitHubRepoResponse = {
  id?: number
  name?: string
  full_name?: string
  html_url?: string
  stargazers_count?: number
  forks_count?: number
  language?: string | null
  owner?: {
    login?: string
  }
}

const GITHUB_API_BASE = 'https://api.github.com'

function toPositiveInt(value: unknown): number {
  const num = Number(value)
  if (!Number.isFinite(num) || num < 0) return 0
  return Math.floor(num)
}

function normalizeRepoRef(value: string, username: string): string {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  if (trimmed.includes('/')) return trimmed.toLowerCase()
  return `${username}/${trimmed}`.toLowerCase()
}

function toRepoSnapshot(repo: GitHubRepoResponse): GitHubRepoSnapshot | null {
  const id = toPositiveInt(repo.id)
  const name = String(repo.name || '').trim()
  const fullName = String(repo.full_name || '').trim()
  const url = String(repo.html_url || '').trim()
  if (!id || !name || !fullName || !url) return null

  return {
    id,
    name,
    fullName,
    url,
    stars: toPositiveInt(repo.stargazers_count),
    forks: toPositiveInt(repo.forks_count),
    language: String(repo.language || '').trim(),
  }
}

async function fetchGitHubJSON<T>(path: string): Promise<T | null> {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_API_TOKEN
  const res = await fetch(`${GITHUB_API_BASE}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: 60 * 30 },
  }).catch(() => null)

  if (!res || !res.ok) return null
  return (await res.json()) as T
}

export async function fetchGitHubSnapshot(input: { username?: string; featuredRepos?: string[] }): Promise<GitHubSnapshot | null> {
  const username = String(input.username || '').trim().replace(/^@/, '')
  if (!username) return null

  const [user, repos] = await Promise.all([
    fetchGitHubJSON<GitHubUserResponse>(`/users/${encodeURIComponent(username)}`),
    fetchGitHubJSON<GitHubRepoResponse[]>(
      `/users/${encodeURIComponent(username)}/repos?type=owner&sort=updated&per_page=100&page=1`,
    ),
  ])

  if (!user || !repos || !Array.isArray(repos)) return null

  const normalizedRepos = repos
    .map((repo) => toRepoSnapshot(repo))
    .filter((repo): repo is GitHubRepoSnapshot => Boolean(repo))

  if (!normalizedRepos.length) return null

  const featuredRefs = (input.featuredRepos || []).map((repo) => normalizeRepoRef(repo, username)).filter(Boolean)
  const featured = featuredRefs
    .map((ref) => normalizedRepos.find((repo) => repo.fullName.toLowerCase() === ref))
    .filter((repo): repo is GitHubRepoSnapshot => Boolean(repo))

  const selectedRepos = featured.length
    ? featured
    : [...normalizedRepos].sort((a, b) => (b.stars !== a.stars ? b.stars - a.stars : b.forks - a.forks)).slice(0, 3)

  const totalStars = normalizedRepos.reduce((sum, repo) => sum + repo.stars, 0)
  const totalForks = normalizedRepos.reduce((sum, repo) => sum + repo.forks, 0)

  return {
    username: String(user.login || username),
    profileUrl: String(user.html_url || `https://github.com/${username}`),
    followers: toPositiveInt(user.followers),
    following: toPositiveInt(user.following),
    publicRepos: toPositiveInt(user.public_repos),
    totalStars,
    totalForks,
    repos: selectedRepos,
  }
}
