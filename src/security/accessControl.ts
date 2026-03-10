import type { Request } from 'express'
import net from 'node:net'

type RouteRule = {
  path: string
  methods: string[]
}

type AccessDecision = {
  allowed: boolean
  status: number
  reason: string
}

const SAFE_PUBLIC_METHODS = ['GET', 'HEAD', 'OPTIONS']

// Public read endpoints needed by the frontend.
const DEFAULT_PUBLIC_API_RULES: RouteRule[] = [
  { path: '/api/projects', methods: SAFE_PUBLIC_METHODS },
  { path: '/api/skills', methods: SAFE_PUBLIC_METHODS },
  { path: '/api/experiences', methods: SAFE_PUBLIC_METHODS },
  { path: '/api/open-source-resources', methods: SAFE_PUBLIC_METHODS },
  { path: '/api/blog-posts', methods: SAFE_PUBLIC_METHODS },
  { path: '/api/globals/home', methods: SAFE_PUBLIC_METHODS },
  { path: '/api/globals/now', methods: SAFE_PUBLIC_METHODS },
  { path: '/api/media', methods: SAFE_PUBLIC_METHODS },
  // Intentionally public write endpoints for frontend UX signals and contact flow.
  { path: '/api/phone-requests', methods: ['POST', 'OPTIONS'] },
  { path: '/api/blog/analytics', methods: ['GET', 'POST', 'OPTIONS'] },
  { path: '/api/journey/analytics', methods: ['POST', 'OPTIONS'] },
]

function normalizePath(input: string): string {
  const path = String(input || '').trim()
  if (!path) return '/'
  if (!path.startsWith('/')) return `/${path}`
  return path
}

function parseCSV(value: string | undefined): string[] {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeIP(ip: string): string {
  const value = String(ip || '').trim().toLowerCase()
  if (!value) return ''

  // Express/Node may expose IPv4 as IPv6-mapped addresses.
  if (value.startsWith('::ffff:')) {
    const mapped = value.slice('::ffff:'.length)
    if (net.isIP(mapped) === 4) return mapped
  }

  return value
}

function getRequestIP(req: Request): string {
  const cloudflareIP = normalizeIP(String(req.header('cf-connecting-ip') || ''))
  if (cloudflareIP) return cloudflareIP

  const forwarded = String(req.header('x-forwarded-for') || '')
  const firstForwarded = normalizeIP(forwarded.split(',')[0] || '')
  if (firstForwarded) return firstForwarded

  return normalizeIP(String(req.ip || ''))
}

function toIPv4Int(ip: string): number | null {
  if (net.isIP(ip) !== 4) return null

  const parts = ip.split('.').map((part) => Number(part))
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return null
  }

  return (((parts[0] * 256 + parts[1]) * 256 + parts[2]) * 256 + parts[3]) >>> 0
}

function isIPv4InCIDR(ip: string, cidr: string): boolean {
  const [rawBase, rawPrefix] = cidr.split('/')
  const prefix = Number(rawPrefix)
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false

  const ipInt = toIPv4Int(normalizeIP(ip))
  const baseInt = toIPv4Int(normalizeIP(rawBase || ''))
  if (ipInt === null || baseInt === null) return false

  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  return (ipInt & mask) === (baseInt & mask)
}

function isAllowedIP(req: Request): boolean {
  const allowedIPs = parseCSV(process.env.CLOUDFLARE_ACCESS_ALLOWED_IPS)
    .map((entry) => normalizeIP(entry))
    .filter(Boolean)

  if (!allowedIPs.length) return false

  const requestIP = getRequestIP(req)
  if (!requestIP) return false

  for (const allowedIP of allowedIPs) {
    if (allowedIP === requestIP) return true
    if (allowedIP.includes('/') && isIPv4InCIDR(requestIP, allowedIP)) return true
  }

  return false
}

function parseRouteRule(rule: string): RouteRule | null {
  const [pathPart, methodsPart] = rule.split('|').map((item) => item.trim())
  const path = normalizePath(pathPart || '')
  if (!path || path === '/') return null

  const methods = methodsPart
    ? methodsPart
        .split(':')
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean)
    : SAFE_PUBLIC_METHODS

  if (!methods.length) return null
  return { path, methods }
}

function matchPath(rulePath: string, pathname: string): boolean {
  if (rulePath.endsWith('*')) {
    const prefix = rulePath.slice(0, -1)
    return pathname.startsWith(prefix)
  }
  return pathname === rulePath || pathname.startsWith(`${rulePath}/`)
}

function isPublicAPIRequest(pathname: string, method: string): boolean {
  const baseRules = [...DEFAULT_PUBLIC_API_RULES]
  const customRules = parseCSV(process.env.CLOUDFLARE_ACCESS_PUBLIC_API_ROUTES)
    .map((entry) => parseRouteRule(entry))
    .filter((entry): entry is RouteRule => Boolean(entry))

  for (const rule of [...baseRules, ...customRules]) {
    if (matchPath(rule.path, pathname) && rule.methods.includes(method)) return true
  }

  return false
}

function getLowerHeader(req: Request, header: string): string {
  return String(req.header(header) || '').trim().toLowerCase()
}

function isCloudflareIdentityPresent(req: Request): boolean {
  const jwtAssertion = getLowerHeader(req, 'cf-access-jwt-assertion')
  if (jwtAssertion) return true

  const expectedClientId = String(process.env.CLOUDFLARE_ACCESS_CLIENT_ID || '').trim()
  const expectedClientSecret = String(process.env.CLOUDFLARE_ACCESS_CLIENT_SECRET || '').trim()
  if (!expectedClientId || !expectedClientSecret) return false

  const incomingClientId = String(req.header('cf-access-client-id') || '').trim()
  const incomingClientSecret = String(req.header('cf-access-client-secret') || '').trim()
  return incomingClientId === expectedClientId && incomingClientSecret === expectedClientSecret
}

function isAllowedEmail(req: Request): boolean {
  const allowedEmails = parseCSV(process.env.CLOUDFLARE_ACCESS_ALLOWED_EMAILS).map((email) => email.toLowerCase())
  const allowedDomains = parseCSV(process.env.CLOUDFLARE_ACCESS_ALLOWED_EMAIL_DOMAINS).map((domain) =>
    domain.toLowerCase().replace(/^@/, ''),
  )

  if (!allowedEmails.length && !allowedDomains.length) return true

  const email = getLowerHeader(req, 'cf-access-authenticated-user-email')
  if (!email) return false

  if (allowedEmails.includes(email)) return true
  const domain = email.split('@')[1] || ''
  return Boolean(domain) && allowedDomains.includes(domain)
}

export function shouldProtectRequest(pathname: string, method: string): boolean {
  const path = normalizePath(pathname)
  const normalizedMethod = String(method || 'GET').toUpperCase()

  if (path === '/admin' || path.startsWith('/admin/')) return true

  if (path === '/api' || path.startsWith('/api/')) {
    return !isPublicAPIRequest(path, normalizedMethod)
  }

  return false
}

export function evaluateCloudflareAccess(req: Request): AccessDecision {
  const enabled = String(process.env.CLOUDFLARE_ACCESS_ENABLED || '').trim() === '1'
  if (!enabled) return { allowed: true, status: 200, reason: 'disabled' }

  if (isAllowedIP(req)) {
    return { allowed: true, status: 200, reason: 'allowed-ip' }
  }

  if (!isCloudflareIdentityPresent(req)) {
    return { allowed: false, status: 401, reason: 'Missing Cloudflare Access identity headers.' }
  }

  if (!isAllowedEmail(req)) {
    return { allowed: false, status: 403, reason: 'Cloudflare Access identity is not in the allowed list.' }
  }

  return { allowed: true, status: 200, reason: 'ok' }
}
