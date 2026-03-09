'use client'

import { useMemo, useState } from 'react'
import RichTextContent from '../ui/RichTextContent'

type ProjectRow = {
  id?: string
  slug?: string
  title?: string
  summary?: unknown
  liveUrl?: string
  repoUrl?: string
  projectImage?:
    | string
    | {
        url?: string
        alt?: string
        sizes?: {
          avatar?: {
            url?: string
          }
        }
      }
}

type PaginatedProjectsProps = {
  projects: ProjectRow[]
  pageSize?: number
}

export default function PaginatedProjects({ projects, pageSize = 1 }: PaginatedProjectsProps) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(projects.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return projects.slice(start, start + pageSize)
  }, [currentPage, pageSize, projects])

  if (!projects.length) {
    return <p className="empty-state">No projects yet.</p>
  }

  const getProjectImage = (project: ProjectRow): string => {
    if (!project.projectImage || typeof project.projectImage === 'string') {
      return ''
    }
    return project.projectImage.url || project.projectImage.sizes?.avatar?.url || ''
  }

  const getProjectImageAlt = (project: ProjectRow): string => {
    if (!project.projectImage || typeof project.projectImage === 'string') {
      return `${project.title || 'Project'} cover image`
    }
    return project.projectImage.alt || `${project.title || 'Project'} cover image`
  }

  return (
    <>
      <div className="stack">
        {paginatedProjects.map((project) => (
          <article className="item" key={project.id || project.slug || project.title}>
            {getProjectImage(project) ? (
              <img alt={getProjectImageAlt(project)} className="project-item-image" src={getProjectImage(project)} />
            ) : null}
            <h3>{project.title || 'Untitled Project'}</h3>
            <RichTextContent className="rich-text-content summary-richtext" fallback="No summary available." value={project.summary} />
            <div className="meta">
              {project.liveUrl ? (
                <a className="badge badge-link" href={project.liveUrl} rel="noreferrer" target="_blank">
                  Live URL
                </a>
              ) : null}
              {project.repoUrl ? (
                <a className="badge badge-link" href={project.repoUrl} rel="noreferrer" target="_blank">
                  Repo
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 ? (
        <nav aria-label="Projects pagination" className="pagination-bar">
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
