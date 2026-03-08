export type BlogTag = {
  tag?: string
}

export type BlogPost = {
  id?: string
  title?: string
  slug?: string
  summary?: string
  content?: string
  publishedDate?: string
  tags?: BlogTag[]
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

function toPlainText(value: string): string {
  return String(value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/[>#*_\-[\]()]*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getReadTime(post: BlogPost): string {
  const text = toPlainText([post?.summary || '', post?.content || ''].join(' ').trim())
  const words = text ? text.split(/\s+/).length : 0
  return `${Math.max(1, Math.round(words / 220))} min read`
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

function inlineMarkdown(value: string): string {
  let html = escapeHTML(value)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
  return html
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
      const code: string[] = []
      i += 1
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i])
        i += 1
      }
      if (i < lines.length) i += 1
      chunks.push(`<pre><code class="language-${escapeHTML(lang)}">${escapeHTML(code.join('\n'))}</code></pre>`)
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

    const calloutMatch = trimmed.match(/^>\s*\[!(NOTE|TIP|WARNING)\]\s*(.*)$/i)
    if (calloutMatch) {
      const type = calloutMatch[1].toLowerCase()
      const text = calloutMatch[2]
      chunks.push(
        `<aside class="callout callout-${type}"><div class="callout-title">${type.toUpperCase()}</div><p>${inlineMarkdown(text)}</p></aside>`,
      )
      i += 1
      continue
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
