import type { Express, Request, Response } from 'express'
import express from 'express'
import payload from 'payload'

function normalizePathValue(value: unknown): string {
  const input = String(value || '').trim()
  if (!input) return ''

  if (input.startsWith('external:') || input === 'mailto' || input === 'tel') {
    return input.slice(0, 180)
  }

  let path = input
  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  return path.toLowerCase().replace(/\s+/g, '-').slice(0, 180)
}

function normalizeJourneyType(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

async function getOrCreateJourneyMetric(sourcePath: string, targetPath: string, journeyType: string) {
  const key = `${sourcePath}::${journeyType}::${targetPath}`

  const existing = await payload.find({
    collection: 'journey-analytics',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      key: { equals: key },
    },
  })

  const doc = existing?.docs?.[0] as { id: string; count?: number } | undefined
  if (doc) return { ...doc, key }

  return (await payload.create({
    collection: 'journey-analytics',
    depth: 0,
    overrideAccess: true,
    data: {
      key,
      sourcePath,
      targetPath,
      journeyType,
      count: 0,
      lastSeenAt: new Date().toISOString(),
    },
  })) as { id: string; count?: number; key: string }
}

export function registerJourneyAnalyticsRoute(app: Express): void {
  app.use('/api/journey/analytics', express.json())

  app.post('/api/journey/analytics', async (req: Request, res: Response) => {
    try {
      const body = req.body || {}
      const sourcePath = normalizePathValue(body?.sourcePath)
      const targetPath = normalizePathValue(body?.targetPath)
      const journeyType = normalizeJourneyType(body?.journeyType) || 'navigation'

      if (!sourcePath || !targetPath) {
        return res.status(400).json({ error: 'Missing sourcePath or targetPath.' })
      }

      const metric = await getOrCreateJourneyMetric(sourcePath, targetPath, journeyType)
      const prevCount = Number(metric?.count || 0)

      await payload.update({
        collection: 'journey-analytics',
        id: metric.id,
        depth: 0,
        overrideAccess: true,
        data: {
          count: prevCount + 1,
          lastSeenAt: new Date().toISOString(),
        },
      })

      return res.status(200).json({ ok: true })
    } catch (error) {
      payload.logger.error(error)
      return res.status(500).json({ error: 'Journey analytics write failed.' })
    }
  })
}
