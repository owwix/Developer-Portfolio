# Locking Down Payload Admin and Internal APIs with Cloudflare Access

When I self-hosted my portfolio stack (Next.js + Payload), I realized I had a common risk:

- the app worked well in public
- the content APIs were available
- but `/admin` and sensitive backend routes were still one misconfiguration away from direct exposure

This write-up covers how I added a defense-in-depth layer so:

- `/admin` is blocked unless Cloudflare Access identity headers are present
- non-public `/api` routes are blocked by default
- only explicitly public routes stay open for frontend reads and required webhooks

## Problem Statement

Cloudflare Access policies are strong, but I wanted app-level protection too.

If upstream policy gets loosened by mistake, the application should still enforce:

1. identity checks
2. route classification
3. method-based public/private boundaries

## Security Model

I implemented three pieces:

1. **Route classification** (`shouldProtectRequest`)
2. **Identity evaluation** (`evaluateCloudflareAccess`)
3. **Express middleware enforcement** before Payload initializes

Protected by default:

- `/admin`
- `/admin/*`
- `/api/*` unless explicitly allowlisted

Public by explicit allowlist:

- public content read endpoints (`GET/HEAD/OPTIONS`)
- required public write endpoints (`POST /api/phone-requests`, `POST /api/blog/analytics`)
- optional custom public routes via env

:::decision Explicit allowlist over implicit openness
I treat every API route as protected unless there is a concrete reason to expose it. This keeps new sensitive routes private by default.
:::

## Environment Variables

```bash
CLOUDFLARE_ACCESS_ENABLED=1
CLOUDFLARE_ACCESS_ALLOWED_EMAILS=alex@example.com
CLOUDFLARE_ACCESS_ALLOWED_EMAIL_DOMAINS=example.com
CLOUDFLARE_ACCESS_CLIENT_ID=...
CLOUDFLARE_ACCESS_CLIENT_SECRET=...
CLOUDFLARE_ACCESS_PUBLIC_API_ROUTES=/api/webhooks/*|POST
```

- `CLOUDFLARE_ACCESS_ENABLED=1` turns enforcement on.
- Either `cf-access-jwt-assertion` **or** service token headers can satisfy identity.
- If allowlists are configured, email identity must also match.

## Route Protection Logic

This is the core idea:

```ts
if (path.startsWith('/admin')) return true
if (path.startsWith('/api')) return !isPublicApiRequest(path, method)
return false
```

Public API rules are method-aware so `GET /api/blog-posts` can be public while `POST /api/blog-posts` remains protected.

:::tradeoff Method-level allowlists add complexity
This is stricter and safer, but requires deliberate maintenance when adding new public endpoints.
:::

## Express Enforcement

I enforce the check before Payload mounts its routes:

```ts
app.use((req, res, next) => {
  if (!shouldProtectRequest(req.path, req.method)) return next()

  const decision = evaluateCloudflareAccess(req)
  if (decision.allowed) return next()

  if (req.path.startsWith('/api/')) {
    return res.status(decision.status).json({ error: 'Access denied', reason: decision.reason })
  }
  return res.status(decision.status).type('text/plain').send('Access denied')
})
```

This keeps behavior predictable:

- API callers receive JSON errors
- admin/browser routes receive plain text denial

## What Stayed Public (Intentionally)

- `GET /api/projects`
- `GET /api/skills`
- `GET /api/experiences`
- `GET /api/open-source-resources`
- `GET /api/blog-posts`
- `GET /api/globals/home`
- `GET /api/globals/now`
- `GET /api/media`
- `POST /api/phone-requests`
- `GET/POST /api/blog/analytics`

Everything else in `/api` is protected.

## Test Coverage I Added

I added tests for:

- route classification (public vs protected)
- method boundaries (read public, write protected)
- identity-header enforcement
- allowlist behavior

```bash
npm test
```

:::lesson Defense in depth is worth it for personal infra too
Even for a solo portfolio, secure-by-default route boundaries prevent avoidable exposure when environments drift.
:::

## What I’d Improve Next

- verify `cf-access-jwt-assertion` signature against Cloudflare JWKS for stronger zero-trust guarantees at app layer
- add security event logging for denied requests
- add rate-limiting on public write endpoints

## Final Thoughts

Cloudflare Access at the edge is great. App-level enforcement makes it resilient.

If you self-host Payload, protecting `/admin` and sensitive `/api` routes this way is a high-value hardening step that takes relatively little code but removes a lot of risk.
