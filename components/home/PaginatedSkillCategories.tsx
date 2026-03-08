'use client'

import { useMemo, useState } from 'react'

type SkillRow = {
  name?: string
}

type PaginatedSkillCategoriesProps = {
  groupedSkills: Record<string, SkillRow[]>
  pageSize?: number
}

export default function PaginatedSkillCategories({ groupedSkills, pageSize = 1 }: PaginatedSkillCategoriesProps) {
  const [page, setPage] = useState(1)

  const categories = useMemo(() => Object.entries(groupedSkills), [groupedSkills])
  const totalPages = Math.max(1, Math.ceil(categories.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return categories.slice(start, start + pageSize)
  }, [categories, currentPage, pageSize])

  if (!categories.length) {
    return <p className="empty-state">No skills configured yet.</p>
  }

  return (
    <>
      <div className="stack">
        {paginatedCategories.map(([category, rows]) => (
          <section className="skill-category" key={category}>
            <h3 className="skill-category-title">{category.replace(/-/g, ' ')}</h3>
            <div className="meta">
              {rows.slice(0, 6).map((skill) => (
                <span className="badge" key={`${category}-${skill.name}`}>
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        ))}
      </div>

      {totalPages > 1 ? (
        <nav aria-label="Skills pagination" className="pagination-bar">
          <p className="pagination-status">
            Page {currentPage} of {totalPages}
          </p>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} type="button">
              Prev
            </button>
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </nav>
      ) : null}
    </>
  )
}
