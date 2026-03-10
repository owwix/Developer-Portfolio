'use client'

import { useEffect, useState } from 'react'

type PostAnalyticsSummaryProps = {
  slug: string
}

type AnalyticsSnapshot = {
  views: number
  avgReadDepth: number
  dropOffRate: number
}

export default function PostAnalyticsSummary({ slug }: PostAnalyticsSummaryProps) {
  const [metrics, setMetrics] = useState<AnalyticsSnapshot | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch(`/api/blog/analytics?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as AnalyticsSnapshot
        if (!cancelled) {
          setMetrics({
            views: Number(data?.views || 0),
            avgReadDepth: Number(data?.avgReadDepth || 0),
            dropOffRate: Number(data?.dropOffRate || 0),
          })
        }
      } catch {
        // no-op
      }
    }

    void load()
    window.addEventListener('blog-analytics-updated', load)
    return () => {
      cancelled = true
      window.removeEventListener('blog-analytics-updated', load)
    }
  }, [slug])

  if (!metrics) return null

  return (
    <div className="post-analytics-row" aria-label="Post analytics">
      <span className="meta-chip">{metrics.views} views</span>
    </div>
  )
}
