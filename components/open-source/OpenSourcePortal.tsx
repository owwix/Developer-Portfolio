import Link from 'next/link'
import { getOpenSourceByCategory, type OpenSourceResource } from '../../lib/openSource'
import { siteConfig } from '../../src/utils/siteConfig'
import SectionContextNav from '../blog/SectionContextNav'
import OpenSourceCard from './OpenSourceCard'

function toAnchorId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

type OpenSourcePortalProps = {
  resources: OpenSourceResource[]
}

export default function OpenSourcePortal({ resources }: OpenSourcePortalProps) {
  const grouped = getOpenSourceByCategory(resources)

  return (
    <main className="container page-open-source">
      <SectionContextNav items={[{ label: 'Portfolio', href: '/' }, { label: 'Open Source' }]} />
      <header className="card page-hero reveal">
        <p className="eyebrow">Developer Platform</p>
        <h1>Open Source</h1>
        <p className="page-intro">
          Reusable templates, starter kits, and developer tools built for real-world use. This is where I package patterns from
          production work into resources other developers can ship with.
        </p>
        <Link className="view-all-link back-to-portfolio-link" href="/">
          ← Back to Portfolio
        </Link>
      </header>

      <section className="card reveal open-source-archive">
        <div className="section-head open-source-archive-head">
          <h2>All Resources</h2>
          <span className="open-source-archive-count">{resources.length} total</span>
        </div>

        <div className="open-source-category-nav" role="list" aria-label="Open source categories">
          {grouped.map((group) => (
            <a className="filter-pill" href={`#${toAnchorId(group.category)}`} key={group.category} role="listitem">
              {group.category}
            </a>
          ))}
        </div>

        <div className="open-source-groups">
          {grouped.map((group) => (
            <section className="open-source-group" id={toAnchorId(group.category)} key={group.category}>
              <div className="section-head">
                <h3>{group.category}</h3>
                <span className="open-source-group-count">{group.items.length} items</span>
              </div>

              <div className="open-source-grid is-detailed">
                {group.items.map((resource) => (
                  <OpenSourceCard key={resource.id} resource={resource} variant="detail" />
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="open-source-archive-footer">
          <p>
            Building in public: products on one side, reusable tooling on the other, and engineering notes in{' '}
            <Link className="hero-blog-link" href="/blog">
              {siteConfig.blogLabel}
            </Link>
            .
          </p>
        </footer>
      </section>
    </main>
  )
}
