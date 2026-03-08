const BASE_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || `http://localhost:${process.env.PORT || 3000}`

const normalizeBase = (url: string): string => String(url || '').replace(/\/$/, '')

export async function fetchCMS<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${normalizeBase(BASE_URL)}${path}`
  const res = await fetch(url, {
    cache: 'no-store',
    ...options,
  })

  if (!res.ok) {
    throw new Error(`CMS request failed (${res.status}): ${path}`)
  }

  return res.json() as Promise<T>
}

export async function fetchHome<T = unknown>(): Promise<T> {
  return fetchCMS<T>('/api/globals/home?depth=2')
}

export async function fetchProjects<T = unknown>(limit = 6): Promise<T> {
  return fetchCMS<T>(`/api/projects?depth=2&limit=${limit}&sort=-startDate`)
}

export async function fetchSkills<T = unknown>(limit = 100): Promise<T> {
  return fetchCMS<T>(`/api/skills?limit=${limit}`)
}

export async function fetchExperiences<T = unknown>(limit = 10): Promise<T> {
  return fetchCMS<T>(`/api/experiences?limit=${limit}&sort=-startDate`)
}

export async function fetchBlogPosts<T = unknown>(limit = 100): Promise<T> {
  return fetchCMS<T>(`/api/blog-posts?depth=2&limit=${limit}&sort=-publishedDate`)
}

export async function fetchBlogPostBySlug<T = unknown>(slug: string): Promise<T | null> {
  const safeSlug = encodeURIComponent(slug)
  const response = await fetchCMS<{ docs?: T[] }>(`/api/blog-posts?depth=2&limit=1&where[slug][equals]=${safeSlug}`)
  return response?.docs?.[0] || null
}
