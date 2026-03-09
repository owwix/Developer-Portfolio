const normalizeUrl = (value?: string): string => {
  if (!value) return 'https://example.dev'
  return value.replace(/\/$/, '')
}

const env: Record<string, string | undefined> = typeof process !== 'undefined' ? process.env : {}

const createMonogram = (value: string): string => {
  const cleaned = String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!cleaned.length) return 'CMS'
  if (cleaned.length === 1) return cleaned[0].slice(0, 2).toUpperCase()
  return `${cleaned[0][0] || ''}${cleaned[1][0] || ''}`.toUpperCase()
}

const ownerName = env.SITE_OWNER_NAME || env.NEXT_PUBLIC_SITE_OWNER_NAME || 'Your Name'
const ownerRole = env.SITE_OWNER_ROLE || env.NEXT_PUBLIC_SITE_OWNER_ROLE || 'Software Engineer'
const siteUrl = normalizeUrl(env.SITE_URL || env.NEXT_PUBLIC_SITE_URL || env.PAYLOAD_PUBLIC_SERVER_URL)

const blogLabel = env.SITE_BLOG_LABEL || env.NEXT_PUBLIC_SITE_BLOG_LABEL || 'Lab / Notes'
const cmsTitle = env.CMS_TITLE || env.NEXT_PUBLIC_CMS_TITLE || `${ownerName} CMS`
const cmsSubtitle = env.CMS_SUBTITLE || env.NEXT_PUBLIC_CMS_SUBTITLE || 'Editorial Control Center'
const cmsMonogram = env.CMS_MONOGRAM || env.NEXT_PUBLIC_CMS_MONOGRAM || createMonogram(ownerName)

export const siteConfig = {
  ownerName,
  ownerRole,
  siteUrl,
  blogLabel,
  cmsTitle,
  cmsSubtitle,
  cmsMonogram,
}

export const siteMetadata = {
  title: `${siteConfig.ownerName} | ${siteConfig.ownerRole}`,
  description: `Portfolio of ${siteConfig.ownerName}, a ${siteConfig.ownerRole.toLowerCase()} sharing engineering notes, technical writeups, and project build logs.`,
}
