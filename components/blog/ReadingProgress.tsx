'use client'

import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const article = document.querySelector('.article-body')
      if (!(article instanceof HTMLElement)) {
        setProgress(0)
        return
      }

      const rect = article.getBoundingClientRect()
      const articleTop = rect.top + window.scrollY
      const articleHeight = rect.height
      const viewportHeight = window.innerHeight

      const scrollStart = articleTop - viewportHeight * 0.2
      const scrollEnd = articleTop + articleHeight - viewportHeight * 0.6
      const range = Math.max(1, scrollEnd - scrollStart)
      const value = ((window.scrollY - scrollStart) / range) * 100

      setProgress(Math.min(100, Math.max(0, value)))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div aria-hidden="true" className="reading-progress-wrap">
      <div className="reading-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  )
}
