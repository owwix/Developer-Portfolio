import type { Request } from 'express'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { evaluateCloudflareAccess, shouldProtectRequest } from './accessControl'

function mockReq({
  path = '/',
  method = 'GET',
  ip = '',
  headers = {},
}: {
  path?: string
  method?: string
  ip?: string
  headers?: Record<string, string>
}): Request {
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
  return {
    path,
    method,
    ip,
    header(name: string) {
      return lower[name.toLowerCase()]
    },
  } as unknown as Request
}

describe('shouldProtectRequest', () => {
  it('protects admin and non-public api routes', () => {
    expect(shouldProtectRequest('/admin', 'GET')).toBe(true)
    expect(shouldProtectRequest('/admin/collections/blog-posts', 'GET')).toBe(true)
    expect(shouldProtectRequest('/api/users/login', 'POST')).toBe(true)
  })

  it('keeps public read endpoints open', () => {
    expect(shouldProtectRequest('/api/projects', 'GET')).toBe(false)
    expect(shouldProtectRequest('/api/blog-posts', 'GET')).toBe(false)
    expect(shouldProtectRequest('/api/globals/home', 'GET')).toBe(false)
  })

  it('keeps explicitly public write endpoints open', () => {
    expect(shouldProtectRequest('/api/phone-requests', 'POST')).toBe(false)
    expect(shouldProtectRequest('/api/blog/analytics', 'POST')).toBe(false)
    expect(shouldProtectRequest('/api/journey/analytics', 'POST')).toBe(false)
  })

  it('protects non-whitelisted methods on public paths', () => {
    expect(shouldProtectRequest('/api/blog-posts', 'POST')).toBe(true)
  })
})

describe('evaluateCloudflareAccess', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  it('allows when disabled', () => {
    process.env.CLOUDFLARE_ACCESS_ENABLED = '0'
    const result = evaluateCloudflareAccess(mockReq({}))
    expect(result.allowed).toBe(true)
  })

  it('denies when enabled and missing identity headers', () => {
    process.env.CLOUDFLARE_ACCESS_ENABLED = '1'
    const result = evaluateCloudflareAccess(mockReq({}))
    expect(result.allowed).toBe(false)
    expect(result.status).toBe(401)
  })

  it('allows when request IP is allowlisted', () => {
    process.env.CLOUDFLARE_ACCESS_ENABLED = '1'
    process.env.CLOUDFLARE_ACCESS_ALLOWED_IPS = '203.0.113.10'

    const result = evaluateCloudflareAccess(
      mockReq({
        headers: {
          'cf-connecting-ip': '203.0.113.10',
        },
      }),
    )

    expect(result.allowed).toBe(true)
  })

  it('allows when request IP matches an allowlisted IPv4 CIDR', () => {
    process.env.CLOUDFLARE_ACCESS_ENABLED = '1'
    process.env.CLOUDFLARE_ACCESS_ALLOWED_IPS = '198.51.100.0/24'

    const result = evaluateCloudflareAccess(
      mockReq({
        headers: {
          'x-forwarded-for': '198.51.100.42, 10.0.0.1',
        },
      }),
    )

    expect(result.allowed).toBe(true)
  })

  it('allows when jwt assertion header exists', () => {
    process.env.CLOUDFLARE_ACCESS_ENABLED = '1'
    const result = evaluateCloudflareAccess(
      mockReq({
        headers: {
          'cf-access-jwt-assertion': 'token',
        },
      }),
    )
    expect(result.allowed).toBe(true)
  })

  it('enforces email allowlist when configured', () => {
    process.env.CLOUDFLARE_ACCESS_ENABLED = '1'
    process.env.CLOUDFLARE_ACCESS_ALLOWED_EMAILS = 'alex@example.com'

    const denied = evaluateCloudflareAccess(
      mockReq({
        headers: {
          'cf-access-jwt-assertion': 'token',
          'cf-access-authenticated-user-email': 'other@example.com',
        },
      }),
    )
    expect(denied.allowed).toBe(false)
    expect(denied.status).toBe(403)

    const allowed = evaluateCloudflareAccess(
      mockReq({
        headers: {
          'cf-access-jwt-assertion': 'token',
          'cf-access-authenticated-user-email': 'alex@example.com',
        },
      }),
    )
    expect(allowed.allowed).toBe(true)
  })
})
