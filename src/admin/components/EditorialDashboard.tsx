import { useMemo, type ReactNode } from 'react'
import { usePayloadAPI } from 'payload/components/hooks'
import { siteConfig } from '../../utils/siteConfig'

type NoteDoc = {
  id?: string
  title?: string
  slug?: string
  updatedAt?: string
  _status?: 'draft' | 'published'
  isComingSoon?: boolean
}

type ProjectDoc = {
  id?: string
  title?: string
  updatedAt?: string
}

type InquiryDoc = {
  id?: string
}

type JourneyDoc = {
  id?: string
  sourcePath?: string
  targetPath?: string
  journeyType?: string
  count?: number
}

type QueryData<T> = {
  docs?: T[]
  totalDocs?: number
}

type MetricCardProps = {
  label: string
  value: number
  helper: string
}

type SectionCardProps = {
  title: string
  actionLabel?: string
  actionHref?: string
  children: ReactNode
}

type ListRowProps = {
  href: string
  title: string
  meta: string
}

type EmptyStateProps = {
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
}

type ActionLink = {
  href: string
  label: string
}

function formatDate(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function toTitleCase(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function truncateLabel(value: string, maxLength = 48): string {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1)}…`
}

function formatPathLabel(path?: string, blogTitleBySlug?: Record<string, string>): string {
  const raw = String(path || '').trim()
  if (!raw) return 'Unknown'
  if (raw === '/') return 'Home'
  if (raw === '/blog') return 'Blog'
  if (raw === '/reach-by-phone') return 'Reach by Phone'
  if (raw === '/open-source') return 'Open Source'
  if (raw === '/now') return 'Now'
  if (raw.startsWith('external:')) {
    const externalTarget = raw.replace(/^external:/, '')
    return `External: ${truncateLabel(externalTarget, 42)}`
  }
  if (raw === 'mailto') return 'Email Link'
  if (raw === 'tel') return 'Phone Link'
  if (raw.startsWith('/blog/')) {
    const slug = raw.replace('/blog/', '').split('/')[0] || ''
    const mappedTitle = slug ? blogTitleBySlug?.[slug] : ''
    if (mappedTitle) {
      return `Blog: ${truncateLabel(mappedTitle, 38)}`
    }
    const title = toTitleCase(slug.replace(/[-_]+/g, ' '))
    return `Blog: ${truncateLabel(title, 38)}`
  }
  if (raw.startsWith('/')) {
    const cleaned = toTitleCase(raw.replace(/^\//, '').replace(/[-_/]+/g, ' '))
    return truncateLabel(cleaned || raw, 48)
  }
  return truncateLabel(raw, 48)
}

function formatJourneyTypeLabel(value?: string): string {
  const normalized = String(value || 'navigation').trim().toLowerCase()
  const labels: Record<string, string> = {
    navigation: 'Navigation',
    outbound: 'Outbound',
    contact: 'Contact',
    'blog-open': 'Blog Open',
    repo: 'Repo',
    'project-live': 'Live Project',
    'case-study': 'Case Study',
  }
  return labels[normalized] || toTitleCase(normalized.replace(/[-_]+/g, ' '))
}

function countTotal<T>(result: unknown): number {
  const data = (result as { data?: QueryData<T> } | undefined)?.data
  return Number(data?.totalDocs ?? data?.docs?.length ?? 0)
}


function formatRate(value: number): string {
  if (!Number.isFinite(value)) return '0%'
  return `${Math.round(value * 10) / 10}%`
}

function sumJourneys(items: JourneyDoc[], predicate: (item: JourneyDoc) => boolean): number {
  return items.reduce((total, item) => {
    if (!predicate(item)) return total
    const count = Number(item?.count || 0)
    return total + (Number.isFinite(count) ? count : 0)
  }, 0)
}

function AdminDashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard dashboard-shell">
      <div className="dashboard__wrap dashboard-canvas mx-auto w-full p-6">{children}</div>
    </div>
  )
}

function DashboardHeader() {
  return (
    <header className="dashboard-header rounded-2xl border border-zinc-800 bg-panel p-6">
      <p className="text-xs uppercase tracking-editorial font-medium text-zinc-500">Editorial Dashboard</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">{siteConfig.blogLabel} CMS</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
        Manage publishing workflows, portfolio content, and site operations from one focused control center.
      </p>
    </header>
  )
}

function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <article className="metric-card rounded-xl border border-zinc-800 bg-metric px-4 py-3">
      <p className="text-xs uppercase tracking-editorial text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{helper}</p>
    </article>
  )
}

function MetricsStrip({ metrics }: { metrics: MetricCardProps[] }) {
  return (
    <section className="dashboard-metrics mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard helper={metric.helper} key={metric.label} label={metric.label} value={metric.value} />
      ))}
    </section>
  )
}

function SectionCard({ title, actionLabel, actionHref, children }: SectionCardProps) {
  return (
    <section className="section-card rounded-2xl border border-zinc-800 bg-panel p-5 min-h-section">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {actionLabel && actionHref ? (
          <a className="text-xs uppercase tracking-editorial text-zinc-500 transition hover:text-zinc-300 focus-ring rounded-lg px-2 py-1" href={actionHref}>
            {actionLabel}
          </a>
        ) : null}
      </header>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  )
}

function ListRow({ href, title, meta }: ListRowProps) {
  return (
    <a className="dashboard-list-row ao-list-row block rounded-xl border border-zinc-900 bg-row px-4 py-3 transition duration-150 focus-ring" href={href}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-100">{title}</p>
          <p className="mt-2 text-xs text-zinc-500">{meta}</p>
        </div>
        <span aria-hidden="true" className="ao-row-chevron text-zinc-500">
          →
        </span>
      </div>
    </a>
  )
}

function EmptyState({ title, description, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="dashboard-empty-state rounded-xl border border-dashed border-zinc-800 bg-empty px-4 py-5">
      <p className="text-sm font-medium text-zinc-200">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
      {ctaLabel && ctaHref ? (
        <a className="mt-3 inline-flex items-center rounded-lg px-2 py-1 text-sm font-medium text-white transition hover:text-zinc-300 focus-ring" href={ctaHref}>
          {ctaLabel}
        </a>
      ) : null}
    </div>
  )
}

function PrimaryActionButton({ href, label }: ActionLink) {
  return (
    <a className="dashboard-primary-action inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition hover-lift hover:bg-zinc-200 focus-ring" href={href}>
      {label}
    </a>
  )
}

function SecondaryActionButton({ href, label }: ActionLink) {
  return (
    <a className="dashboard-secondary-action inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-transparent px-4 py-3 text-sm font-medium text-zinc-200 transition hover-lift hover:border-zinc-700 hover:bg-zinc-900 focus-ring" href={href}>
      {label}
    </a>
  )
}

function QuickActionGrid({ primaryAction, secondaryActions }: { primaryAction: ActionLink; secondaryActions: ActionLink[] }) {
  return (
    <div className="quick-action-grid grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <PrimaryActionButton href={primaryAction.href} label={primaryAction.label} />
      </div>
      {secondaryActions.map((action) => (
        <SecondaryActionButton href={action.href} key={action.href} label={action.label} />
      ))}
    </div>
  )
}

export default function EditorialDashboard() {
  const [notesResult] = usePayloadAPI('/api/blog-posts?limit=5&sort=-updatedAt')
  const [allNotesResult] = usePayloadAPI('/api/blog-posts?limit=250&sort=-updatedAt')
  const [draftResult] = usePayloadAPI('/api/blog-posts?limit=5&sort=-updatedAt&where[_status][equals]=draft')
  const [projectResult] = usePayloadAPI('/api/projects?limit=4&sort=-updatedAt')
  const [inquiryResult] = usePayloadAPI('/api/phone-requests?limit=1&sort=-updatedAt')
  const [journeyResult] = usePayloadAPI('/api/journey-analytics?limit=12&sort=-count')

  const notesData = (notesResult?.data || {}) as QueryData<NoteDoc>
  const allNotesData = (allNotesResult?.data || {}) as QueryData<NoteDoc>
  const draftsData = (draftResult?.data || {}) as QueryData<NoteDoc>
  const projectsData = (projectResult?.data || {}) as QueryData<ProjectDoc>
  const journeyData = (journeyResult?.data || {}) as QueryData<JourneyDoc>

  const notes = useMemo<NoteDoc[]>(() => notesData.docs || [], [notesData])
  const allNotes = useMemo<NoteDoc[]>(() => allNotesData.docs || [], [allNotesData])
  const drafts = useMemo<NoteDoc[]>(() => draftsData.docs || [], [draftsData])
  const projects = useMemo<ProjectDoc[]>(() => projectsData.docs || [], [projectsData])
  const journeys = useMemo<JourneyDoc[]>(() => journeyData.docs || [], [journeyData])
  const blogTitleBySlug = useMemo<Record<string, string>>(
    () =>
      allNotes.reduce<Record<string, string>>((acc, note) => {
        const slug = String(note?.slug || '').trim()
        const title = String(note?.title || '').trim()
        if (!slug || !title) return acc
        acc[slug] = title
        return acc
      }, {}),
    [allNotes],
  )

  const noteCount = countTotal<NoteDoc>(notesResult)
  const draftCount = countTotal<NoteDoc>(draftResult)
  const projectCount = countTotal<ProjectDoc>(projectResult)
  const inquiryCount = countTotal<InquiryDoc>(inquiryResult)

  const homepageToProject = sumJourneys(
    journeys,
    (item) => item.sourcePath === '/' && (item.journeyType === 'project-live' || item.journeyType === 'case-study' || item.journeyType === 'repo'),
  )
  const blogToContact = sumJourneys(journeys, (item) => String(item.sourcePath || '').startsWith('/blog') && item.journeyType === 'contact')
  const caseStudyToRepo = sumJourneys(journeys, (item) => item.journeyType === 'repo')
  const totalTrackedJourneys = journeys.reduce((total, item) => total + Number(item.count || 0), 0)
  const conversionBase = Math.max(totalTrackedJourneys, 1)

  return (
    <AdminDashboardShell>
      <DashboardHeader />

      <MetricsStrip
        metrics={[
          {
            label: 'Notes',
            value: noteCount,
            helper: noteCount === 1 ? '1 published item' : `${noteCount} total notes`,
          },
          {
            label: 'Drafts',
            value: draftCount,
            helper: draftCount === 0 ? 'No drafts in progress' : 'In active drafting workflow',
          },
          {
            label: 'Projects',
            value: projectCount,
            helper: projectCount === 0 ? 'No projects yet' : 'Portfolio records live',
          },
          {
            label: 'Inquiries',
            value: inquiryCount,
            helper: inquiryCount === 0 ? 'Inbox currently clear' : 'Pending review in inbox',
          },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="grid grid-cols-1 gap-5 xl:col-span-7">
          <SectionCard actionHref="/admin/collections/blog-posts/create" actionLabel="New Note" title="Recent Notes">
            {notes.length ? (
              <div className="grid grid-cols-1 gap-3">
                {notes.map((note) => (
                  <ListRow
                    href={note.id ? `/admin/collections/blog-posts/${note.id}` : '/admin/collections/blog-posts'}
                    key={note.id ? String(note.id) : `note-${note.title || 'untitled'}`}
                    meta={note.isComingSoon ? 'Coming soon' : formatDate(note.updatedAt) || 'Recently updated'}
                    title={note.title || 'Untitled note'}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                ctaHref="/admin/collections/blog-posts/create"
                ctaLabel="Write first note"
                description="Start publishing a new note and build your editorial backlog."
                title="No notes published yet."
              />
            )}
          </SectionCard>

          <SectionCard actionHref="/admin/collections/projects/create" actionLabel="New Project" title="Projects">
            {projects.length ? (
              <div className="grid grid-cols-1 gap-3">
                {projects.map((project) => (
                  <ListRow
                    href={project.id ? `/admin/collections/projects/${project.id}` : '/admin/collections/projects'}
                    key={project.id ? String(project.id) : `project-${project.title || 'untitled'}`}
                    meta={formatDate(project.updatedAt) || 'Recently updated'}
                    title={project.title || 'Untitled project'}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                ctaHref="/admin/collections/projects/create"
                ctaLabel="Create project"
                description="Add your first project to keep portfolio updates and case studies current."
                title="No projects yet."
              />
            )}
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:col-span-5">
          <SectionCard actionHref="/admin/collections/blog-posts?where[_status][equals]=draft" actionLabel="View Drafts" title="Draft Notes">
            {drafts.length ? (
              <div className="grid grid-cols-1 gap-3">
                {drafts.map((note) => (
                  <ListRow
                    href={note.id ? `/admin/collections/blog-posts/${note.id}` : '/admin/collections/blog-posts'}
                    key={note.id ? String(note.id) : `draft-${note.title || 'untitled'}`}
                    meta={formatDate(note.updatedAt) || 'Draft'}
                    title={note.title || 'Untitled draft'}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                ctaHref="/admin/collections/blog-posts/create"
                ctaLabel="Create draft"
                description="Start a new draft to continue your publishing workflow."
                title="No drafts in progress."
              />
            )}
          </SectionCard>

          <SectionCard actionHref="/admin/collections/journey-analytics" actionLabel="View All" title="Visitor Journey Funnels">
            <div className="grid grid-cols-1 gap-2">
              <article className="rounded-xl border border-zinc-900 bg-row px-3 py-2">
                <p className="text-xs uppercase tracking-editorial text-zinc-500">Homepage → Project Interest</p>
                <p className="mt-1 text-lg font-semibold text-zinc-100">{homepageToProject}</p>
              </article>
              <article className="rounded-xl border border-zinc-900 bg-row px-3 py-2">
                <p className="text-xs uppercase tracking-editorial text-zinc-500">Blog → Contact Intent</p>
                <p className="mt-1 text-lg font-semibold text-zinc-100">{blogToContact}</p>
              </article>
              <article className="rounded-xl border border-zinc-900 bg-row px-3 py-2">
                <p className="text-xs uppercase tracking-editorial text-zinc-500">Case Study / Portfolio → Repo</p>
                <p className="mt-1 text-lg font-semibold text-zinc-100">{caseStudyToRepo}</p>
                <p className="mt-1 text-xs text-zinc-500">{formatRate((caseStudyToRepo / conversionBase) * 100)} of tracked journeys</p>
              </article>
            </div>

            {journeys.length ? (
              <div className="grid grid-cols-1 gap-2">
                {journeys.slice(0, 5).map((journey) => (
                  <div className="rounded-xl border border-zinc-900 bg-row px-3 py-2" key={journey.id || `${journey.sourcePath}-${journey.targetPath}-${journey.journeyType}`}>
                    <p className="text-sm text-zinc-200">
                      {formatPathLabel(journey.sourcePath, blogTitleBySlug)} → {formatPathLabel(journey.targetPath, blogTitleBySlug)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatJourneyTypeLabel(journey.journeyType)} · {Number(journey.count || 0)} events
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                description="Journey tracking starts populating after visitors click internal and outbound links."
                title="No journey events yet."
              />
            )}
          </SectionCard>

          <SectionCard title="Quick Actions">
            <QuickActionGrid
              primaryAction={{ href: '/admin/collections/blog-posts/create', label: 'Write Note' }}
              secondaryActions={[
                { href: '/admin/collections/open-source-resources/create', label: 'New Open Source Resource' },
                { href: '/admin/collections/media', label: 'Upload Asset' },
                { href: '/admin/collections/phone-requests', label: 'Review Inquiries' },
                { href: '/admin/globals/home', label: 'Edit Homepage Content' },
                { href: '/admin/globals/now', label: 'Update Now Page' },
              ]}
            />
          </SectionCard>
        </div>
      </div>
    </AdminDashboardShell>
  )
}
