import Link from 'next/link'
import BlogCard from '../components/blog/BlogCard'
import PaginatedProjects from '../components/home/PaginatedProjects'
import PaginatedSkillCategories from '../components/home/PaginatedSkillCategories'
import type { BlogPost } from '../lib/blog'
import { fetchBlogPosts, fetchExperiences, fetchHome, fetchProjects, fetchSkills } from '../lib/cms'

export const dynamic = 'force-dynamic'

type HomeData = {
  name?: string
  headline?: string
  bio?: string
  email?: string
  links?: Array<{ label?: string; url?: string }>
  profilePhoto?: {
    url?: string
    alt?: string
  }
}

type SkillRow = {
  name?: string
  category?: string
  skills?: SkillRow[]
}

type ExperienceRow = {
  id?: string
  role?: string
  company?: string
  summary?: string
  location?: string
  current?: boolean
}

type ProjectRow = {
  id?: string
  slug?: string
  title?: string
  summary?: string
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

export default async function HomePage() {
  let home: HomeData | null = null
  let projects: ProjectRow[] = []
  let skills: SkillRow[] = []
  let experiences: ExperienceRow[] = []
  let blogs: BlogPost[] = []

  try {
    const [homeRes, projectsRes, skillsRes, expRes, blogRes] = await Promise.all([
      fetchHome<HomeData>(),
      fetchProjects<{ docs?: ProjectRow[] }>(100),
      fetchSkills<{ docs?: SkillRow[] }>(100),
      fetchExperiences<{ docs?: ExperienceRow[] }>(6),
      fetchBlogPosts<{ docs?: BlogPost[] }>(40),
    ])

    home = homeRes
    projects = projectsRes?.docs || []
    skills = skillsRes?.docs || []
    experiences = expRes?.docs || []
    blogs = (blogRes?.docs || []).slice(0, 3)
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

  return (
    <main className="container page-home">
      <header className="card hero reveal">
        <div className="hero-main">
          {home?.profilePhoto?.url ? (
            <img alt={home.profilePhoto?.alt || 'Profile photo'} className="avatar" src={home.profilePhoto.url} />
          ) : null}
          <div className="hero-copy">
            <p className="eyebrow">{home?.headline || 'Software Engineer'}</p>
            <h1>{home?.name || 'Alexander Okonkwo'}</h1>
            <p className="bio">
              {home?.bio ||
                'Full-stack software engineer focused on React, Next.js, TypeScript, platform reliability, and practical product delivery.'}
            </p>
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
          {home?.email ? <span className="pill">Email: {home.email}</span> : null}
          {(home?.links || []).map((link) =>
            link?.url && !String(link.url).toLowerCase().startsWith('mailto:') ? (
              <a href={link.url} key={`${link.label}-${link.url}`} rel="noreferrer" target="_blank">
                {link.label || 'Link'}
              </a>
            ) : null,
          )}
          <Link href="/reach-by-phone" className="pill-link">
            → Reach Me by Phone
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
          <h2>Experience</h2>
          {experiences.length ? (
            <div className="stack">
              {experiences.map((exp) => (
                <article className="item" key={exp.id || `${exp.company}-${exp.role}`}>
                  <h3>
                    {exp.role || 'Role'} {exp.company ? `- ${exp.company}` : ''}
                  </h3>
                  <p>{exp.summary || 'No summary yet.'}</p>
                  <div className="meta">
                    {exp.location ? <span className="badge">{exp.location}</span> : null}
                    {exp.current ? <span className="badge featured">Current</span> : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No experience entries yet.</p>
          )}
        </article>

        <article className="card reveal full">
          <div className="section-head">
            <h2>Lab / Notes</h2>
            <Link className="view-all-link" href="/blog">
              View All Notes
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
