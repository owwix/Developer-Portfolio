'use client'

import { useMemo } from 'react'

type SkillRow = {
  name?: string
}

type PaginatedSkillCategoriesProps = {
  groupedSkills: Record<string, SkillRow[]>
}

export default function PaginatedSkillCategories({ groupedSkills }: PaginatedSkillCategoriesProps) {
  const categories = useMemo(() => Object.entries(groupedSkills), [groupedSkills])

  if (!categories.length) {
    return <p className="empty-state">No skills configured yet.</p>
  }

  return (
    <div className="stack">
      {categories.map(([category, rows]) => (
        <section className="skill-category" key={category}>
          <h3 className="skill-category-title">{category.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}</h3>
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
  )
}
