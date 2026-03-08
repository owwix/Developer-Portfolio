import { ImageResponse } from 'next/og'
import type { BlogPost } from '../../../lib/blog'
import { formatDate, toDisplayText } from '../../../lib/blog'
import { fetchBlogPostBySlug } from '../../../lib/cms'

export const runtime = 'nodejs'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

type Params = {
  slug: string
}

export default async function OGImage({ params }: { params: Params | Promise<Params> }) {
  const resolvedParams = await params
  const post = await fetchBlogPostBySlug<BlogPost>(resolvedParams.slug)
  const title = String(post?.title || 'Lab / Notes')
  const summary =
    toDisplayText(post?.summary) || 'Technical writeups covering architecture decisions, tradeoffs, and build logs.'
  const date = formatDate(post?.publishedDate)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px',
          background: 'linear-gradient(135deg, #050505 0%, #0b0b0b 45%, #101010 100%)',
          color: '#f5f5f5',
          border: '1px solid #2a2a2a',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            fontSize: 24,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            color: '#b9b9b9',
          }}
        >
          Alexander Okonkwo · Lab / Notes
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.1,
              letterSpacing: -1.2,
              maxWidth: '1000px',
              fontWeight: 700,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.35, color: '#c4c4c4', maxWidth: '1000px' }}>{summary.slice(0, 210)}</div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 26,
            color: '#b2b2b2',
          }}
        >
          <div style={{ display: 'flex' }}>alexok.dev/blog</div>
          <div style={{ display: 'flex' }}>{date || 'Engineering Journal'}</div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
