'use client'

import { useMemo, useState } from 'react'
import type { BlogPost } from '../../lib/blog'
import { getTags, toDisplayText } from '../../lib/blog'
import BlogCard from './BlogCard'

export default function ArchiveFilters({ posts = [] }: { posts?: BlogPost[] }) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('all')

  const tags = useMemo(() => {
    const values = new Set<string>()
    for (const post of posts) {
      for (const tag of getTags(post)) values.add(tag)
    }
    return ['all', ...Array.from(values).sort((a, b) => a.localeCompare(b))]
  }, [posts])

  const filteredPosts = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return posts.filter((post) => {
      const tagMatch = activeTag === 'all' || getTags(post).includes(activeTag)
      if (!tagMatch) return false
      if (!needle) return true

      const haystack = [post.title, toDisplayText(post.summary), toDisplayText(post.content), ...getTags(post)].join(' ').toLowerCase()
      return haystack.includes(needle)
    })
  }, [activeTag, posts, query])

  return (
    <section className="archive-panel card reveal" aria-label="Blog archive">
      <div className="archive-controls">
        <label className="search-wrap" htmlFor="notes-search">
          <span>Search notes</span>
          <input
            id="notes-search"
            name="notes-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search architecture, CI/CD, Next.js, debugging..."
          />
        </label>

        <div className="tag-filter-group" role="tablist" aria-label="Filter by topic">
          {tags.map((tag) => {
            const active = tag === activeTag
            return (
              <button
                className={`filter-pill${active ? ' is-active' : ''}`}
                key={tag}
                onClick={() => setActiveTag(tag)}
                type="button"
              >
                {tag === 'all' ? 'All Topics' : tag}
              </button>
            )
          })}
        </div>
      </div>

      {filteredPosts.length ? (
        <div className="blog-grid archive-grid">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id || post.slug} post={post} variant="archive" />
          ))}
        </div>
      ) : (
        <p className="empty-state">No notes match your current search/filter.</p>
      )}
    </section>
  )
}
