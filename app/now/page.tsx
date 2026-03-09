import type { Metadata } from 'next'
import Link from 'next/link'
import SectionContextNav from '../../components/blog/SectionContextNav'
import { fetchNow } from '../../lib/cms'
import { siteConfig } from '../../src/utils/siteConfig'

export const dynamic = 'force-dynamic'

type NowItem = {
  item?: string
}

type BuildingNowItem = {
  title?: string
  status?: string
  details?: string
}

type NowData = {
  eyebrow?: string
  title?: string
  intro?: string
  updatedAt?: string
  focusAreas?: NowItem[]
  buildingNow?: BuildingNowItem[]
  shippingNext?: NowItem[]
}

export const metadata: Metadata = {
  title: `Now | ${siteConfig.ownerName}`,
  description: `Current focus areas, active builds, and what ${siteConfig.ownerName} is shipping next.`,
}

function formatDate(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default async function NowPage() {
  let data: NowData | null = null

  try {
    data = await fetchNow<NowData>()
  } catch (error) {
    console.error(error)
  }

  const focusAreas = (data?.focusAreas || []).map((entry) => String(entry?.item || '').trim()).filter(Boolean)
  const buildingNow = (data?.buildingNow || [])
    .map((entry) => ({
      title: String(entry?.title || '').trim(),
      status: String(entry?.status || '').trim() || 'Active',
      details: String(entry?.details || '').trim(),
    }))
    .filter((entry) => entry.title && entry.details)
  const shippingNext = (data?.shippingNext || []).map((entry) => String(entry?.item || '').trim()).filter(Boolean)
  const updated = formatDate(data?.updatedAt)

  return (
    <main className="container page-now">
      <SectionContextNav items={[{ label: 'Portfolio', href: '/' }, { label: 'Now' }]} />
      <header className="card page-hero reveal">
        <p className="eyebrow">{data?.eyebrow || 'Current Focus'}</p>
        <h1>{data?.title || 'Now'}</h1>
        <p className="page-intro">
          {data?.intro ||
            'What I am currently building, improving, and learning. This page updates as priorities shift across projects and writing.'}
        </p>
        {updated ? <p className="now-updated-meta">Last updated: {updated}</p> : null}
        <Link className="view-all-link back-to-portfolio-link" href="/">
          ← Back to Portfolio
        </Link>
      </header>

      <section className="grid">
        {focusAreas.length ? (
          <article className="card reveal">
            <h2>Focus Areas</h2>
            <div className="meta">
              {focusAreas.map((item) => (
                <span className="badge" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </article>
        ) : null}

        {shippingNext.length ? (
          <article className="card reveal">
            <h2>Shipping Next</h2>
            <ul className="now-list">
              {shippingNext.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ) : null}

        {buildingNow.length ? (
          <article className="card reveal full">
            <h2>Building Now</h2>
            <div className="stack">
              {buildingNow.map((item) => (
                <article className="item" key={`${item.title}-${item.status}`}>
                  <div className="section-head">
                    <h3>{item.title}</h3>
                    <span className="badge">{item.status}</span>
                  </div>
                  <p>{item.details}</p>
                </article>
              ))}
            </div>
          </article>
        ) : null}
      </section>
    </main>
  )
}
