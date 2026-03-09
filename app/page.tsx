import Link from 'next/link'
import BlogCard from '../components/blog/BlogCard'
import PaginatedProjects from '../components/home/PaginatedProjects'
import PaginatedSkillCategories from '../components/home/PaginatedSkillCategories'
import OpenSourceCard from '../components/open-source/OpenSourceCard'
import RichTextContent from '../components/ui/RichTextContent'
import { type BlogPost } from '../lib/blog'
import { fetchBlogPosts, fetchExperiences, fetchHome, fetchOpenSourceResources, fetchProjects, fetchSkills } from '../lib/cms'
import { defaultOpenSourceResources, normalizeOpenSourceResources, type OpenSourceResource, type OpenSourceResourceRow } from '../lib/openSource'
import { siteConfig } from '../src/utils/siteConfig'
import { sortByDisplayOrder } from '../src/utils/order'

export const dynamic = 'force-dynamic'

type HomeData = {
  name?: string
  headline?: string
  bio?: unknown
  email?: string
  links?: HomeLink[]
  profilePhoto?: {
    url?: string
    alt?: string
  }
}

type HomeLink = {
  label?: string
  url?: string
  icon?: string
  customIcon?:
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

type SocialIconType = 'linkedin' | 'github' | 'email' | 'phone'

type SkillRow = {
  displayOrder?: number
  name?: string
  category?: string
  skills?: SkillRow[]
}

type ExperienceRow = {
  id?: string
  displayOrder?: number
  role?: string
  company?: string
  summary?: unknown
  location?: string
  current?: boolean
  startDate?: string
  endDate?: string
}

type ProjectRow = {
  id?: string
  displayOrder?: number
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

function inferSocialIcon(link: HomeLink): SocialIconType | null {
  const icon = String(link?.icon || '').toLowerCase()
  if (icon === 'linkedin' || icon === 'github' || icon === 'email' || icon === 'phone') return icon

  const label = String(link?.label || '').toLowerCase()
  const url = String(link?.url || '').toLowerCase()

  if (label.includes('linkedin') || url.includes('linkedin.com')) return 'linkedin'
  if (label.includes('github') || url.includes('github.com')) return 'github'
  if (label.includes('email') || url.startsWith('mailto:')) return 'email'
  if (label.includes('phone') || label.includes('call') || url.startsWith('tel:')) return 'phone'
  return null
}

function getCustomIconUrl(link: HomeLink): string {
  if (!link?.customIcon || typeof link.customIcon === 'string') return ''
  return link.customIcon.url || link.customIcon.sizes?.avatar?.url || ''
}

function formatExperienceDate(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function getExperienceDateRange(exp: ExperienceRow): string {
  const start = formatExperienceDate(exp.startDate)
  if (!start) return ''
  if (exp.current) return `${start} - Present`
  const end = formatExperienceDate(exp.endDate)
  return end ? `${start} - ${end}` : start
}

function SocialLinkIcon({ type }: { type: SocialIconType }) {
  if (type === 'email') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path
          d="M3.5 5.5h17a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1m0 2v.23l8.5 5.67 8.5-5.67V7.5l-8.5 5.67L3.5 7.5m0 2.03v6.97h17V9.53l-7.95 5.3a1 1 0 0 1-1.1 0L3.5 9.53"
          fill="currentColor"
        />
      </svg>
    )
  }

  if (type === 'phone') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path
          d="M7.26 3.24c.39-.39 1-.49 1.5-.24l2.27 1.13c.56.28.84.92.67 1.53l-.49 1.8a1 1 0 0 0 .25.97l2.57 2.57a1 1 0 0 0 .97.25l1.8-.49c.61-.17 1.25.11 1.53.67L21 13.7c.25.5.15 1.11-.24 1.5l-1.55 1.55c-.98.98-2.43 1.35-3.75.96-2.6-.78-5.28-2.95-7.58-5.25-2.3-2.3-4.47-4.98-5.25-7.58-.39-1.32-.02-2.77.96-3.75z"
          fill="currentColor"
        />
      </svg>
    )
  }

  if (type === 'linkedin') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path
          d="M6.939 8.5H3.41A.41.41 0 0 0 3 8.91v11.68c0 .227.184.41.41.41h3.53a.41.41 0 0 0 .41-.41V8.91a.41.41 0 0 0-.41-.41M5.175 3A2.175 2.175 0 1 0 5.176 7.35 2.175 2.175 0 0 0 5.175 3M20.593 13.52v7.07a.41.41 0 0 1-.41.41h-3.524a.41.41 0 0 1-.41-.41v-6.26c0-.94-.18-2.06-1.44-2.06-1.35 0-1.63 1.02-1.63 2.06v6.26a.41.41 0 0 1-.41.41H9.248a.41.41 0 0 1-.41-.41V8.91c0-.226.184-.41.41-.41h3.37a.41.41 0 0 1 .41.41v1.01h.03c.4-.76 1.42-1.38 2.93-1.38 3.17 0 4.61 1.86 4.61 4.98"
          fill="currentColor"
        />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.08 3.29 9.39 7.85 10.91.57.11.77-.25.77-.55 0-.27-.01-1.16-.02-2.1-3.19.69-3.86-1.36-3.86-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.69.08-.69 1.15.08 1.75 1.18 1.75 1.18 1.02 1.76 2.68 1.25 3.33.95.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.21-1.5 3.18-1.18 3.18-1.18.62 1.6.23 2.77.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.68 5.38-5.24 5.67.41.35.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.15 0 .3.2.67.78.55A11.53 11.53 0 0 0 23.5 12.02C23.5 5.66 18.35.5 12 .5"
        fill="currentColor"
      />
    </svg>
  )
}

export default async function HomePage() {
  let home: HomeData | null = null
  let projects: ProjectRow[] = []
  let skills: SkillRow[] = []
  let experiences: ExperienceRow[] = []
  let blogs: BlogPost[] = []
  let openSource: OpenSourceResource[] = defaultOpenSourceResources

  try {
    const [homeRes, projectsRes, skillsRes, expRes, blogRes, openSourceRes] = await Promise.all([
      fetchHome<HomeData>(),
      fetchProjects<{ docs?: ProjectRow[] }>(100),
      fetchSkills<{ docs?: SkillRow[] }>(100),
      fetchExperiences<{ docs?: ExperienceRow[] }>(6),
      fetchBlogPosts<{ docs?: BlogPost[] }>(40),
      fetchOpenSourceResources<{ docs?: OpenSourceResourceRow[] }>(200),
    ])

    home = homeRes
    projects = sortByDisplayOrder(projectsRes?.docs || [])
    skills = sortByDisplayOrder(skillsRes?.docs || [])
    experiences = sortByDisplayOrder(expRes?.docs || [])
    blogs = sortByDisplayOrder(blogRes?.docs || []).slice(0, 3)
    const fromCMS = normalizeOpenSourceResources(openSourceRes?.docs || [])
    if (fromCMS.length) openSource = fromCMS
  } catch (error) {
    console.error(error)
  }

  const skillRows = skills.flatMap((doc) => {
    if (Array.isArray(doc?.skills) && doc.skills.length) {
      return doc.skills
    }
    if (doc?.name) {
      return [doc]
    }
    return []
  })

  const groupedSkills = skillRows.reduce<Record<string, SkillRow[]>>((acc, row) => {
    const key = row?.category || 'general'
    if (!acc[key]) acc[key] = []
    acc[key].push(row)
    return acc
  }, {})
  const openSourcePreview = openSource.filter((item) => item.showOnHomepage !== false).slice(0, 3)

  return (
    <main className="container page-home">
      <header className="card hero reveal">
        <div className="hero-main">
          {home?.profilePhoto?.url ? (
            <img alt={home.profilePhoto?.alt || 'Profile photo'} className="avatar" src={home.profilePhoto.url} />
          ) : null}
          <div className="hero-copy">
            <p className="eyebrow">{home?.headline || 'Software Engineer'}</p>
            <h1>{home?.name || siteConfig.ownerName}</h1>
            <RichTextContent
              className="bio rich-text-content"
              fallback="Full-stack software engineer focused on React, Next.js, TypeScript, platform reliability, and practical product delivery."
              value={home?.bio}
            />
            <p className="hero-blog-note">
              I document architecture decisions, build logs, and engineering lessons learned while building production systems in
              my{' '}
              <Link href="/blog" className="hero-blog-link">
                blog
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="links">
          {home?.email ? (
            <span className="pill social-link-pill">
              <span aria-hidden="true" className="link-pill-icon">
                <SocialLinkIcon type="email" />
              </span>
              Email: {home.email}
            </span>
          ) : null}
          {(home?.links || []).map((link) => {
            if (!link?.url || String(link.url).toLowerCase().startsWith('mailto:')) return null
            const customIconUrl = getCustomIconUrl(link)
            const iconType = inferSocialIcon(link)

            return (
              <a className="social-link-pill" href={link.url} key={`${link.label}-${link.url}`} rel="noreferrer" target="_blank">
                {customIconUrl ? (
                  <img alt="" aria-hidden="true" className="link-pill-image-icon" src={customIconUrl} />
                ) : iconType ? (
                  <span aria-hidden="true" className="link-pill-icon">
                    <SocialLinkIcon type={iconType} />
                  </span>
                ) : null}
                {link.label || 'Link'}
              </a>
            )
          })}
          <Link href="/reach-by-phone" className="pill-link social-link-pill">
            <span aria-hidden="true" className="link-pill-icon">
              <SocialLinkIcon type="phone" />
            </span>
            Reach Me by Phone
          </Link>
        </div>
      </header>

      <section className="grid">
        <article className="card reveal">
          <h2>Projects</h2>
          <PaginatedProjects projects={projects} />
        </article>

        <article className="card reveal">
          <h2>Skills</h2>
          <PaginatedSkillCategories groupedSkills={groupedSkills} />
        </article>

        <article className="card reveal full">
          <div className="section-head">
            <h2>Open Source</h2>
            <Link className="view-all-link" href="/open-source">
              View All Resources
            </Link>
          </div>
          <p className="open-source-subtitle">
            Reusable templates, starter kits, and developer tools built for real-world use.
          </p>
          <div className="open-source-grid">
            {openSourcePreview.map((resource) => (
              <OpenSourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </article>

        <article className="card reveal full">
          <h2>Experience</h2>
          {experiences.length ? (
            <div className="stack">
              {experiences.map((exp) => {
                const dateRange = getExperienceDateRange(exp)

                return (
                  <article className="item" key={exp.id || `${exp.company}-${exp.role}`}>
                    <h3>
                      {exp.role || 'Role'} {exp.company ? `- ${exp.company}` : ''}
                    </h3>
                    <RichTextContent className="rich-text-content summary-richtext" fallback="No summary yet." value={exp.summary} />
                    <div className="meta">
                      {dateRange ? <span className="badge">{dateRange}</span> : null}
                      {exp.location ? <span className="badge">{exp.location}</span> : null}
                      {exp.current ? <span className="badge featured">Current</span> : null}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <p className="empty-state">No experience entries yet.</p>
          )}
        </article>

        <article className="card reveal full">
          <div className="section-head">
            <h2>{siteConfig.blogLabel}</h2>
            <Link className="view-all-link" href="/blog">
              View All {siteConfig.blogLabel === 'Lab / Notes' ? 'Notes' : 'Posts'}
            </Link>
          </div>

          {blogs.length ? (
            <div className="blog-grid home-blog-grid">
              {blogs.map((post) => (
                <BlogCard key={post.id || post.slug} post={post} variant="preview" />
              ))}
            </div>
          ) : (
            <p className="empty-state">No notes published yet.</p>
          )}
        </article>
      </section>
    </main>
  )
}
