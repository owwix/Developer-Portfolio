'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ao-reading-list'

type BookmarkButtonProps = {
  slug: string
  title: string
}

type ReadingListItem = {
  slug: string
  title: string
  addedAt: string
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

export default function BookmarkButton({ slug, title }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const list = readList()
    setSaved(list.some((entry) => entry.slug === slug))
  }, [slug])

  const toggle = () => {
    const list = readList()
    const has = list.some((entry) => entry.slug === slug)

    if (has) {
      writeList(list.filter((entry) => entry.slug !== slug))
      setSaved(false)
      return
    }

    const next = [
      { slug, title, addedAt: new Date().toISOString() },
      ...list.filter((entry) => entry.slug !== slug),
    ]
    writeList(next)
    setSaved(true)
  }

  return (
    <button className={`bookmark-btn${saved ? ' is-saved' : ''}`} onClick={toggle} type="button">
      {saved ? 'Saved to Reading List' : 'Save to Reading List'}
    </button>
  )
}
