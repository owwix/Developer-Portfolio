import dotenv from 'dotenv'
import path from 'path'
import payload from 'payload'

dotenv.config()

if (!process.env.PAYLOAD_CONFIG_PATH) {
  process.env.PAYLOAD_CONFIG_PATH = path.resolve(process.cwd(), 'src/payload.config.ts')
}

type SlateNode = {
  type?: string
  children: Array<{ text: string }>
}

function toSlateRichText(value: string): SlateNode[] {
  const normalized = String(value || '').replace(/\r\n/g, '\n').trim()
  if (!normalized) {
    return [{ type: 'p', children: [{ text: '' }] }]
  }

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((entry) => entry.replace(/\n/g, ' ').trim())
    .filter(Boolean)

  if (!paragraphs.length) {
    return [{ type: 'p', children: [{ text: normalized }] }]
  }

  return paragraphs.map((entry) => ({
    type: 'p',
    children: [{ text: entry }],
  }))
}

function isLegacyString(value: unknown): value is string {
  return typeof value === 'string'
}

async function migrateCollectionField(collection: string, field: string): Promise<number> {
  let page = 1
  let updated = 0
  let hasNextPage = true

  while (hasNextPage) {
    const result = await payload.find({
      collection,
      depth: 0,
      limit: 100,
      page,
      overrideAccess: true,
    })

    for (const doc of result.docs as Array<{ id: string; [key: string]: unknown }>) {
      const current = doc?.[field]
      if (!isLegacyString(current)) continue

      await payload.update({
        collection,
        id: doc.id,
        depth: 0,
        overrideAccess: true,
        data: {
          [field]: toSlateRichText(current),
        },
      })
      updated += 1
    }

    hasNextPage = Boolean(result.hasNextPage)
    page += 1
  }

  return updated
}

async function migrateGlobalField(global: string, field: string): Promise<boolean> {
  const doc = (await payload.findGlobal({
    slug: global,
    depth: 0,
    overrideAccess: true,
  })) as Record<string, unknown>

  const current = doc?.[field]
  if (!isLegacyString(current)) return false

  await payload.updateGlobal({
    slug: global,
    depth: 0,
    overrideAccess: true,
    data: {
      [field]: toSlateRichText(current),
    },
  })

  return true
}

async function run() {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || '',
    local: true,
  })

  payload.logger.info('Starting rich-text migration...')

  const [projectsUpdated, experiencesUpdated, postsUpdated, homeUpdated] = await Promise.all([
    migrateCollectionField('projects', 'summary'),
    migrateCollectionField('experiences', 'summary'),
    migrateCollectionField('blog-posts', 'summary'),
    migrateGlobalField('home', 'bio'),
  ])

  payload.logger.info(`Projects updated: ${projectsUpdated}`)
  payload.logger.info(`Experiences updated: ${experiencesUpdated}`)
  payload.logger.info(`Blog posts updated: ${postsUpdated}`)
  payload.logger.info(`Home global updated: ${homeUpdated ? 'yes' : 'no'}`)
  payload.logger.info('Rich-text migration complete.')

  process.exit(0)
}

void run().catch((error) => {
  console.error(error)
  process.exit(1)
})
