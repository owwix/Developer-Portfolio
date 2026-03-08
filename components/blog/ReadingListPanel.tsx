'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'ao-reading-list'

type ReadingListPanelProps = {
  posts: Array<{ slug: string; title: string }>
}

type ReadingListItem = {
  slug: string
  title: string
  addedAt?: string
}

function readList(): ReadingListItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ReadingListItem[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((entry) => entry?.slug)
  } catch {
    return []
  }
}

function writeList(list: ReadingListItem[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  window.dispatchEvent(new Event('reading-list-updated'))
}

export default function ReadingListPanel({ posts }: ReadingListPanelProps) {
  const [items, setItems] = useState<ReadingListItem[]>([])

  useEffect(() => {
    const load = () => setItems(readList())
    load()
    window.addEventListener('storage', load)
    window.addEventListener('reading-list-updated', load)
    return () => {
      window.removeEventListener('storage', load)
      window.removeEventListener('reading-list-updated', load)
    }
  }, [])

  const titlesBySlug = useMemo(() => {
    const map = new Map<string, string>()
    for (const post of posts) {
      if (post.slug) map.set(post.slug, post.title)
    }
    return map
  }, [posts])

  const remove = (slug: string) => {
    const next = items.filter((entry) => entry.slug !== slug)
    setItems(next)
    writeList(next)
  }

  return (
    <section className="card reveal reading-list-panel">
      <div className="section-head">
        <h2>Reading List</h2>
      </div>
      {items.length ? (
        <ul className="reading-list-items">
          {items.map((entry) => (
            <li key={entry.slug}>
              <Link href={`/blog/${entry.slug}`}>{titlesBySlug.get(entry.slug) || entry.title || entry.slug}</Link>
              <button className="reading-list-remove" onClick={() => remove(entry.slug)} type="button">
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">Save posts from any article page to build your reading list.</p>
      )}
    </section>
  )
}
