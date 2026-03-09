import { describe, expect, it } from 'vitest'
import type { BlogPost } from './blog'
import { getDifficulty, getPrerequisites, parseMarkdown, rankRelatedPosts } from './blog'

describe('blog helpers', () => {
  it('defaults difficulty to Intermediate when missing', () => {
    expect(getDifficulty({})).toBe('Intermediate')
    expect(getDifficulty({ difficulty: 'Advanced' })).toBe('Advanced')
  })

  it('normalizes prerequisites list from blog post', () => {
    expect(
      getPrerequisites({
        prerequisites: [{ item: '  TypeScript basics  ' }, { item: '' }, {}],
      }),
    ).toEqual(['TypeScript basics'])
  })
})

describe('parseMarkdown', () => {
  it('renders changelog blocks', () => {
    const input = [
      ':::changelog Platform Iterations',
      '- 2026-03-09: Added RSS feed',
      '- 2026-03-08: Improved related ranking',
      ':::',
    ].join('\n')

    const { html } = parseMarkdown(input)
    expect(html).toContain('class="changelog-block"')
    expect(html).toContain('Platform Iterations')
    expect(html).toContain('2026-03-09')
    expect(html).toContain('Added RSS feed')
  })

  it('renders demo embeds for allowed providers', () => {
    const { html } = parseMarkdown('@[demo](https://youtu.be/dQw4w9WgXcQ "Walkthrough")')
    expect(html).toContain('class="demo-embed"')
    expect(html).toContain('youtube.com/embed/dQw4w9WgXcQ')
    expect(html).toContain('Walkthrough')
  })

  it('renders fenced engineering callouts', () => {
    const input = [':::decision Explicit allowlist over implicit openness', 'Protect new routes by default.', ':::'].join('\n')
    const { html } = parseMarkdown(input)
    expect(html).toContain('class="callout callout-decision"')
    expect(html).toContain('Explicit allowlist over implicit openness')
    expect(html).toContain('Protect new routes by default.')
  })

  it('blocks unsupported demo URLs', () => {
    const { html } = parseMarkdown('@[demo](https://example.com/private "Demo")')
    expect(html).toContain('Demo embed blocked')
    expect(html).not.toContain('<iframe')
  })
})

describe('rankRelatedPosts', () => {
  it('prioritizes closely matching posts', () => {
    const source: BlogPost = {
      slug: 'source',
      title: 'Deploying a Next.js Portfolio',
      summary: 'Production deployment notes',
      content: 'CI CD infra',
      difficulty: 'Intermediate',
      prerequisites: [{ item: 'Next.js fundamentals' }],
      tags: [{ tag: 'Next.js' }, { tag: 'Deployment' }],
      seriesTitle: 'Portfolio Build',
      publishedDate: '2026-03-01',
    }

    const candidates: BlogPost[] = [
      {
        slug: 'strong-match',
        title: 'Part 2: Deployment Pipeline',
        summary: 'Next.js deployment tradeoffs',
        content: 'CI CD infra setup',
        difficulty: 'Intermediate',
        prerequisites: [{ item: 'Next.js fundamentals' }],
        tags: [{ tag: 'Next.js' }, { tag: 'Deployment' }],
        seriesTitle: 'Portfolio Build',
        publishedDate: '2026-03-02',
      },
      {
        slug: 'weak-match',
        title: 'Design Systems Basics',
        summary: 'Typography and spacing',
        content: 'visual design',
        difficulty: 'Beginner',
        prerequisites: [{ item: 'HTML' }],
        tags: [{ tag: 'UI' }],
        publishedDate: '2026-03-02',
      },
    ]

    const ranked = rankRelatedPosts(source, candidates, 2)
    expect(ranked[0]?.slug).toBe('strong-match')
    expect(ranked[1]?.slug).toBe('weak-match')
  })
})
