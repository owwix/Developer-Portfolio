# Developer Portfolio (Payload CMS)

This repository is set up as a **SWE portfolio CMS backend** using Payload.

## What is included

- Payload admin panel at `/admin`
- Public API access for portfolio data
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

Frontend script source lives in `src/client/app.ts`.
When you change it, compile to browser JS with:

```bash
npm run build:frontend
```

5. Open admin panel:

   - <http://localhost:3000/admin>

## Suggested content model usage

- Use `home` for your hero section, summary, and contact links.
- Use `projects` to manage portfolio project cards and details.
- Use `skills` for grouped technical skills and proficiency ratings.
- Use `experiences` for timeline-based work history and impact bullets.

## Next step (frontend)

You can now consume Payload's REST or GraphQL APIs from a frontend (Next.js, Astro, etc.) to render your portfolio UI.
