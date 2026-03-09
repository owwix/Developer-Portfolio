import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import payload from 'payload'
import { toSlateRichText } from '../src/utils/richText'

dotenv.config()

if (!process.env.PAYLOAD_CONFIG_PATH) {
  process.env.PAYLOAD_CONFIG_PATH = path.resolve(process.cwd(), 'src/payload.config.ts')
}

const title = 'Locking Down Payload Admin and Internal APIs with Cloudflare Access'
const slug = 'locking-down-payload-admin-and-internal-apis-with-cloudflare-access'
const summary =
  'How I protected /admin and sensitive /api routes in my self-hosted Payload app using Cloudflare Access plus app-layer route enforcement.'
const contentPath = path.resolve(process.cwd(), 'content/blog/cloudflare-access-hardening.md')

async function run() {
  const rawContent = await fs.readFile(contentPath, 'utf8')
  const content = rawContent.replace(/^#\s+.*\n\n/, '')

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
      { tag: 'Cloudflare' },
      { tag: 'Security' },
      { tag: 'Payload CMS' },
      { tag: 'Infrastructure' },
      { tag: 'Engineering Notes' },
      { tag: 'Deployment' },
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
