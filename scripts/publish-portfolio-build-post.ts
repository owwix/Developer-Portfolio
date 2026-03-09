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
  'I rebuilt my portfolio as a real engineering system using Next.js, TypeScript, and Payload CMS so content publishing, UI delivery, and long-term maintenance are all first-class workflows.'

const content = String.raw`# How I Built My Portfolio with Next.js, TypeScript, and Payload CMS

I rebuilt my portfolio because I wanted it to function like a product, not just a static page. I needed a setup where I could ship frontend improvements, publish technical writing, and evolve content without hardcoding every update.

## Why I Rebuilt It

> [!DECISION] Move from static-only content to a CMS-backed architecture
> I chose Next.js + TypeScript + Payload CMS so I could decouple content from presentation and keep the portfolio maintainable as it grows.

> [!WHY] Why this mattered
> This gave me a repeatable publishing workflow for blog posts, projects, and homepage content while keeping strong typing in the frontend.

The old version looked fine, but adding new projects or notes still felt manual. I wanted cleaner developer ergonomics and better long-term maintainability.

## Stack and Architecture

### Next.js

I used Next.js for routing, rendering, and production deployment flow. It gave me a clean structure for:

- Homepage sections (hero, projects, skills, notes)
- Blog archive and blog detail routes
- Per-page SEO metadata and social cards
- Server-side content fetching from the CMS

### TypeScript

TypeScript was non-negotiable for this rebuild. It helps catch schema drift early, keeps content mapping safe, and makes refactors much less risky.

### Payload CMS

Payload became the editorial control center for site content:

- Homepage global content
- Projects
- Skills
- Blog notes/articles
- Contact inquiries

## Content Model Decisions

> [!TRADEOFF] CMS flexibility vs setup complexity
> Payload adds backend complexity compared with a plain MDX-only blog, but it gave me structured content management and a better long-term workflow.

I modeled content around reusable entities rather than page-specific hardcoded blocks. That made it easy to reuse content across homepage previews, archive cards, and detail pages.

For long-form writing, I moved toward rich text and markdown-based rendering patterns so I can publish technical notes with headings, lists, code blocks, and callouts.

## Example: Markdown + Code Block Support

\`\`\`typescript
import { fetchBlogPosts } from '../lib/cms'

export async function getArchive() {
  const result = await fetchBlogPosts<{ docs?: Array<{ title?: string; slug?: string }> }>(200)
  return result?.docs ?? []
}
\`\`\`

That same approach keeps route rendering and metadata generation straightforward across the site.

## Design Direction

I kept the visual language dark, minimal, and technical to match the rest of my portfolio. The goal was to feel like a real engineering brand, not a generic template.

I focused on:

- Clear typography hierarchy
- Consistent spacing and card patterns
- Better readability for long-form posts
- Responsive behavior across desktop, tablet, and mobile
- Subtle interaction states instead of noisy animations

## Deployment Lessons

One major challenge was operational consistency across environments:

- Environment variable alignment
- Database alignment between admin and frontend
- Build dependency stability
- Schema evolution without content loss

> [!LESSON] The frontend can look healthy while CMS data is wrong
> If environments drift, the site can still render cached or alternate content while the admin appears missing data. Ops discipline matters as much as UI quality.

## What I'd Improve Next

> [!IMPROVE] Next iteration priorities
> I would add stronger draft preview workflows, richer related-post ranking, deeper read-depth analytics, and expanded RSS/sitemap behavior for content distribution.

This rebuild gave me more than a visual refresh. It gave me a maintainable publishing system I can iterate on like a real product.
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
      { tag: 'Portfolio' },
    ],
    publishedDate: new Date().toISOString(),
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
