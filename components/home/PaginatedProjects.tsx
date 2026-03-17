'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import RichTextContent from '../ui/RichTextContent'

type ProjectImage = {
  url?: string
  alt?: string
  sizes?: {
    avatar?: {
      url?: string
    }
  }
}

type ProjectRow = {
  id?: string
  slug?: string
  title?: string
  summary?: unknown
  liveUrl?: string
  repoUrl?: string
  caseStudyUrl?: string
  caseStudyPost?:
    | string
    | {
        slug?: string
        title?: string
      }
  projectImage?:
    | string
    | ProjectImage
  projectImages?: Array<
    | string
    | ProjectImage
    | {
        image?: string | ProjectImage
      }
  >
  focusAreas?: string[]
}

type PaginatedProjectsProps = {
  projects: ProjectRow[]
  pageSize?: number
}

export default function PaginatedProjects({ projects, pageSize = 1 }: PaginatedProjectsProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'frontend' | 'backend' | 'ai' | 'infra'>('all')
  const [page, setPage] = useState(1)
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({})
  const normalizedProjects = useMemo(
    () =>
      projects.map((project) => ({
        ...project,
        focusAreas: Array.isArray(project.focusAreas)
          ? project.focusAreas.map((area) => String(area || '').toLowerCase()).filter(Boolean)
          : [],
      })),
    [projects],
  )
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return normalizedProjects
    return normalizedProjects.filter((project) => project.focusAreas?.includes(activeFilter))
  }, [activeFilter, normalizedProjects])
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredProjects.slice(start, start + pageSize)
  }, [currentPage, filteredProjects, pageSize])

  useEffect(() => {
    setPage(1)
  }, [activeFilter])

  if (!projects.length) {
    return <p className="empty-state">No projects yet.</p>
  }

  const getProjectKey = (project: ProjectRow): string => project.id || project.slug || project.title || 'project'

  const getImageUrl = (image?: ProjectImage | null): string => {
    if (!image) return ''
    return image.url || image.sizes?.avatar?.url || ''
  }

  const getProjectImages = (project: ProjectRow): ProjectImage[] => {
    const galleryImages = Array.isArray(project.projectImages)
      ? project.projectImages
          .map<ProjectImage | null>((entry) => {
            if (!entry || typeof entry === 'string') return null
            if ('image' in entry) {
              const nestedImage = entry.image
              if (!nestedImage || typeof nestedImage === 'string') return null
              return nestedImage
            }
            return entry as ProjectImage
          })
          .filter((image): image is ProjectImage => Boolean(getImageUrl(image)))
      : []

    if (galleryImages.length > 0) return galleryImages

    if (!project.projectImage || typeof project.projectImage === 'string') {
      return []
    }

    return getImageUrl(project.projectImage) ? [project.projectImage] : []
  }

  const getProjectImageAlt = (project: ProjectRow, image?: ProjectImage): string => {
    if (!image) return `${project.title || 'Project'} cover image`
    return image.alt || `${project.title || 'Project'} cover image`
  }

  const getActiveImageIndex = (project: ProjectRow, imageCount: number): number => {
    if (imageCount <= 1) return 0
    const index = imageIndices[getProjectKey(project)] || 0
    return Math.min(Math.max(index, 0), imageCount - 1)
  }

  const moveProjectImage = (project: ProjectRow, imageCount: number, direction: 1 | -1): void => {
    if (imageCount <= 1) return
    const key = getProjectKey(project)
    setImageIndices((prev) => {
      const current = prev[key] || 0
      const next = (current + direction + imageCount) % imageCount
      return { ...prev, [key]: next }
    })
  }

  const getCaseStudy = (project: ProjectRow): { href: string; external: boolean } | null => {
    if (project.caseStudyPost && typeof project.caseStudyPost === 'object' && project.caseStudyPost.slug) {
      return { href: `/blog/${project.caseStudyPost.slug}`, external: false }
    }

    const externalUrl = String(project.caseStudyUrl || '').trim()
    if (/^https?:\/\//i.test(externalUrl)) {
      return { href: externalUrl, external: true }
    }

    return null
  }

  const filterOptions: Array<{ value: 'all' | 'frontend' | 'backend' | 'ai' | 'infra'; label: string }> = [
    { value: 'all', label: `All (${projects.length})` },
    { value: 'frontend', label: `Frontend (${normalizedProjects.filter((project) => project.focusAreas?.includes('frontend')).length})` },
    { value: 'backend', label: `Backend (${normalizedProjects.filter((project) => project.focusAreas?.includes('backend')).length})` },
    { value: 'ai', label: `AI (${normalizedProjects.filter((project) => project.focusAreas?.includes('ai')).length})` },
    { value: 'infra', label: `Infra (${normalizedProjects.filter((project) => project.focusAreas?.includes('infra')).length})` },
  ]

  const formatFocusArea = (value: string): string => {
    if (value === 'ai') return 'AI'
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  return (
    <>
      <div aria-label="Filter projects by focus area" className="tag-filter-group project-filter-group" role="tablist">
        {filterOptions.map((option) => (
          <button
            aria-selected={activeFilter === option.value}
            className={`filter-pill ${activeFilter === option.value ? 'is-active' : ''}`.trim()}
            key={option.value}
            onClick={() => setActiveFilter(option.value)}
            role="tab"
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="stack">
        {!filteredProjects.length ? <p className="empty-state">No projects found for this filter yet.</p> : null}
        {paginatedProjects.map((project) => (
          <article className="item" key={getProjectKey(project)}>
            {(() => {
              const caseStudy = getCaseStudy(project)
              const images = getProjectImages(project)
              if (!images.length) return null

              const activeIndex = getActiveImageIndex(project, images.length)
              const activeImage = images[activeIndex]
              const imageElement = (
                <img alt={getProjectImageAlt(project, activeImage)} className="project-item-image" src={getImageUrl(activeImage)} />
              )

              const imageContent = caseStudy ? (
                caseStudy.external ? (
                  <a data-journey-type="case-study" href={caseStudy.href} rel="noreferrer" target="_blank">
                    {imageElement}
                  </a>
                ) : (
                  <Link data-journey-type="case-study" href={caseStudy.href}>
                    {imageElement}
                  </Link>
                )
              ) : (
                imageElement
              )

              return (
                <div className="project-image-shell">
                  {imageContent}
                  {images.length > 1 ? (
                    <div className="project-image-controls">
                      <button
                        aria-label={`Show previous image for ${project.title || 'project'}`}
                        className="pagination-btn project-image-btn"
                        onClick={() => moveProjectImage(project, images.length, -1)}
                        type="button"
                      >
                        Left
                      </button>
                      <span className="project-image-status">
                        {activeIndex + 1} / {images.length}
                      </span>
                      <button
                        aria-label={`Show next image for ${project.title || 'project'}`}
                        className="pagination-btn project-image-btn"
                        onClick={() => moveProjectImage(project, images.length, 1)}
                        type="button"
                      >
                        Right
                      </button>
                    </div>
                  ) : null}
                </div>
              )
            })()}
            <h3>{project.title || 'Untitled Project'}</h3>
            <RichTextContent className="rich-text-content summary-richtext" fallback="No summary available." value={project.summary} />
            <div className="meta">
              {(project.focusAreas || []).map((area) => (
                <span className="badge" key={`${getProjectKey(project)}-focus-${area}`}>
                  {formatFocusArea(area)}
                </span>
              ))}
              {project.liveUrl ? (
                <a className="badge badge-link" data-journey-type="project-live" href={project.liveUrl} rel="noreferrer" target="_blank">
                  Live URL
                </a>
              ) : null}
              {project.repoUrl ? (
                <a className="badge badge-link" data-journey-type="repo" href={project.repoUrl} rel="noreferrer" target="_blank">
                  Repo
                </a>
              ) : null}
              {(() => {
                const caseStudy = getCaseStudy(project)
                if (!caseStudy) return null

                if (caseStudy.external) {
                  return (
                    <a className="badge badge-link" data-journey-type="case-study" href={caseStudy.href} rel="noreferrer" target="_blank">
                      Case Study
                    </a>
                  )
                }

                return (
                  <Link className="badge badge-link" data-journey-type="case-study" href={caseStudy.href}>
                    Case Study
                  </Link>
                )
              })()}
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
