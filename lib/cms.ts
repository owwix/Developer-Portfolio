const LOCAL_BASE_URL = `http://127.0.0.1:${process.env.PORT || 3000}`
const BASE_URL = process.env.PAYLOAD_INTERNAL_SERVER_URL || LOCAL_BASE_URL

const normalizeBase = (url: string): string => String(url || '').replace(/\/$/, '')

type FetchOptions = {
  authToken?: string
  disableCache?: boolean
  timeoutMs?: number
} & RequestInit

type BlogFetchOptions = {
  draft?: boolean
  authToken?: string
}

export async function fetchCMS<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const { authToken, disableCache, headers, timeoutMs = 8000, ...rest } = options
  const url = `${normalizeBase(BASE_URL)}${path}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const res = await fetch(url, {
    cache: disableCache ? 'no-store' : 'no-store',
    headers: {
      ...(headers || {}),
      ...(authToken ? { Authorization: `JWT ${authToken}` } : {}),
    },
    signal: controller.signal,
    ...rest,
  }).finally(() => {
    clearTimeout(timer)
  })

  if (!res.ok) {
    throw new Error(`CMS request failed (${res.status}): ${path}`)
  }

  return res.json() as Promise<T>
}

export async function fetchHome<T = unknown>(): Promise<T> {
  return fetchCMS<T>('/api/globals/home?depth=2')
}

export async function fetchNow<T = unknown>(): Promise<T> {
  return fetchCMS<T>('/api/globals/now?depth=2')
}

export async function fetchProjects<T = unknown>(limit = 6): Promise<T> {
  return fetchCMS<T>(`/api/projects?depth=2&limit=${limit}&sort=-startDate`)
}

export async function fetchOpenSourceResources<T = unknown>(limit = 100): Promise<T> {
  return fetchCMS<T>(`/api/open-source-resources?depth=1&limit=${limit}`)
}

export async function fetchSkills<T = unknown>(limit = 100): Promise<T> {
  return fetchCMS<T>(`/api/skills?limit=${limit}`)
}

export async function fetchExperiences<T = unknown>(limit = 10): Promise<T> {
  return fetchCMS<T>(`/api/experiences?limit=${limit}&sort=-startDate`)
}

export async function fetchBlogPosts<T = unknown>(limit = 100, options: BlogFetchOptions = {}): Promise<T> {
  const query = new URLSearchParams({
    depth: '2',
    limit: String(limit),
    sort: '-publishedDate',
  })

  if (options.draft) {
    query.set('draft', 'true')
  }

  return fetchCMS<T>(`/api/blog-posts?${query.toString()}`, {
    authToken: options.authToken,
  })
}

export async function fetchBlogPostBySlug<T = unknown>(slug: string, options: BlogFetchOptions = {}): Promise<T | null> {
  const query = new URLSearchParams({
    depth: '2',
    limit: '1',
    'where[slug][equals]': slug,
  })

  if (options.draft) {
    query.set('draft', 'true')
  }

  const response = await fetchCMS<{ docs?: T[] }>(`/api/blog-posts?${query.toString()}`, {
    authToken: options.authToken,
  })

  return response?.docs?.[0] || null
}
