import { useMemo, type ReactNode } from 'react'
import { usePayloadAPI } from 'payload/components/hooks'
import { siteConfig } from '../../utils/siteConfig'

type NoteDoc = {
  id?: string
  title?: string
  updatedAt?: string
  _status?: 'draft' | 'published'
  isComingSoon?: boolean
}

type ProjectDoc = {
  id?: string
  title?: string
  updatedAt?: string
}

function formatDate(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function EntryLink({ href, title, meta }: { href: string; title: string; meta: string }) {
  return (
    <a className="ao-dashboard-link" href={href}>
      <span className="ao-dashboard-link-title">{title}</span>
      <span className="ao-dashboard-link-meta">{meta}</span>
    </a>
  )
}

function DashboardSection({ title, actionHref, actionLabel, children }: { title: string; actionHref: string; actionLabel: string; children: ReactNode }) {
  return (
    <section className="ao-dashboard-section">
      <header className="ao-dashboard-section-head">
        <h3>{title}</h3>
        <a href={actionHref}>{actionLabel}</a>
      </header>
      {children}
    </section>
  )
}

export default function EditorialDashboard() {
  const [notesResult] = usePayloadAPI('/api/blog-posts?limit=5&sort=-updatedAt')
  const [draftResult] = usePayloadAPI('/api/blog-posts?limit=5&sort=-updatedAt&where[_status][equals]=draft')
  const [projectResult] = usePayloadAPI('/api/projects?limit=4&sort=-updatedAt')

  const notes = useMemo<NoteDoc[]>(() => notesResult?.data?.docs || [], [notesResult?.data])
  const drafts = useMemo<NoteDoc[]>(() => draftResult?.data?.docs || [], [draftResult?.data])
  const projects = useMemo<ProjectDoc[]>(() => projectResult?.data?.docs || [], [projectResult?.data])

  return (
    <section className="ao-dashboard-root">
      <header className="ao-dashboard-hero">
        <p className="ao-dashboard-eyebrow">Editorial Dashboard</p>
        <h2>{siteConfig.blogLabel} CMS</h2>
        <p>Manage publishing workflows, portfolio content, and site operations from one focused control center.</p>
      </header>

      <div className="ao-dashboard-grid">
        <DashboardSection actionHref="/admin/collections/blog-posts/create" actionLabel="New Note" title="Recent Notes">
          {notes.length ? (
            <div className="ao-dashboard-list">
              {notes.map((note) => (
                <EntryLink
                  href={note.id ? `/admin/collections/blog-posts/${note.id}` : '/admin/collections/blog-posts'}
                  key={note.id ? String(note.id) : `note-${note.title || 'untitled'}`}
                  meta={note.isComingSoon ? 'Coming soon' : formatDate(note.updatedAt) || 'Recently updated'}
                  title={note.title || 'Untitled note'}
                />
              ))}
            </div>
          ) : (
            <p className="ao-dashboard-empty">No notes yet.</p>
          )}
        </DashboardSection>

        <DashboardSection actionHref="/admin/collections/blog-posts?where[_status][equals]=draft" actionLabel="View Drafts" title="Draft Notes">
          {drafts.length ? (
            <div className="ao-dashboard-list">
              {drafts.map((note) => (
                <EntryLink
                  href={note.id ? `/admin/collections/blog-posts/${note.id}` : '/admin/collections/blog-posts'}
                  key={note.id ? String(note.id) : `draft-${note.title || 'untitled'}`}
                  meta={formatDate(note.updatedAt) || 'Draft'}
                  title={note.title || 'Untitled draft'}
                />
              ))}
            </div>
          ) : (
            <p className="ao-dashboard-empty">No active drafts.</p>
          )}
        </DashboardSection>

        <DashboardSection actionHref="/admin/collections/projects/create" actionLabel="New Project" title="Projects">
          {projects.length ? (
            <div className="ao-dashboard-list">
              {projects.map((project) => (
                <EntryLink
                  href={project.id ? `/admin/collections/projects/${project.id}` : '/admin/collections/projects'}
                  key={project.id ? String(project.id) : `project-${project.title || 'untitled'}`}
                  meta={formatDate(project.updatedAt) || 'Recently updated'}
                  title={project.title || 'Untitled project'}
                />
              ))}
            </div>
          ) : (
            <p className="ao-dashboard-empty">No projects yet.</p>
          )}
        </DashboardSection>

        <section className="ao-dashboard-section">
          <header className="ao-dashboard-section-head">
            <h3>Quick Actions</h3>
          </header>
          <div className="ao-dashboard-actions">
            <a href="/admin/collections/blog-posts/create">Write Note</a>
            <a href="/admin/collections/media">Upload Asset</a>
            <a href="/admin/collections/phone-requests">Review Inquiries</a>
            <a href="/admin/globals/home">Edit Homepage Content</a>
          </div>
        </section>
      </div>
    </section>
  )
}
