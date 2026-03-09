import type { Express, Request, Response } from 'express'
import express from 'express'
import payload from 'payload'

type AnalyticsEvent = 'view' | 'read-depth' | 'drop-off'

const VALID_EVENTS = new Set<AnalyticsEvent>(['view', 'read-depth', 'drop-off'])

function normalizeSlug(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function roundToOne(value: number): number {
  return Math.round(value * 10) / 10
}

function clamp(value: unknown, min: number, max: number): number {
  const numeric = toNumber(value, min)
  return Math.min(max, Math.max(min, numeric))
}

async function getOrCreateMetric(slug: string, title: string) {
  const existing = await payload.find({
    collection: 'blog-analytics',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      slug: { equals: slug },
    },
  })

  const doc = existing?.docs?.[0] as
    | {
        id: string
        slug?: string
        title?: string
        views?: number
        avgReadDepth?: number
        depthSamples?: number
        dropOffs?: number
        dropOffRate?: number
      }
    | undefined

  if (doc) return doc

  return (await payload.create({
    collection: 'blog-analytics',
    depth: 0,
    overrideAccess: true,
    data: {
      slug,
      title: title || slug,
      views: 0,
      avgReadDepth: 0,
      depthSamples: 0,
      dropOffs: 0,
      dropOffRate: 0,
      lastViewedAt: new Date().toISOString(),
      lastEventType: 'view',
    },
  })) as {
    id: string
    title?: string
    views?: number
    avgReadDepth?: number
    depthSamples?: number
    dropOffs?: number
    dropOffRate?: number
  }
}

export function registerBlogAnalyticsRoute(app: Express): void {
  app.use('/api/blog/analytics', express.json())

  app.get('/api/blog/analytics', async (req: Request, res: Response) => {
    try {
      const slug = normalizeSlug(req.query.slug)
      if (!slug) {
        return res.status(400).json({ error: 'Missing slug.' })
      }

      const found = await payload.find({
        collection: 'blog-analytics',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: {
          slug: { equals: slug },
        },
      })

      const metric = found?.docs?.[0] as
        | {
            views?: number
            avgReadDepth?: number
            dropOffRate?: number
          }
        | undefined

      return res.status(200).json({
        slug,
        views: toNumber(metric?.views),
        avgReadDepth: roundToOne(toNumber(metric?.avgReadDepth)),
        dropOffRate: roundToOne(toNumber(metric?.dropOffRate)),
      })
    } catch (error) {
      payload.logger.error(error)
      return res.status(500).json({ error: 'Analytics read failed.' })
    }
  })

  app.post('/api/blog/analytics', async (req: Request, res: Response) => {
    try {
      const body = req.body || {}
      const slug = normalizeSlug(body?.slug)
      const title = String(body?.title || '').trim()
      const eventType = String(body?.eventType || '').trim() as AnalyticsEvent
      const progress = clamp(body?.progress, 0, 100)

      if (!slug) {
        return res.status(400).json({ error: 'Missing slug.' })
      }

      if (!VALID_EVENTS.has(eventType)) {
        return res.status(400).json({ error: 'Invalid eventType.' })
      }

      const metric = await getOrCreateMetric(slug, title)
      const prevViews = toNumber(metric?.views)
      const prevAvgDepth = toNumber(metric?.avgReadDepth)
      const prevDepthSamples = toNumber(metric?.depthSamples)
      const prevDropOffs = toNumber(metric?.dropOffs)

      let views = prevViews
      let avgReadDepth = prevAvgDepth
      let depthSamples = prevDepthSamples
      let dropOffs = prevDropOffs

      if (eventType === 'view') {
        views += 1
      }

      if (eventType === 'read-depth') {
        depthSamples += 1
        const totalDepth = prevAvgDepth * prevDepthSamples + progress
        avgReadDepth = depthSamples > 0 ? roundToOne(totalDepth / depthSamples) : 0
      }

      if (eventType === 'drop-off') {
        dropOffs += 1
      }

      const dropOffRate = views > 0 ? roundToOne((dropOffs / views) * 100) : 0

      const updated = (await payload.update({
        collection: 'blog-analytics',
        depth: 0,
        id: metric.id,
        overrideAccess: true,
        data: {
          slug,
          title: title || String(metric?.title || slug),
          views,
          avgReadDepth,
          depthSamples,
          dropOffs,
          dropOffRate,
          lastViewedAt: new Date().toISOString(),
          lastEventType: eventType,
        },
      })) as {
        views?: number
        avgReadDepth?: number
        dropOffRate?: number
      }

      return res.status(200).json({
        slug,
        views: toNumber(updated?.views),
        avgReadDepth: roundToOne(toNumber(updated?.avgReadDepth)),
        dropOffRate: roundToOne(toNumber(updated?.dropOffRate)),
      })
    } catch (error) {
      payload.logger.error(error)
      return res.status(500).json({ error: 'Analytics write failed.' })
    }
  })
}
