import { sortByDisplayOrder } from '../src/utils/order'

export type OpenSourceStatus = 'Released' | 'In Progress' | 'Planned'

export type OpenSourceCategory = 'CMS Templates' | 'Starter Kits' | 'UI Libraries' | 'Developer Tools'

export type OpenSourceResource = {
  id: string
  title: string
  description: string
  stack: string[]
  status?: OpenSourceStatus
  category: OpenSourceCategory
  marker?: string
  githubStars?: number
  githubForks?: number
  showOnHomepage?: boolean
  links?: {
    github?: string
    template?: string
    docs?: string
    demo?: string
  }
}

export type OpenSourceResourceRow = {
  id?: string
  displayOrder?: number
  title?: string
  description?: string
  status?: OpenSourceStatus
  category?: OpenSourceCategory
  marker?: string
  showOnHomepage?: boolean
  githubStars?: number
  githubForks?: number
  techStack?: Array<{ technology?: string }>
  links?: {
    github?: string
    template?: string
    docs?: string
    demo?: string
  }
}

export const defaultOpenSourceResources: OpenSourceResource[] = [
  {
    id: 'payload-blog-template',
    title: 'Payload Blog Template',
    description:
      'A production-ready blog template built with Payload CMS, Next.js, and TypeScript. Designed for fast setup, clean content modeling, SEO-friendly pages, and a modern developer workflow.',
    stack: ['Payload CMS', 'Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
    status: 'In Progress',
    category: 'CMS Templates',
    marker: 'TPL',
    links: {
      github: 'https://github.com/owwix/Developer-Portfolio-Template',
      template: 'https://github.com/owwix/Developer-Portfolio-Template/generate',
    },
  },
  {
    id: 'nextjs-payload-starter',
    title: 'Next.js + Payload Starter',
    description:
      'A reusable full-stack starter kit for building CMS-backed web apps with a scalable content structure and clean frontend architecture.',
    stack: ['Next.js', 'Payload CMS', 'TypeScript', 'Node.js'],
    status: 'Planned',
    category: 'Starter Kits',
    marker: 'KIT',
  },
  {
    id: 'developer-ui-components',
    title: 'Developer UI Components',
    description:
      'A reusable collection of polished interface components and layout patterns built for developer portfolios, admin dashboards, and content-heavy applications.',
    stack: ['React', 'TypeScript', 'Tailwind CSS'],
    status: 'Planned',
    category: 'UI Libraries',
    marker: 'UI',
  },
]

const orderedCategories: OpenSourceCategory[] = ['CMS Templates', 'Starter Kits', 'UI Libraries', 'Developer Tools']

const allowedStatus = new Set<OpenSourceStatus>(['Released', 'In Progress', 'Planned'])
const allowedCategories = new Set<OpenSourceCategory>(orderedCategories)

function toText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function toOptionalUrl(value: unknown): string | undefined {
  const url = toText(value)
  if (!url) return undefined
  return /^https?:\/\//i.test(url) ? url : undefined
}

function toPositiveNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return undefined
  return Math.floor(value)
}

function normalizeResource(input: OpenSourceResourceRow, index: number): OpenSourceResource {
  const stack = (input.techStack || []).map((entry) => toText(entry?.technology)).filter(Boolean)
  const status = allowedStatus.has(input.status as OpenSourceStatus) ? (input.status as OpenSourceStatus) : 'Planned'
  const category = allowedCategories.has(input.category as OpenSourceCategory)
    ? (input.category as OpenSourceCategory)
    : 'Developer Tools'
  const title = toText(input.title) || `Open Source Resource ${index + 1}`
  const marker = toText(input.marker).slice(0, 4).toUpperCase()

  return {
    id: toText(input.id) || `open-source-${index + 1}`,
    title,
    description: toText(input.description) || 'No description yet.',
    stack: stack.length ? stack : ['TypeScript'],
    status,
    category,
    marker: marker || 'OS',
    showOnHomepage: input.showOnHomepage !== false,
    githubStars: toPositiveNumber(input.githubStars),
    githubForks: toPositiveNumber(input.githubForks),
    links: {
      github: toOptionalUrl(input.links?.github),
      template: toOptionalUrl(input.links?.template),
      docs: toOptionalUrl(input.links?.docs),
      demo: toOptionalUrl(input.links?.demo),
    },
  }
}

export function normalizeOpenSourceResources(rows: OpenSourceResourceRow[]): OpenSourceResource[] {
  return sortByDisplayOrder(rows).map((row, index) => normalizeResource(row, index))
}

export function getOpenSourceByCategory(resources: OpenSourceResource[] = defaultOpenSourceResources): Array<{
  category: OpenSourceCategory
  items: OpenSourceResource[]
}> {
  return orderedCategories
    .map((category) => ({
      category,
      items: resources.filter((item) => item.category === category),
    }))
    .filter((group) => group.items.length > 0)
}
