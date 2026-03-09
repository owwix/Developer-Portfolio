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
  links?: {
    github?: string
    template?: string
    docs?: string
    demo?: string
  }
}

export const openSourceResources: OpenSourceResource[] = [
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

export function getOpenSourceByCategory(resources: OpenSourceResource[] = openSourceResources): Array<{
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
