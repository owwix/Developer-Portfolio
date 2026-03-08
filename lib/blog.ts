import hljs from 'highlight.js/lib/common'

export type BlogTag = {
  tag?: string
}

export type BlogPost = {
  id?: string
  title?: string
  slug?: string
  summary?: unknown
  content?: unknown
  publishedDate?: string
  isComingSoon?: boolean
  createdAt?: string
  updatedAt?: string
  tags?: BlogTag[]
  _status?: 'draft' | 'published'
  coverImage?: {
    url?: string
    alt?: string
    sizes?: {
      avatar?: {
        url?: string
      }
    }
  } | null
}

export type TocItem = {
  id: string
  text: string
  level: number
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'he',
  'in',
  'is',
  'it',
  'its',
  'of',
  'on',
  'that',
  'the',
  'to',
  'was',
  'were',
  'will',
  'with',
  'i',
  'you',
  'we',
  'our',
])

export function formatDate(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getTags(post: BlogPost): string[] {
  return (post?.tags || [])
    .map((entry) => String(entry?.tag || '').trim())
    .filter(Boolean)
}

export function getCoverImage(post: BlogPost): string {
  return post?.coverImage?.url || post?.coverImage?.sizes?.avatar?.url || ''
}

function richTextToText(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    return value.map((entry) => richTextToText(entry)).filter(Boolean).join(' ')
  }
  if (typeof value === 'object') {
    const node = value as { text?: unknown; children?: unknown; root?: unknown }
    if (typeof node.text === 'string') return node.text
    if (node.children) return richTextToText(node.children)
    if (node.root) return richTextToText(node.root)
  }
  return ''
}

export function toDisplayText(value: unknown): string {
  return richTextToText(value).replace(/\s+/g, ' ').trim()
}

export function toPlainText(value: unknown): string {
  return toDisplayText(value)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/[>#*_\-[\]()]*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getReadTime(post: BlogPost): string {
  const text = toPlainText([post?.summary || '', post?.content || ''])
  const words = text ? text.split(/\s+/).length : 0
  return `${Math.max(1, Math.round(words / 220))} min read`
}

export function isComingSoon(post: BlogPost): boolean {
  if (post?.isComingSoon) return true
  if (!post?.publishedDate) return false
  const published = new Date(post.publishedDate).getTime()
  if (Number.isNaN(published)) return false
  return published > Date.now()
}

export function escapeHTML(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function slugify(value: string): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function tokenize(value: unknown): string[] {
  return toPlainText(value)
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/[^a-z0-9-]/g, ''))
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
}

function inlineMarkdown(value: string): string {
  let html = escapeHTML(value)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
  return html
}

function highlightCode(code: string, language: string): string {
  const cleanLang = language.trim().toLowerCase()

  try {
    if (cleanLang && hljs.getLanguage(cleanLang)) {
      return hljs.highlight(code, { language: cleanLang, ignoreIllegals: true }).value
    }
    return hljs.highlightAuto(code).value
  } catch {
    return escapeHTML(code)
  }
}

type ParsedCalloutType = 'decision' | 'why' | 'tradeoff' | 'lesson' | 'improve' | 'note' | 'tip' | 'warning'

const CALLOUT_MAP: Record<string, ParsedCalloutType> = {
  decision: 'decision',
  why: 'why',
  whymattered: 'why',
  whythismattered: 'why',
  tradeoff: 'tradeoff',
  tradeoffs: 'tradeoff',
  lesson: 'lesson',
  lessonlearned: 'lesson',
  lessonslearned: 'lesson',
  improve: 'improve',
  improvements: 'improve',
  whatidimprovenext: 'improve',
  note: 'note',
  tip: 'tip',
  warning: 'warning',
}

const CALLOUT_META: Record<ParsedCalloutType, { label: string; icon: string }> = {
  decision: { label: 'Decision', icon: '◆' },
  why: { label: 'Why This Mattered', icon: '◉' },
  tradeoff: { label: 'Tradeoff', icon: '◌' },
  lesson: { label: 'Lesson Learned', icon: '▣' },
  improve: { label: "What I'd Improve Next", icon: '→' },
  note: { label: 'Note', icon: '●' },
  tip: { label: 'Tip', icon: '✓' },
  warning: { label: 'Warning', icon: '!' },
}

function normalizeCalloutToken(rawType: string): ParsedCalloutType | null {
  const normalized = String(rawType || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  return CALLOUT_MAP[normalized] || null
}

function renderCallout(type: ParsedCalloutType, title: string, bodyLines: string[]): string {
  const meta = CALLOUT_META[type]
  const parsedTitle = title.trim() || meta.label
  const compact = bodyLines.map((line) => line.trim()).filter(Boolean).join(' ')
  const content = compact ? `<p>${inlineMarkdown(compact)}</p>` : ''

  return `<aside class="callout callout-${type}"><div class="callout-head"><span class="callout-icon" aria-hidden="true">${meta.icon}</span><span class="callout-title">${escapeHTML(parsedTitle)}</span></div><div class="callout-content">${content}</div></aside>`
}

export function parseMarkdown(source: string): { html: string; toc: TocItem[] } {
  const lines = String(source || '').replace(/\r\n/g, '\n').split('\n')
  const chunks: string[] = []
  const toc: TocItem[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trimEnd()
    const trimmed = line.trim()

    if (!trimmed) {
      i += 1
      continue
    }

    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim() || 'plaintext'
      const normalizedLang = lang.toLowerCase()
      const code: string[] = []
      i += 1
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i])
        i += 1
      }
      if (i < lines.length) i += 1

      const rawCode = code.join('\n')
      if (normalizedLang === 'mermaid') {
        chunks.push(`<pre class="mermaid">${escapeHTML(rawCode)}</pre>`)
      } else {
        const highlighted = highlightCode(rawCode, lang)
        chunks.push(`<pre><code class="hljs language-${escapeHTML(lang)}">${highlighted}</code></pre>`)
      }
      continue
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const text = headingMatch[2].trim()
      const id = slugify(text)
      if (level >= 2) {
        toc.push({ id, text, level })
      }
      chunks.push(`<h${level} id="${id}"><a href="#${id}">${inlineMarkdown(text)}</a></h${level}>`)
      i += 1
      continue
    }

    const calloutMatch = trimmed.match(/^>\s*\[!([^\]]+)\]\s*(.*)$/i)
    if (calloutMatch) {
      const parsedType = normalizeCalloutToken(calloutMatch[1])
      if (parsedType) {
        const body: string[] = []
        const title = calloutMatch[2] || ''
        i += 1
        while (i < lines.length) {
          const next = lines[i].trim()
          if (!next.startsWith('>')) break
          if (/^>\s*\[![^\]]+\]/.test(next)) break
          body.push(next.replace(/^>\s?/, ''))
          i += 1
        }
        chunks.push(renderCallout(parsedType, title, body))
        continue
      }
    }

    if (trimmed.startsWith('>')) {
      chunks.push(`<blockquote>${inlineMarkdown(trimmed.replace(/^>\s?/, ''))}</blockquote>`)
      i += 1
      continue
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const content = lines[i].replace(/^\s*[-*]\s+/, '').trim()
        items.push(`<li>${inlineMarkdown(content)}</li>`)
        i += 1
      }
      chunks.push(`<ul>${items.join('')}</ul>`)
      continue
    }

    const imageMatch = trimmed.match(/^!\[(.*)\]\(([^)]+)\)$/)
    if (imageMatch) {
      chunks.push(`<figure><img src="${escapeHTML(imageMatch[2])}" alt="${escapeHTML(imageMatch[1])}" /></figure>`)
      i += 1
      continue
    }

    const paragraph: string[] = [trimmed]
    i += 1
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s+|```|>\s*\[!|>\s|[-*]\s+)/.test(lines[i].trim())) {
      paragraph.push(lines[i].trim())
      i += 1
    }
    chunks.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`)
  }

  return {
    html: chunks.join(''),
    toc,
  }
}

export function rankRelatedPosts(source: BlogPost, candidates: BlogPost[], limit = 3): BlogPost[] {
  const sourceTags = new Set(getTags(source).map((tag) => tag.toLowerCase()))
  const sourceTerms = new Set(tokenize([source.title, source.summary, source.content]))
  const now = Date.now()

  return candidates
    .filter((candidate) => candidate.slug && candidate.slug !== source.slug)
    .map((candidate) => {
      const candidateTags = getTags(candidate).map((tag) => tag.toLowerCase())
      const tagOverlap = candidateTags.filter((tag) => sourceTags.has(tag)).length

      const candidateTerms = tokenize([candidate.title, candidate.summary, candidate.content])
      const keywordOverlap = candidateTerms.filter((term) => sourceTerms.has(term)).length

      const published = candidate.publishedDate ? new Date(candidate.publishedDate).getTime() : 0
      const ageDays = published ? Math.max(0, (now - published) / (1000 * 60 * 60 * 24)) : 9999
      const recencyScore = Math.max(0, 1 - ageDays / 365)

      const score = tagOverlap * 8 + keywordOverlap * 2 + recencyScore
      return { candidate, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.candidate)
}
