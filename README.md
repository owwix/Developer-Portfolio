# Developer Portfolio (Payload + Next.js)

This repository runs a full portfolio experience with:
- Payload CMS for admin/content APIs
- Next.js App Router for the public frontend
- TypeScript across backend (`src/*.ts`) and frontend (`app/**/*.tsx`, `components/**/*.tsx`, `lib/**/*.ts`)

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

## Build and start

```bash
npm run build
npm start
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
