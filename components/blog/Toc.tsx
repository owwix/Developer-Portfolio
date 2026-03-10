'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { TocItem } from '../../lib/blog'

export default function Toc({ items = [] }: { items?: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>('')
  const navRef = useRef<HTMLElement | null>(null)
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

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

    const updateActiveFromScroll = () => {
      const viewportBottom = window.scrollY + window.innerHeight
      const pageBottom = document.documentElement.scrollHeight
      const isAtPageBottom = viewportBottom >= pageBottom - 2

      if (isAtPageBottom) {
        setActiveId(headingElements[headingElements.length - 1].id)
        return
      }

      const cursor = window.scrollY + 150
      let currentId = headingElements[0].id
      for (const heading of headingElements) {
        if (heading.offsetTop <= cursor) currentId = heading.id
        else break
      }
      setActiveId(currentId)
    }

    updateActiveFromHash()
    updateActiveFromScroll()
    window.addEventListener('scroll', updateActiveFromScroll, { passive: true })
    window.addEventListener('resize', updateActiveFromScroll)
    window.addEventListener('hashchange', updateActiveFromHash)

    return () => {
      window.removeEventListener('scroll', updateActiveFromScroll)
      window.removeEventListener('resize', updateActiveFromScroll)
      window.removeEventListener('hashchange', updateActiveFromHash)
    }
  }, [ids])

  useEffect(() => {
    if (!activeId) return
    const navEl = navRef.current
    const activeLink = linkRefs.current[activeId]
    if (!navEl || !activeLink) return

    const topPadding = 10
    const bottomPadding = 10
    const currentTop = navEl.scrollTop
    const visibleTop = currentTop + topPadding
    const visibleBottom = currentTop + navEl.clientHeight - bottomPadding
    const itemTop = activeLink.offsetTop
    const itemBottom = itemTop + activeLink.offsetHeight

    if (itemTop >= visibleTop && itemBottom <= visibleBottom) return

    const targetTop = itemTop - Math.max((navEl.clientHeight - activeLink.offsetHeight) / 2, 0)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    navEl.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }, [activeId])

  if (!items.length) return null

  return (
    <aside className="toc" aria-label="Table of contents">
      <h2>On This Page</h2>
      <nav ref={navRef}>
        <ul>
          {items.map((item) => (
            <li className={item.level >= 3 ? 'toc-indent' : ''} key={item.id}>
              <a
                className={activeId === item.id ? 'is-active' : ''}
                href={`#${item.id}`}
                ref={(el) => {
                  linkRefs.current[item.id] = el
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
