type RichTextNode = {
  type?: string
  text?: string
  url?: string
  newTab?: boolean
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  children?: RichTextNode[]
}

function escapeHTML(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function sanitizeURL(value: unknown): string {
  const url = String(value || '').trim()
  if (!url) return ''
  if (url.startsWith('/')) return url
  if (url.startsWith('#')) return url

  const lower = url.toLowerCase()
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('mailto:') || lower.startsWith('tel:')) {
    return url
  }

  return ''
}

function renderText(node: RichTextNode): string {
  let html = escapeHTML(node.text || '')

  if (node.code) html = `<code>${html}</code>`
  if (node.bold) html = `<strong>${html}</strong>`
  if (node.italic) html = `<em>${html}</em>`
  if (node.underline) html = `<u>${html}</u>`
  if (node.strikethrough) html = `<s>${html}</s>`

  return html
}

function renderChildren(children?: RichTextNode[]): string {
  if (!Array.isArray(children) || !children.length) return ''
  return children.map((child) => renderNode(child)).join('')
}

function renderNode(node: RichTextNode): string {
  if (!node || typeof node !== 'object') return ''
  if (typeof node.text === 'string') return renderText(node)

  const type = String(node.type || '').toLowerCase()
  const childrenHTML = renderChildren(node.children)

  switch (type) {
    case 'p':
    case 'paragraph':
      return `<p>${childrenHTML}</p>`
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return `<${type}>${childrenHTML}</${type}>`
    case 'ul':
      return `<ul>${childrenHTML}</ul>`
    case 'ol':
      return `<ol>${childrenHTML}</ol>`
    case 'li':
      return `<li>${childrenHTML}</li>`
    case 'blockquote':
      return `<blockquote>${childrenHTML}</blockquote>`
    case 'link': {
      const href = sanitizeURL(node.url)
      if (!href) return childrenHTML
      const newTabAttrs = node.newTab ? ' target="_blank" rel="noreferrer noopener"' : ''
      return `<a href="${escapeHTML(href)}"${newTabAttrs}>${childrenHTML}</a>`
    }
    case 'br':
      return '<br />'
    default:
      return childrenHTML
  }
}

export function renderRichText(value: unknown): string {
  if (value == null) return ''

  if (typeof value === 'string') {
    const lines = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    if (!lines.length) return ''
    return lines.map((line) => `<p>${escapeHTML(line)}</p>`).join('')
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => renderNode(entry as RichTextNode))
      .join('')
      .trim()
  }

  if (typeof value === 'object') {
    const root = (value as { root?: { children?: RichTextNode[] } }).root
    if (root?.children) {
      return root.children
        .map((entry) => renderNode(entry))
        .join('')
        .trim()
    }

    return renderNode(value as RichTextNode).trim()
  }

  return `<p>${escapeHTML(String(value))}</p>`
}
