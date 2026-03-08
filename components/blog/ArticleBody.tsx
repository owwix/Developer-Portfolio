'use client'

import { useEffect, useRef } from 'react'

let mermaidInitialized = false

async function copyText(value: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export default function ArticleBody({ html }: { html: string }) {
  const articleRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const root = articleRef.current
    if (!root) return

    const codeBlocks = Array.from(root.querySelectorAll('pre > code'))
    for (const codeBlock of codeBlocks) {
      const pre = codeBlock.parentElement
      if (!pre) continue

      const existingButton = pre.querySelector(':scope > .code-copy-btn')
      if (existingButton) existingButton.remove()

      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'code-copy-btn'
      button.textContent = 'Copy'
      button.onclick = async () => {
        try {
          await copyText(codeBlock.textContent || '')
          button.textContent = 'Copied'
          window.setTimeout(() => {
            button.textContent = 'Copy'
          }, 1200)
        } catch {
          button.textContent = 'Failed'
          window.setTimeout(() => {
            button.textContent = 'Copy'
          }, 1200)
        }
      }

      pre.appendChild(button)
    }

    let cancelled = false
    const renderMermaid = async () => {
      const mermaidBlocks = Array.from(root.querySelectorAll('pre.mermaid')) as HTMLElement[]
      const pendingBlocks = mermaidBlocks.filter((block) => block.dataset.mermaidRendered !== 'true')
      if (!pendingBlocks.length) return

      const mermaid = (await import('mermaid')).default
      if (cancelled) return

      if (!mermaidInitialized) {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'strict',
        })
        mermaidInitialized = true
      }

      await mermaid.run({ nodes: pendingBlocks })
      pendingBlocks.forEach((block) => {
        block.dataset.mermaidRendered = 'true'
      })
    }

    void renderMermaid()

    return () => {
      cancelled = true
    }
  }, [html])

  return <article className="article-body" ref={articleRef} dangerouslySetInnerHTML={{ __html: html }} />
}
