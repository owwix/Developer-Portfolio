# Cloudflare Access Protection

This app applies a defense-in-depth security layer for Payload admin and sensitive API routes.

## What is protected

When `CLOUDFLARE_ACCESS_ENABLED=1`:

- `/admin` and `/admin/*` are protected
- `/api/*` is protected by default, except explicitly public route rules

Protected requests must include Cloudflare Access identity headers:

- `cf-access-jwt-assertion` (typical user flow through Cloudflare Access), or
- `cf-access-client-id` + `cf-access-client-secret` (service token flow, optional)

## Optional: Set up One-time PIN (OTP) login

If you want Cloudflare to issue one-time PIN challenges for user sign-in, add the One-time PIN identity provider.

Dashboard path:

```text
Cloudflare One -> Integrations -> Identity providers -> Add new identity provider -> One-time PIN
```

Required API token permission (at least one):

- `Access: Organizations, Identity Providers, and Groups Write`

API example:

```bash
curl "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/access/identity_providers" \
  --request POST \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  --json '{
    "name": "One-time PIN login",
    "type": "onetimepin",
    "config": {}
  }'
```

Terraform example (v5):

```hcl
resource "cloudflare_zero_trust_access_identity_provider" "onetimepin_login" {
  account_id = var.cloudflare_account_id
  name       = "One-time PIN login"
  type       = "onetimepin"
  config     = {}
}
```

## What stays public (default)

These endpoints are intentionally public so the frontend keeps working:

- `GET|HEAD|OPTIONS /api/projects*`
- `GET|HEAD|OPTIONS /api/skills*`
- `GET|HEAD|OPTIONS /api/experiences*`
- `GET|HEAD|OPTIONS /api/open-source-resources*`
- `GET|HEAD|OPTIONS /api/blog-posts*`
- `GET|HEAD|OPTIONS /api/globals/home*`
- `GET|HEAD|OPTIONS /api/globals/now*`
- `GET|HEAD|OPTIONS /api/media*`
- `POST|OPTIONS /api/phone-requests*`
- `GET|POST|OPTIONS /api/blog/analytics*`

`/api/blog/analytics` is implemented as an Express route in `src/server/registerBlogAnalyticsRoute.ts`.

## Optional hardening

Use identity allowlists:

- `CLOUDFLARE_ACCESS_ALLOWED_EMAILS`
- `CLOUDFLARE_ACCESS_ALLOWED_EMAIL_DOMAINS`
- `CLOUDFLARE_ACCESS_ALLOWED_IPS`

If these are set, requests must also include:

- `cf-access-authenticated-user-email`

IP allowlist format:

```text
203.0.113.10,198.51.100.0/24
```

When `CLOUDFLARE_ACCESS_ALLOWED_IPS` matches the request IP, app-layer access is allowed even if Cloudflare Access identity headers are not present.
IP source order: `cf-connecting-ip`, then first IP in `x-forwarded-for`.

## Extending public routes

Add custom rules with:

- `CLOUDFLARE_ACCESS_PUBLIC_API_ROUTES`

Format:

```text
/api/path|GET:POST,/api/webhooks/*|POST
```

If methods are omitted, defaults to `GET,HEAD,OPTIONS`.

## Implementation location

- Route classification + Access checks:
  - `src/security/accessControl.ts`
- Express enforcement middleware:
  - `src/server.ts`

## Notes

- This does not replace Cloudflare policy configuration. It reduces blast radius if upstream policy is accidentally loosened.
- Keep all secrets (`CLOUDFLARE_ACCESS_CLIENT_SECRET`, etc.) in secure environment variables.
