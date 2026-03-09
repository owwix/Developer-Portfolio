'use client'

import { renderRichText } from '../../lib/renderRichText'

type RichTextContentProps = {
  value: unknown
  className?: string
  fallback?: string
}

export default function RichTextContent({ value, className = '', fallback }: RichTextContentProps) {
  const html = renderRichText(value)

  if (!html) {
    if (!fallback) return null
    return <p className={className}>{fallback}</p>
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
