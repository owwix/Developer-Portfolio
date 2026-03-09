import type { FieldHook } from 'payload/types'

type SlateNode = {
  type?: string
  children: Array<{ text: string }>
}

export function toSlateRichText(value: string): SlateNode[] {
  const normalized = String(value || '').replace(/\r\n/g, '\n').trim()
  if (!normalized) {
    return [{ type: 'p', children: [{ text: '' }] }]
  }

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((entry) => entry.replace(/\n/g, ' ').trim())
    .filter(Boolean)

  if (!paragraphs.length) {
    return [{ type: 'p', children: [{ text: normalized }] }]
  }

  return paragraphs.map((entry) => ({
    type: 'p',
    children: [{ text: entry }],
  }))
}

export const convertLegacyStringToRichText: FieldHook = ({ value }) => {
  if (typeof value !== 'string') return value
  return toSlateRichText(value)
}
