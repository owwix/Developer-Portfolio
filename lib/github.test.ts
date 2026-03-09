import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchGitHubSnapshot } from './github'

function jsonResponse(payload: unknown, ok = true): Response {
  return {
    ok,
    json: async () => payload,
  } as Response
}

describe('fetchGitHubSnapshot', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns null when username is missing', async () => {
    const result = await fetchGitHubSnapshot({ username: '' })
    expect(result).toBeNull()
  })

  it('builds a snapshot from GitHub API responses', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          login: 'owwix',
          html_url: 'https://github.com/owwix',
          followers: 12,
          following: 3,
          public_repos: 7,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: 1,
            name: 'alpha',
            full_name: 'owwix/alpha',
            html_url: 'https://github.com/owwix/alpha',
            stargazers_count: 9,
            forks_count: 2,
            language: 'TypeScript',
          },
          {
            id: 2,
            name: 'beta',
            full_name: 'owwix/beta',
            html_url: 'https://github.com/owwix/beta',
            stargazers_count: 3,
            forks_count: 1,
            language: 'JavaScript',
          },
        ]),
      )

    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchGitHubSnapshot({ username: 'owwix' })

    expect(result).not.toBeNull()
    expect(result?.username).toBe('owwix')
    expect(result?.publicRepos).toBe(7)
    expect(result?.totalStars).toBe(12)
    expect(result?.totalForks).toBe(3)
    expect(result?.repos.length).toBeGreaterThan(0)
    expect(result?.repos[0].fullName).toBe('owwix/alpha')
  })

  it('honors featured repo selection', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          login: 'owwix',
          html_url: 'https://github.com/owwix',
          followers: 12,
          following: 3,
          public_repos: 7,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: 1,
            name: 'alpha',
            full_name: 'owwix/alpha',
            html_url: 'https://github.com/owwix/alpha',
            stargazers_count: 9,
            forks_count: 2,
            language: 'TypeScript',
          },
          {
            id: 2,
            name: 'beta',
            full_name: 'owwix/beta',
            html_url: 'https://github.com/owwix/beta',
            stargazers_count: 3,
            forks_count: 1,
            language: 'JavaScript',
          },
        ]),
      )

    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchGitHubSnapshot({ username: 'owwix', featuredRepos: ['beta'] })

    expect(result).not.toBeNull()
    expect(result?.repos).toHaveLength(1)
    expect(result?.repos[0].fullName).toBe('owwix/beta')
  })
})
