import dotenv from 'dotenv'
import path from 'path'
import payload from 'payload'
import { toSlateRichText } from '../src/utils/richText'

dotenv.config()

if (!process.env.PAYLOAD_CONFIG_PATH) {
  process.env.PAYLOAD_CONFIG_PATH = path.resolve(process.cwd(), 'src/payload.config.ts')
}

const title = 'How I Built My Portfolio with Next.js, TypeScript, and Payload CMS'
const slug = 'how-i-built-my-portfolio-with-nextjs-typescript-and-payload-cms'
const summary =
  'A production-focused walkthrough of how I rebuilt and deployed my portfolio as a real CMS-backed engineering system with Next.js, TypeScript, Payload, and hardened admin/API access.'
const FENCE = '```'

const content = `# How I Built My Portfolio with Next.js, TypeScript, and Payload CMS

I rebuilt my portfolio because I wanted it to behave like a real engineering product, not a static page that I had to edit manually every time I wanted to ship content.

My goals were simple:

- ship UI changes safely
- publish technical writing quickly
- manage projects, skills, and experience from a CMS
- keep the codebase maintainable as the site grows

This guide is the exact approach I used so someone else can build, secure, and deploy a similar system.

## Problem Statement

My previous setup looked fine but had a workflow problem: content was tightly coupled to frontend code. Every update meant editing source files and redeploying.

> [!DECISION] Use a CMS-backed architecture
> I chose Next.js + TypeScript + Payload CMS to separate content operations from presentation and create a long-term publishing workflow.

> [!WHY] Why this mattered
> It let me update content independently from UI implementation while keeping strict typing and predictable rendering.

## Stack Selection

### Next.js

I used Next.js for routing, rendering, metadata control, and deployment ergonomics.

It gave me a clear structure for:

- homepage sections
- blog archive and detail routes
- social metadata and canonical URLs
- server-side fetching from CMS APIs

### TypeScript

TypeScript is critical in a CMS-backed frontend where content models evolve.

As soon as your content model changes, weak typing becomes a regression risk. TypeScript helped me lock down model shapes for posts, projects, experience entries, and global homepage content.

### Payload CMS

Payload became my editorial control center for:

- homepage global content
- projects
- skills and categories
- experiences
- blog posts
- inquiries

## Project Setup

### Prerequisites

${FENCE}bash
node -v   # use >= 18.20
npm -v
${FENCE}

You also need a MongoDB database URL and environment variables.

### App bootstrap

${FENCE}bash
npx create-next-app@latest developer-portfolio --ts
cd developer-portfolio
npm install payload @payloadcms/db-mongodb @payloadcms/richtext-slate @payloadcms/bundler-webpack express dotenv tsx
${FENCE}

### Core scripts

${FENCE}json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "next build && tsc -p tsconfig.json && PAYLOAD_CONFIG_PATH=dist/payload.config.js payload build",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.next.json"
  }
}
${FENCE}

## Payload Configuration

The core config wires Mongo, rich text, admin, and collections.

${FENCE}typescript
export default buildConfig({
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || '',
  }),
  editor: slateEditor({}),
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  collections: [BlogPosts, Projects, Skills, Experiences, Media, PhoneRequests, Users],
  globals: [Home],
})
${FENCE}

## Content Model Design

I kept content model boundaries clear:

- Home global: hero content and key links
- Projects: summary, image, links, ordering
- Skills: grouped categories and badges
- Experience: role history with rich text summaries
- BlogPosts: title, slug, summary, content, tags, publish date

> [!TRADEOFF] Structured CMS model vs speed of hardcoded JSON
> A structured model takes more setup at the start, but it pays off quickly when you need to scale writing and maintain consistency.

## Rich Text + Markdown Rendering

I support two flows:

1. Payload rich text for short/structured fields (bio, summaries)
2. Markdown-style body rendering for blog post content

For markdown parsing, I added support for:

- headings
- paragraphs
- unordered lists
- blockquotes
- code fences
- engineering callouts
- copy-ready code blocks

${FENCE}typescript
export async function getArchive() {
  const result = await fetchBlogPosts<{ docs?: Array<{ title?: string; slug?: string; displayOrder?: number }> }>(200)
  return sortByDisplayOrder(result?.docs || [])
}
${FENCE}

### Important rendering bugs I fixed

I initially had code fences rendering incorrectly because escaped fence characters were stored literally in content. The fix was to write actual fence markers in post content and ensure the parser sees real triple-backtick blocks.

I also fixed paragraph fidelity between Payload rich text and frontend rendering so Enter-based paragraph breaks map to separate paragraphs in the UI.

And I fixed list-node cleanup to remove stray empty bullets created by inconsistent legacy editor state.

## Homepage + Blog UX

I designed the blog experience as a docs/engineering hybrid:

- archive page with filters and tags
- detail page with metadata row
- sticky table of contents
- reading progress bar
- code copy button
- engineering annotation callouts
- related-post suggestions
- reading list/bookmark flow

This made the writing feel like technical documentation instead of generic portfolio text.

## SEO + Social

For SEO and sharing, I added:

- canonical URLs
- OpenGraph metadata
- Twitter card metadata
- JSON-LD for Article/Breadcrumb/Person where relevant
- generated social image route for posts

That improved share quality and consistency across platforms.

## Environment Variables

A stable environment setup matters as much as UI quality.

${FENCE}bash
PAYLOAD_SECRET=your-secret
MONGODB_URI=your-mongodb-uri
PAYLOAD_PUBLIC_SERVER_URL=https://www.alexok.dev
PAYLOAD_INTERNAL_SERVER_URL=http://127.0.0.1:3000
PORT=3000
${FENCE}

## Deploying to Railway (or similar)

### Step 1: Provision services

- Web service for Next.js + Payload
- MongoDB service
- Optional persistent volume for media

### Step 2: Set production variables

Set all required env vars in the deployment environment.

### Step 3: Configure media persistence

Do not rely on container-local storage for uploads.

${FENCE}bash
PAYLOAD_MEDIA_DIR=/data/media
PAYLOAD_MEDIA_URL=/media
${FENCE}

Mount a persistent volume at \`/data\` so uploaded images survive redeploys.

### Step 4: Build + run

${FENCE}bash
npm run build
npm start
${FENCE}

### Step 5: Verify critical paths

- admin login works
- homepage content loads from CMS
- blog archive and post detail render correctly
- media URLs load after redeploy

## Production Issues I Hit (and Fixes)

### 1. Frontend data did not match admin

Cause: environment drift between services.

Fix: standardize env vars and ensure both frontend and admin point at the same data source.

### 2. Missing media after deploy

Cause: non-persistent container storage.

Fix: use persistent volume/object storage and normalize filenames.

### 3. Rich text formatting mismatch

Cause: renderer flattening or sanitization issues.

Fix: explicit rich text renderer for paragraph/list nodes and cleanup hooks for empty list artifacts.

### 4. Analytics route failures in production

Cause: route-level conflict around blog analytics endpoint plus missing collection registration in one deployment path.

Fix:

- register \`blog-analytics\` collection in Payload config
- move analytics API handling into the Express server layer for this stack
- remove conflicting duplicate route implementation

## Security Hardening (Cloudflare Access)

I also added a protection layer so sensitive surfaces are not publicly reachable without Cloudflare Access.

Protected routes:

- \`/admin\`
- non-public internal \`/api\` routes

Public routes (intentionally open):

- public content read endpoints used by frontend rendering
- specific webhook/public routes required for integrations

This gave me an extra perimeter beyond app-level auth and reduced direct exposure of admin and internal APIs.

> [!DECISION] Put admin and internal APIs behind Cloudflare Access
> Payload auth is necessary, but perimeter enforcement reduces attack surface and noisy bot traffic before it reaches the app.

## Minimal Route Guard Pattern

${FENCE}typescript
const protectedPrefixes = ['/admin', '/api']
const publicApiPrefixes = ['/api/blog', '/api/public', '/api/webhooks']

function isProtected(pathname: string) {
  if (pathname.startsWith('/admin')) return true
  if (!pathname.startsWith('/api')) return false
  return !publicApiPrefixes.some((prefix) => pathname.startsWith(prefix))
}
${FENCE}

In production, protected routes require trusted Cloudflare Access identity headers before the request is accepted.

> [!LESSON] Reliability is mostly about operational discipline
> Most real failures came from environment and deployment mismatches, not component styling.

## What I Would Improve Next

> [!IMPROVE] Next iteration priorities
> Add stronger draft preview workflows, richer related-post ranking, deeper read-depth analytics, expanded RSS/sitemap behavior, and cleaner template packaging for public reuse.

## Final Thoughts

This rebuild turned my portfolio into a maintainable publishing platform I can keep evolving.

The biggest win is workflow quality: I can now write, ship, and iterate like I would on any serious product system.

If you are building your own developer portfolio and want it to scale beyond a static landing page, this stack is a strong foundation.
`

async function run() {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'dev-secret',
    local: true,
  })

  const existing = await payload.find({
    collection: 'blog-posts',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const publishedDate =
    existing.docs.length > 0 && existing.docs[0].publishedDate
      ? existing.docs[0].publishedDate
      : new Date().toISOString()

  const data = {
    title,
    slug,
    summary: toSlateRichText(summary),
    content,
    tags: [
      { tag: 'Next.js' },
      { tag: 'TypeScript' },
      { tag: 'Payload CMS' },
      { tag: 'Engineering Notes' },
      { tag: 'Deployment' },
      { tag: 'Portfolio' },
    ],
    publishedDate,
    isComingSoon: false,
    _status: 'published' as const,
  }

  if (existing.docs.length > 0) {
    const updated = await payload.update({
      collection: 'blog-posts',
      id: existing.docs[0].id,
      depth: 0,
      overrideAccess: true,
      data,
    })
    payload.logger.info(`Updated note: ${updated.id} (${updated.slug})`)
  } else {
    const created = await payload.create({
      collection: 'blog-posts',
      depth: 0,
      overrideAccess: true,
      data,
    })
    payload.logger.info(`Created note: ${created.id} (${created.slug})`)
  }

  process.exit(0)
}

void run().catch((error) => {
  console.error(error)
  process.exit(1)
})
