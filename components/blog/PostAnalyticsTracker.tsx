'use client'

import { useEffect, useRef } from 'react'

type PostAnalyticsTrackerProps = {
  slug: string
  title: string
}

const THRESHOLDS = [25, 50, 75, 95]

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value))
}

async function emitAnalytics(eventType: 'view' | 'read-depth' | 'drop-off', slug: string, title: string, progress = 0) {
  try {
    await fetch('/api/blog/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ eventType, slug, title, progress }),
    })
    window.dispatchEvent(new Event('blog-analytics-updated'))
  } catch {
    // no-op
  }
}

function getProgress(): number {
  const article = document.querySelector('.article-body') as HTMLElement | null
  if (!article) return 0

  const rect = article.getBoundingClientRect()
  const viewportHeight = window.innerHeight || 1
  const articleTop = window.scrollY + rect.top
  const articleHeight = Math.max(article.offsetHeight, 1)
  const viewed = window.scrollY + viewportHeight - articleTop
  return clamp((viewed / articleHeight) * 100)
}

export default function PostAnalyticsTracker({ slug, title }: PostAnalyticsTrackerProps) {
  const maxProgressRef = useRef(0)
  const sentThresholdsRef = useRef<Set<number>>(new Set())
  const dropOffSentRef = useRef(false)

  useEffect(() => {
    void emitAnalytics('view', slug, title, 0)

    const onScroll = () => {
      const progress = getProgress()
      if (progress > maxProgressRef.current) {
        maxProgressRef.current = progress
      }

      for (const threshold of THRESHOLDS) {
        if (progress >= threshold && !sentThresholdsRef.current.has(threshold)) {
          sentThresholdsRef.current.add(threshold)
          void emitAnalytics('read-depth', slug, title, threshold)
        }
      }
    }

    const onPageHide = () => {
      if (dropOffSentRef.current) return
      if (maxProgressRef.current < 60) {
        dropOffSentRef.current = true
        void emitAnalytics('drop-off', slug, title, maxProgressRef.current)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('beforeunload', onPageHide)

    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('beforeunload', onPageHide)
      onPageHide()
    }
  }, [slug, title])

  return null
}
