'use client'

import { useEffect, useMemo, useState } from 'react'
import type { TocItem } from '../../lib/blog'

export default function Toc({ items = [] }: { items?: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>('')

  const ids = useMemo(() => items.map((item) => item.id), [items])

  useEffect(() => {
    if (!ids.length) return

    const updateActiveFromHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && ids.includes(hash)) {
        setActiveId(hash)
      }
    }

    const headingElements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (!headingElements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop)

        if (visible.length) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '0px 0px -70% 0px',
        threshold: [0, 1],
      },
    )

    headingElements.forEach((heading) => observer.observe(heading))
    updateActiveFromHash()
    window.addEventListener('hashchange', updateActiveFromHash)

    return () => {
      observer.disconnect()
      window.removeEventListener('hashchange', updateActiveFromHash)
    }
  }, [ids])

  if (!items.length) return null

  return (
    <aside className="toc" aria-label="Table of contents">
      <h2>On This Page</h2>
      <nav>
        <ul>
          {items.map((item) => (
            <li className={item.level >= 3 ? 'toc-indent' : ''} key={item.id}>
              <a className={activeId === item.id ? 'is-active' : ''} href={`#${item.id}`}>
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
