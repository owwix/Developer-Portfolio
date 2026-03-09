import { describe, expect, it } from 'vitest'
import { renderRichText } from './renderRichText'

describe('renderRichText', () => {
  it('renders plain string content into paragraphs', () => {
    const html = renderRichText('First paragraph\n\nSecond paragraph')
    expect(html).toContain('<p>First paragraph</p>')
    expect(html).toContain('<p>Second paragraph</p>')
  })

  it('preserves line breaks inside a paragraph', () => {
    const html = renderRichText('Line one\nLine two')
    expect(html).toContain('Line one<br />Line two')
  })

  it('renders rich text object tree with links', () => {
    const html = renderRichText({
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              { text: 'Visit ' },
              { type: 'link', url: 'https://example.com', children: [{ text: 'Example' }] },
            ],
          },
        ],
      },
    })

    expect(html).toContain('<p>Visit <a href="https://example.com">Example</a></p>')
  })

  it('blocks unsafe link protocols', () => {
    const html = renderRichText({
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'link', url: 'javascript:alert(1)', children: [{ text: 'Bad link' }] },
            ],
          },
        ],
      },
    })

    expect(html).toContain('<p>Bad link</p>')
    expect(html).not.toContain('javascript:')
  })
})
