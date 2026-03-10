import type { FieldHook } from 'payload/types'

type SlateNode = {
  type?: string
  children?: SlateNode[]
  text?: string
  [key: string]: unknown
}

export function toSlateRichText(value: string): SlateNode[] {
  const normalized = String(value || '').replace(/\r\n/g, '\n').trim()
  if (!normalized) {
    return [{ type: 'p', children: [{ text: '' }] }]
  }

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((entry) => entry.trim())
    .filter(Boolean)

  if (!paragraphs.length) {
    return [{ type: 'p', children: [{ text: normalized }] }]
  }

  return paragraphs.map((entry) => ({
    type: 'p',
    children: [{ text: entry }],
  }))
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function hasMeaningfulContent(node: SlateNode): boolean {
  if (typeof node.text === 'string') {
    return node.text.trim().length > 0
  }

  if (!Array.isArray(node.children) || !node.children.length) return false
  return node.children.some((child) => hasMeaningfulContent(child))
}

function sanitizeNode(node: unknown): SlateNode | null {
  if (!isObject(node)) return null

  const type = typeof node.type === 'string' ? node.type.toLowerCase() : ''

  if (typeof node.text === 'string') {
    return { ...node, text: node.text }
  }

  const rawChildren = Array.isArray(node.children) ? node.children : []
  const children = rawChildren
    .map((child) => sanitizeNode(child))
    .filter((child): child is SlateNode => child !== null)

  if (type === 'ul' || type === 'ol') {
    const listItems = children.filter((child) => (child.type || '').toLowerCase() === 'li' && hasMeaningfulContent(child))
    if (!listItems.length) return null
    return { ...node, type, children: listItems }
  }

  if (type === 'li') {
    if (!children.length) return null
    const liNode: SlateNode = { ...node, type: 'li', children }
    return hasMeaningfulContent(liNode) ? liNode : null
  }

  const isBlockWithoutType = !type && children.length > 0
  if (isBlockWithoutType) {
    const paragraphNode: SlateNode = { ...node, type: 'p', children }
    return hasMeaningfulContent(paragraphNode) ? paragraphNode : null
  }

  if (children.length) return { ...node, children }
  return null
}

export function sanitizeSlateRichText(value: unknown): SlateNode[] {
  if (typeof value === 'string') {
    return toSlateRichText(value)
  }

  const nodes = Array.isArray(value) ? value : []
  const sanitized = nodes
    .map((node) => sanitizeNode(node))
    .filter((node): node is SlateNode => node !== null)

  if (!sanitized.length) {
    return [{ type: 'p', children: [{ text: '' }] }]
  }

  return sanitized
}

export const convertLegacyStringToRichText: FieldHook = ({ value }) => {
  if (typeof value !== 'string') return value
  return toSlateRichText(value)
}

export const sanitizeRichTextContent: FieldHook = ({ value }) => {
  if (value == null) return value
  if (Array.isArray(value) || typeof value === 'string') {
    return sanitizeSlateRichText(value)
  }

  if (isObject(value) && isObject(value.root) && Array.isArray(value.root.children)) {
    return {
      ...value,
      root: {
        ...value.root,
        children: sanitizeSlateRichText(value.root.children),
      },
    }
  }

  return value
}
