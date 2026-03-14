# Developer Portfolio Blog Starter (Payload + Next.js)

This repository runs a full portfolio experience with:
- Payload CMS for admin/content APIs
- Next.js App Router for the public frontend
- TypeScript across backend (`src/*.ts`) and frontend (`app/**/*.tsx`, `components/**/*.tsx`, `lib/**/*.ts`)

## Template-ready setup

This project is now template-friendly. You can reuse it as a starter by setting these values in `.env`:
- `SITE_URL`
- `SITE_OWNER_NAME`
- `SITE_OWNER_ROLE`
- `SITE_BLOG_LABEL`
- `CMS_TITLE`
- `CMS_SUBTITLE`
- `CMS_MONOGRAM`

Then open Payload admin and update:
- `Globals -> Homepage Content`
- `Globals -> Admin Branding`

This gives you a working white-label portfolio/blog CMS without editing code.
For a release checklist, see `TEMPLATE_CHECKLIST.md`.

## What is included

- Payload admin panel at `/admin`
- Public API access at `/api/*`
- Next.js frontend pages:
  - `/` (portfolio homepage)
  - `/blog` (notes archive)
  - `/blog/[slug]` (article detail)
- Collections for:
  - `projects`
  - `skills`
  - `experiences`
  - `education`
- A global document for homepage content:
  - `home`
- Auth-enabled `users` collection for admin login

## Quick start

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start MongoDB (local example):

   ```bash
   docker run --name portfolio-mongo -p 27017:27017 -d mongo:7
   ```

4. Run the app:

   ```bash
   npm run dev
   ```

5. Open admin panel:

   - <http://localhost:3000/admin>

## Suggested content model usage

- Use `home` for your hero section, summary, and contact links.
- Use `projects` to manage portfolio project cards and details.
- Use `skills` for grouped technical skills and proficiency ratings.
- Use `experiences` for timeline-based work history and impact bullets.
- Use `education` for degrees, schools, dates, and academic highlights.

## Build and start

```bash
npm run build
npm start
```

### Railway build command (recommended)

If Railway deploys stall before post-deploy, use:

```bash
npm run build:railway
```

and set:

```bash
SKIP_PAYLOAD_ADMIN_BUILD=1
```

This skips the admin prebuild step, which is the most common CI bottleneck.

### Optional Railway post-deploy command

If you want post-deploy warmup hooks, set Railway Post-deploy Command to:

```bash
npm run postdeploy
```

By default this is safe/no-op. Enable tasks only when needed via env vars:

```bash
POSTDEPLOY_RUN_WARMUP=1
POSTDEPLOY_WARMUP_URLS=/blog,/open-source
```

Control failure behavior:

```bash
POSTDEPLOY_FAIL_ON_WARMUP_ERROR=0
```

## Production media persistence (Railway)

To prevent uploaded images from disappearing or changing across deploys, use a persistent volume for media files:

1. Create and mount a Railway volume (for example at `/data`).
2. Set:

   ```bash
   PAYLOAD_MEDIA_DIR=/data/media
   PAYLOAD_MEDIA_URL=/media
   ```

3. Redeploy.

This project now sanitizes upload filenames to URL-safe ASCII by default, which helps avoid filename encoding issues between environments.

## Cloudflare Access hardening

This repo includes an app-layer protection guard for `/admin` and sensitive `/api` routes.

- setup + route matrix: `SECURITY_CLOUDFLARE_ACCESS.md`
- implementation: `src/security/accessControl.ts` + `src/server.ts`
- analytics tracking endpoint is served by Express at `/api/blog/analytics` (`src/server/registerBlogAnalyticsRoute.ts`)
