'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type BlogCommandEntry = {
  title: string
  slug: string
  summary?: string
  tags?: string[]
}

type BlogCommandPaletteProps = {
  entries: BlogCommandEntry[]
}

const MAX_RESULTS = 8

export default function BlogCommandPalette({ entries }: BlogCommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((current) => !current)
        return
      }

      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const filtered = useMemo(() => {
    const uniqueBySlug = new Set<string>()
    const deduped = entries.filter((entry) => {
      if (!entry.slug || uniqueBySlug.has(entry.slug)) return false
      uniqueBySlug.add(entry.slug)
      return true
    })

    const needle = query.trim().toLowerCase()
    if (!needle) return deduped.slice(0, MAX_RESULTS)

    return deduped
      .filter((entry) => {
        const haystack = [entry.title, entry.slug, entry.summary || '', ...(entry.tags || [])].join(' ').toLowerCase()
        return haystack.includes(needle)
      })
      .slice(0, MAX_RESULTS)
  }, [entries, query])

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        className="command-palette-trigger"
        onClick={() => setOpen(true)}
        type="button"
      >
        Search Notes
        <span className="command-palette-kbd">⌘K</span>
      </button>

      {open ? (
        <div className="command-palette-overlay" onClick={(event) => (event.target === event.currentTarget ? setOpen(false) : undefined)}>
          <div aria-label="Search blog posts" aria-modal="true" className="command-palette-panel" role="dialog">
            <div className="command-palette-header">
              <p>Search engineering notes</p>
              <button className="command-palette-close" onClick={() => setOpen(false)} type="button">
                Close
              </button>
            </div>

            <input
              autoFocus
              className="command-palette-input"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, slug, tags..."
              type="search"
              value={query}
            />

            {filtered.length ? (
              <ul className="command-palette-results">
                {filtered.map((entry) => (
                  <li key={entry.slug}>
                    <Link className="command-palette-result" href={`/blog/${entry.slug}`} onClick={() => setOpen(false)}>
                      <span className="command-palette-result-title">{entry.title}</span>
                      {entry.summary ? <span className="command-palette-result-summary">{entry.summary}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="command-palette-empty">No matching posts.</p>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
