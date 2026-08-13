import ReforgedHome, {
  type ReforgedContactItem,
  type ReforgedEducation,
  type ReforgedExperience,
  type ReforgedNote,
  type ReforgedOpenSource,
  type ReforgedProject,
  type ReforgedSkillGroup,
} from '../components/home/ReforgedHome'
import { type BlogPost, formatDate, getReadTime, getTags, toPlainText } from '../lib/blog'
import { fetchBlogPosts, fetchEducation, fetchExperiences, fetchHome, fetchNow, fetchOpenSourceResources, fetchProjects, fetchSkills } from '../lib/cms'
import { defaultOpenSourceResources, normalizeOpenSourceResources, type OpenSourceResource, type OpenSourceResourceRow } from '../lib/openSource'
import { renderRichText } from '../lib/renderRichText'
import { siteConfig } from '../src/utils/siteConfig'
import { sortByDisplayOrder } from '../src/utils/order'
import defaultPortrait from '../src/media/559C6E16-E47C-4706-8EFE-892284F85DB5.jpg'

export const dynamic = 'force-dynamic'

type SectionVisibility = {
  projects?: boolean
  skills?: boolean
  openSource?: boolean
  nowPreview?: boolean
  githubSnapshot?: boolean
  experience?: boolean
  education?: boolean
  blog?: boolean
}

type HomepageLayout = 'softwareEngineering' | 'classic'

type SectionDescriptions = {
  experience?: string | null
  projects?: string | null
  blog?: string | null
  skills?: string | null
  openSource?: string | null
  education?: string | null
  contact?: string | null
}

type HomeData = {
  name?: string
  headline?: string
  announcement?: {
    enabled?: boolean | null
    message?: string | null
  }
  terminalHero?: {
    prompt?: string | null
    statement?: string | null
    personalNote?: string | null
    identityCommand?: string | null
    aboutCommand?: string | null
    projectsLabel?: string | null
    resumeLabel?: string | null
    contactLabel?: string | null
  }
  homepageLayout?: HomepageLayout
  openSourceSubtitle?: string | null
  sectionDescriptions?: SectionDescriptions
  sectionVisibility?: SectionVisibility
  resumeSectionVisibility?: SectionVisibility
  bio?: unknown
  email?: string
  githubSnapshot?: {
    enabled?: boolean
    title?: string
    description?: string
    username?: string
    featuredRepos?: Array<{ repository?: string }>
  }
  links?: HomeLink[]
  profilePhoto?: {
    url?: string
    alt?: string
  }
  resumeFile?:
    | string
    | {
        url?: string
        filename?: string
        updatedAt?: string
      }
}

type HomeLink = {
  label?: string
  url?: string
  icon?: string
}

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
  updatedAt?: string
}

type EducationRow = {
  id?: string
  displayOrder?: number
  degree?: string
  fieldOfStudy?: string
  institution?: string
  summary?: unknown
  location?: string
  current?: boolean
  startDate?: string
  endDate?: string
  highlights?: Array<{ highlight?: string }>
  updatedAt?: string
}

type ProjectRow = {
  id?: string
  displayOrder?: number
  slug?: string
  title?: string
  featured?: boolean
  summary?: unknown
  liveUrl?: string
  liveUrlLabel?: string
  repoUrl?: string
  caseStudyUrl?: string
  caseStudyPost?:
    | string
    | {
        slug?: string
        title?: string
      }
  focusAreas?: string[]
  updatedAt?: string
}

type NowData = {
  enabled?: boolean
  title?: string
  intro?: string
  updatedAt?: string
}

type HomePageProps = {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>
}

type RichTextNode = {
  type?: string
  text?: string
  children?: RichTextNode[]
  root?: { children?: RichTextNode[] }
}

function logHomepageFetchError(label: string, error: unknown): void {
  console.error(`[homepage] Failed to load ${label}`, error)
}

const defaultSectionDescriptions: Required<SectionDescriptions> = {
  experience:
    'Founding work, platform engineering, and university systems.',
  projects:
    'Shipped systems, from product strategy through infrastructure and public developer tooling.',
  blog: 'Technical writing that documents architecture decisions, tradeoffs, deployment lessons, and build logs from systems I ship.',
  skills: 'Tools I use daily to take a product from interface to infrastructure.',
  openSource: 'Public starting points, documented and production-ready.',
  education: 'California State Polytechnic University, Pomona · Alumni Class of 26',
  contact: 'For software engineering roles, product engineering work, or technical discussions, start here.',
}

const defaultAISkills: SkillRow[] = [
  { category: 'ai-engineering', name: 'Agentic Workflow Design' },
  { category: 'ai-engineering', name: 'LLM API Integration' },
  { category: 'ai-engineering', name: 'MCP Server Development' },
  { category: 'ai-engineering', name: 'Tool Calling & Structured Outputs' },
  { category: 'ai-engineering', name: 'AI Safety Systems' },
  { category: 'ai-engineering', name: 'Human-in-the-Loop Workflows' },
]

const defaultSkillGroups: ReforgedSkillGroup[] = [
  { title: 'Frontend Development', items: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript UI patterns'] },
  { title: 'Backend Development', items: ['Node.js', 'Express', 'APIs', 'Prisma'] },
  { title: 'Programming Languages', items: ['TypeScript', 'JavaScript', 'Python'] },
  { title: 'Databases', items: ['PostgreSQL', 'MongoDB', 'Redis'] },
  { title: 'Cloud Deployment', items: ['Vercel', 'Railway', 'Neon', 'Cloudflare'] },
  { title: 'Developer Tools', items: ['Git', 'Docker', 'CI/CD'] },
  { title: 'Networking Systems', items: ['HTTP', 'sockets', 'systems fundamentals'] },
  { title: 'AI Engineering', items: ['LLM workflows', 'agents', 'MCP', 'safety tooling'] },
]

function normalizeOptionalText(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  return String(value).trim()
}

function getSectionDescription(home: HomeData | null, key: keyof SectionDescriptions): string {
  if (home?.sectionDescriptions) {
    return normalizeOptionalText(home.sectionDescriptions[key]) || ''
  }

  if (key === 'openSource') return normalizeOptionalText(home?.openSourceSubtitle) ?? defaultSectionDescriptions.openSource
  return defaultSectionDescriptions[key]
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
  if (exp.current) return `${start} — Present`
  const end = formatExperienceDate(exp.endDate)
  return end ? `${start} — ${end}` : start
}

function getEducationDateRange(entry: EducationRow): string {
  const start = formatExperienceDate(entry.startDate)
  if (!start) return ''
  if (entry.current) return `${start} — Present`
  const end = formatExperienceDate(entry.endDate)
  return end ? `${start} — ${end}` : start
}

function formatCategoryTitle(category: string): string {
  return category
    .split('-')
    .map((word) => (word.toLowerCase() === 'ai' ? 'AI' : `${word.charAt(0).toUpperCase()}${word.slice(1)}`))
    .join(' ')
}

function collectRichTextNodes(value: unknown): RichTextNode[] {
  if (value == null) return []
  if (typeof value === 'string') return [{ text: value }]
  if (Array.isArray(value)) return value.flatMap((entry) => collectRichTextNodes(entry))
  if (typeof value === 'object') {
    const node = value as RichTextNode
    if (node.root?.children) return collectRichTextNodes(node.root.children)
    return [node]
  }
  return []
}

function nodePlainText(node: RichTextNode): string {
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.children)) return node.children.map((child) => nodePlainText(child)).join('')
  return ''
}

function extractRichTextBullets(value: unknown): string[] {
  const nodes = collectRichTextNodes(value)
  const bullets: string[] = []

  const walk = (list: RichTextNode[]) => {
    for (const node of list) {
      const type = String(node.type || '').toLowerCase()
      if (type === 'li') {
        const text = nodePlainText(node).replace(/\s+/g, ' ').trim()
        if (text) bullets.push(text)
        continue
      }
      if (node.children?.length) walk(node.children)
    }
  }

  walk(nodes)

  if (bullets.length) return bullets

  const paragraphs = nodes
    .map((node) => {
      const type = String(node.type || '').toLowerCase()
      if (type === 'p' || type === 'paragraph' || (!node.type && node.children)) {
        return nodePlainText(node).replace(/\s+/g, ' ').trim()
      }
      if (typeof node.text === 'string') return node.text.replace(/\s+/g, ' ').trim()
      return ''
    })
    .filter(Boolean)

  if (paragraphs.length) return paragraphs

  const plain = toPlainText(value)
  return plain ? [plain] : []
}

function linkDisplayValue(label: string, url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('linkedin.com')) {
      return parsed.pathname.replace(/\/$/, '') || '/linkedin'
    }
    if (parsed.hostname.includes('github.com')) {
      return parsed.pathname.replace(/\/$/, '') || '/github'
    }
  } catch {
    // keep fallbacks below
  }

  if (url.startsWith('mailto:')) return url.replace(/^mailto:/i, '')
  if (url.startsWith('tel:')) return 'on request'
  return label || url
}

function buildContactStrip(home: HomeData | null): ReforgedContactItem[] {
  const items: ReforgedContactItem[] = []

  if (home?.email) {
    items.push({
      label: 'Email',
      value: home.email,
      href: `mailto:${home.email}`,
    })
  }

  for (const link of home?.links || []) {
    const url = String(link?.url || '').trim()
    if (!url || url.toLowerCase().startsWith('mailto:') || url.toLowerCase().startsWith('tel:')) continue
    const label = String(link?.label || 'Link').trim() || 'Link'
    items.push({
      label,
      value: linkDisplayValue(label, url),
      href: url,
      external: true,
    })
  }

  items.push({
    label: 'Phone',
    value: 'on request',
    href: '/reach-by-phone',
  })

  return items.slice(0, 4)
}

function buildContactLinks(home: HomeData | null): ReforgedContactItem[] {
  return (home?.links || [])
    .map((link): ReforgedContactItem | null => {
      const url = String(link?.url || '').trim()
      if (!url || url.toLowerCase().startsWith('mailto:') || url.toLowerCase().startsWith('tel:')) return null
      const label = String(link?.label || 'Link').trim() || 'Link'
      return {
        label,
        value: label,
        href: url,
        external: true,
      }
    })
    .filter((item): item is ReforgedContactItem => Boolean(item))
}

function getCaseStudyHref(project: ProjectRow): string | undefined {
  if (project.caseStudyUrl) return project.caseStudyUrl
  if (project.caseStudyPost && typeof project.caseStudyPost !== 'string' && project.caseStudyPost.slug) {
    return `/blog/${project.caseStudyPost.slug}`
  }
  return undefined
}

function mapProjects(projects: ProjectRow[]): ReforgedProject[] {
  return projects.map((project, index) => ({
    id: project.id || project.slug || `project-${index}`,
    title: project.title || 'Untitled project',
    focusAreas: Array.isArray(project.focusAreas)
      ? project.focusAreas.map((area) => String(area || '').toLowerCase()).filter(Boolean)
      : [],
    bullets: extractRichTextBullets(project.summary),
    liveUrl: project.liveUrl || undefined,
    liveUrlLabel: project.liveUrlLabel || undefined,
    repoUrl: project.repoUrl || undefined,
    caseStudyUrl: getCaseStudyHref(project),
  }))
}

function mapExperiences(experiences: ExperienceRow[]): ReforgedExperience[] {
  return experiences.map((exp, index) => ({
    id: exp.id || `${exp.company}-${exp.role}-${index}`,
    role: exp.role || 'Role',
    org: exp.company || '',
    period: getExperienceDateRange(exp),
    place: exp.location || undefined,
    current: Boolean(exp.current),
    bullets: extractRichTextBullets(exp.summary),
  }))
}

function mapEducation(education: EducationRow[]): ReforgedEducation[] {
  return education.map((entry, index) => {
    const degreeLine = [entry.degree, entry.fieldOfStudy].filter(Boolean).join(', ')
    const title = degreeLine
      ? `${degreeLine}${entry.institution ? `, ${entry.institution}.` : '.'}`
      : entry.institution || 'Education'
    const highlights = (entry.highlights || [])
      .map((item) => String(item?.highlight || '').trim())
      .filter(Boolean)

    const summaryBullets = extractRichTextBullets(entry.summary)
    const mergedHighlights = highlights.length ? highlights : summaryBullets

    return {
      id: entry.id || `${entry.institution}-${entry.degree}-${index}`,
      title,
      lead: entry.institution
        ? `${entry.institution}${getEducationDateRange(entry) ? ` · ${getEducationDateRange(entry)}` : ''}`
        : getEducationDateRange(entry) || undefined,
      period: getEducationDateRange(entry) || undefined,
      place: entry.location || undefined,
      current: Boolean(entry.current),
      highlights: mergedHighlights,
    }
  })
}

function mapNotes(blogs: BlogPost[]): ReforgedNote[] {
  return blogs.map((post, index) => {
    const dateLabel = formatDate(post.publishedDate || post.createdAt)
    const readTime = getReadTime(post)
    return {
      id: post.id || post.slug || `note-${index}`,
      title: post.title || 'Untitled note',
      blurb: toPlainText(post.summary),
      meta: [dateLabel, readTime].filter(Boolean).join(' · '),
      tags: getTags(post).slice(0, 3),
      href: `/blog/${post.slug || ''}`,
    }
  })
}

function mapOpenSource(resources: OpenSourceResource[]): ReforgedOpenSource[] {
  return resources.map((resource) => ({
    id: resource.id,
    title: resource.title,
    description: resource.description,
    stack: resource.stack.slice(0, 4),
    githubUrl: resource.links?.github,
  }))
}

function mapSkillGroups(groupedSkills: Record<string, SkillRow[]>): ReforgedSkillGroup[] {
  const groups = Object.entries(groupedSkills)
    .map(([category, rows]) => ({
      title: formatCategoryTitle(category),
      items: rows.map((row) => String(row?.name || '').trim()).filter(Boolean),
    }))
    .filter((group) => group.items.length)

  return groups.length ? groups : defaultSkillGroups
}

function splitHighlightRow(highlight: string, fallbackLabel: string): { label: string; body: string } {
  const idx = highlight.indexOf(':')
  if (idx > 0 && idx < 48) {
    return {
      label: highlight.slice(0, idx).trim(),
      body: highlight.slice(idx + 1).trim(),
    }
  }
  return { label: fallbackLabel, body: highlight }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams || {})
  const modeParam = Array.isArray(resolvedSearchParams.mode) ? resolvedSearchParams.mode[0] : resolvedSearchParams.mode
  const viewParam = Array.isArray(resolvedSearchParams.view) ? resolvedSearchParams.view[0] : resolvedSearchParams.view
  const resumeParam = Array.isArray(resolvedSearchParams.resume) ? resolvedSearchParams.resume[0] : resolvedSearchParams.resume
  const isResumeMode =
    String(modeParam || '').toLowerCase() === 'resume' ||
    String(viewParam || '').toLowerCase() === 'resume' ||
    ['1', 'true', 'yes'].includes(String(resumeParam || '').toLowerCase())

  let home: HomeData | null = null
  let projects: ProjectRow[] = []
  let skills: SkillRow[] = []
  let experiences: ExperienceRow[] = []
  let education: EducationRow[] = []
  let blogs: BlogPost[] = []
  let openSource: OpenSourceResource[] = defaultOpenSourceResources

  const [homeResult, projectsResult, skillsResult, experiencesResult, educationResult, blogResult, openSourceResult] =
    await Promise.allSettled([
      fetchHome<HomeData>(),
      fetchProjects<{ docs?: ProjectRow[] }>(100),
      fetchSkills<{ docs?: SkillRow[] }>(100),
      fetchExperiences<{ docs?: ExperienceRow[] }>(6),
      fetchEducation<{ docs?: EducationRow[] }>(6),
      fetchBlogPosts<{ docs?: BlogPost[] }>(40),
      fetchOpenSourceResources<{ docs?: OpenSourceResourceRow[] }>(200),
    ])

  if (homeResult.status === 'fulfilled') {
    home = homeResult.value
  } else {
    logHomepageFetchError('home', homeResult.reason)
  }

  if (projectsResult.status === 'fulfilled') {
    projects = sortByDisplayOrder(projectsResult.value?.docs || [])
  } else {
    logHomepageFetchError('projects', projectsResult.reason)
  }

  if (skillsResult.status === 'fulfilled') {
    skills = sortByDisplayOrder(skillsResult.value?.docs || [])
  } else {
    logHomepageFetchError('skills', skillsResult.reason)
  }

  if (experiencesResult.status === 'fulfilled') {
    experiences = sortByDisplayOrder(experiencesResult.value?.docs || [])
  } else {
    logHomepageFetchError('experiences', experiencesResult.reason)
  }

  if (educationResult.status === 'fulfilled') {
    education = sortByDisplayOrder(educationResult.value?.docs || [])
  } else {
    logHomepageFetchError('education', educationResult.reason)
  }

  if (blogResult.status === 'fulfilled') {
    blogs = sortByDisplayOrder(blogResult.value?.docs || []).slice(0, 3)
  } else {
    logHomepageFetchError('blog posts', blogResult.reason)
  }

  if (openSourceResult.status === 'fulfilled') {
    const fromCMS = normalizeOpenSourceResources(openSourceResult.value?.docs || [])
    if (fromCMS.length) openSource = fromCMS
  } else {
    logHomepageFetchError('open source resources', openSourceResult.reason)
  }

  // Keep now fetch for parity with prior homepage data loading (visibility still CMS-driven).
  try {
    await fetchNow<NowData>()
  } catch {
    // optional preview section omitted in reforged layout
  }

  const skillRows = skills.flatMap((doc) => {
    if (Array.isArray(doc?.skills) && doc.skills.length) return doc.skills
    if (doc?.name) return [doc]
    return []
  })

  const groupedSkills = skillRows.reduce<Record<string, SkillRow[]>>((acc, row) => {
    const key = row?.category || 'general'
    if (!acc[key]) acc[key] = []
    acc[key].push(row)
    return acc
  }, {})
  if (!groupedSkills['ai-engineering']?.length) {
    groupedSkills['ai-engineering'] = defaultAISkills
  }

  const openSourcePreview = openSource.filter((item) => item.showOnHomepage !== false).slice(0, 3)
  const sectionVisibility = isResumeMode ? home?.resumeSectionVisibility || home?.sectionVisibility || {} : home?.sectionVisibility || {}
  const showProjects = sectionVisibility.projects !== false
  const showSkills = sectionVisibility.skills !== false
  const showOpenSource = sectionVisibility.openSource !== false
  const showExperience = sectionVisibility.experience !== false
  const showEducation = sectionVisibility.education !== false
  const showBlog = sectionVisibility.blog !== false

  const resumeFileUrl = home?.resumeFile && typeof home.resumeFile !== 'string' ? home.resumeFile.url || '' : ''
  const resumeFileName = home?.resumeFile && typeof home.resumeFile !== 'string' ? home.resumeFile.filename || 'resume.pdf' : 'resume.pdf'
  const featuredProjects = projects.filter((project) => project.featured)
  const homepageProjects = featuredProjects.length ? featuredProjects : projects

  const terminalPrompt = normalizeOptionalText(home?.terminalHero?.prompt) || 'alexander@portfolio:~$'
  const heroStatement =
    normalizeOptionalText(home?.terminalHero?.statement) ||
    'I build production-ready web products, AI workflows, and dependable platforms.'
  const personalNote =
    normalizeOptionalText(home?.terminalHero?.personalNote) ||
    'Outside of work, I lift weights, play chess, build personal coding projects, and seek out the occasional adrenaline rush. I have been interested in technology since childhood; some of my earliest experiences with code came from building simple Roblox games around 2009.'
  const identityCommand = normalizeOptionalText(home?.terminalHero?.identityCommand) || 'whoami'
  const aboutCommand = normalizeOptionalText(home?.terminalHero?.aboutCommand) || 'cat about.txt'
  const projectsLabel = normalizeOptionalText(home?.terminalHero?.projectsLabel) || 'view projects'
  const resumeLabel = normalizeOptionalText(home?.terminalHero?.resumeLabel) || 'resume'
  const contactLabel = normalizeOptionalText(home?.terminalHero?.contactLabel) || 'say hi'
  const showAnnouncement = home?.announcement?.enabled !== false
  const announcementMessage =
    normalizeOptionalText(home?.announcement?.message) ||
    'currently redesigning — things may shift, you might hit a bug or two.'

  const aboutBodyHtml = renderRichText(home?.bio) || undefined
  const educationForUi = mapEducation(education).map((entry) => ({
    ...entry,
    highlights: entry.highlights.map((highlight, index) => {
      const split = splitHighlightRow(highlight, index === 0 ? 'background' : `detail ${index + 1}`)
      return `${split.label}: ${split.body}`
    }),
  }))

  return (
    <ReforgedHome
      aboutBodyHtml={aboutBodyHtml}
      aboutCommand={aboutCommand}
      aboutLead="Full-stack software engineer focused on building modern web applications and developer-friendly systems."
      aboutTitle="Systems built to hold up in production."
      announcementEnabled={showAnnouncement}
      announcementMessage={announcementMessage}
      avatarAlt={home?.profilePhoto?.alt || `Portrait of ${home?.name || siteConfig.ownerName}`}
      avatarUrl={home?.profilePhoto?.url || defaultPortrait.src}
      contactDescription={getSectionDescription(home, 'contact')}
      contactLabel={contactLabel}
      contactLinks={buildContactLinks(home)}
      contactStrip={buildContactStrip(home)}
      currentYear={new Date().getFullYear()}
      education={educationForUi}
      educationDescription={getSectionDescription(home, 'education')}
      email={home?.email}
      experienceDescription={getSectionDescription(home, 'experience')}
      experiences={mapExperiences(experiences)}
      founderLine="CEO & Founder of Turnkeeper"
      headline={home?.headline || 'Full-Stack Software Engineer'}
      heroStatement={heroStatement}
      identityCommand={identityCommand}
      isResumeMode={isResumeMode}
      name={home?.name || siteConfig.ownerName}
      notes={mapNotes(blogs)}
      notesDescription={getSectionDescription(home, 'blog')}
      openSource={mapOpenSource(openSourcePreview)}
      openSourceDescription={getSectionDescription(home, 'openSource')}
      personalNote={personalNote}
      projects={mapProjects(homepageProjects)}
      projectsDescription={getSectionDescription(home, 'projects')}
      projectsLabel={projectsLabel}
      resumeFileName={resumeFileName}
      resumeLabel={resumeLabel}
      resumeUrl={resumeFileUrl || undefined}
      showBlog={showBlog}
      showEducation={showEducation}
      showExperience={showExperience}
      showOpenSource={showOpenSource}
      showProjects={showProjects}
      showSkills={showSkills}
      skills={mapSkillGroups(groupedSkills)}
      skillsDescription={getSectionDescription(home, 'skills')}
      terminalPrompt={terminalPrompt}
    />
  )
}
