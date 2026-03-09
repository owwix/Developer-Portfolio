'use client'

import { useState } from 'react'
import type { TocItem } from '../../lib/blog'

export default function MobileToc({ items = [] }: { items?: TocItem[] }) {
  const [open, setOpen] = useState(false)

  if (!items.length) return null

  return (
    <div className="mobile-toc">
      <button
        aria-controls="mobile-toc-panel"
        aria-expanded={open}
        className="mobile-toc-trigger"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        On This Page
      </button>

      {open ? (
        <>
          <button aria-label="Close table of contents" className="mobile-toc-backdrop" onClick={() => setOpen(false)} type="button" />
          <section className="mobile-toc-panel" id="mobile-toc-panel">
            <div className="mobile-toc-head">
              <h2>On This Page</h2>
              <button className="mobile-toc-close" onClick={() => setOpen(false)} type="button">
                Close
              </button>
            </div>
            <nav>
              <ul>
                {items.map((item) => (
                  <li className={item.level >= 3 ? 'toc-indent' : ''} key={item.id}>
                    <a href={`#${item.id}`} onClick={() => setOpen(false)}>
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </section>
        </>
      ) : null}
    </div>
  )
}
