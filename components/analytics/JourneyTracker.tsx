'use client'

import { useEffect } from 'react'

type JourneyPayload = {
  sourcePath: string
  targetPath: string
  journeyType: string
}

function classifyJourney(anchor: HTMLAnchorElement, sourcePath: string): JourneyPayload | null {
  const rawHref = String(anchor.getAttribute('href') || '').trim()
  if (!rawHref || rawHref.startsWith('#')) return null

  const explicitType = String(anchor.dataset.journeyType || '').trim().toLowerCase()

  if (rawHref.startsWith('mailto:')) {
    return {
      sourcePath,
      targetPath: 'mailto',
      journeyType: explicitType || 'contact',
    }
  }

  if (rawHref.startsWith('tel:')) {
    return {
      sourcePath,
      targetPath: 'tel',
      journeyType: explicitType || 'contact',
    }
  }

  let url: URL
  try {
    url = new URL(rawHref, window.location.origin)
  } catch {
    return null
  }

  const sameOrigin = url.origin === window.location.origin
  const targetPath = sameOrigin ? url.pathname : `external:${url.hostname}${url.pathname}`
  const journeyType = explicitType || (sameOrigin ? 'navigation' : 'outbound')

  if (sourcePath === targetPath && journeyType === 'navigation') return null

  return {
    sourcePath,
    targetPath,
    journeyType,
  }
}

function emitJourney(payload: JourneyPayload) {
  void fetch('/api/journey/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify(payload),
  })
}

export default function JourneyTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return

      const sourcePath = window.location.pathname
      const payload = classifyJourney(anchor, sourcePath)
      if (!payload) return

      emitJourney(payload)
    }

    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  return null
}
