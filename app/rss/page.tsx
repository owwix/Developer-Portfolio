import type { Metadata } from 'next'
import Link from 'next/link'
import { siteConfig } from '../../src/utils/siteConfig'

export const metadata: Metadata = {
  title: `Follow RSS | ${siteConfig.ownerName}`,
  description: `Subscribe to ${siteConfig.ownerName}'s engineering notes RSS feed.`,
  alternates: {
    canonical: '/rss',
  },
}

export default function RSSPage() {
  const feedUrl = `${siteConfig.siteUrl}/rss.xml`
  const encodedFeedUrl = encodeURIComponent(feedUrl)

  return (
    <main className="container page-rss">
      <section className="card reveal page-hero">
        <p className="eyebrow">Publishing Updates</p>
        <h1>Follow via RSS</h1>
        <p className="page-intro">
          RSS feeds are machine-readable, so opening them directly in a browser shows raw XML. Use one of the options below
          to subscribe in a reader.
        </p>
        <div className="rss-link-grid">
          <a className="view-all-link" href={feedUrl} rel="noreferrer" target="_blank">
            Open Raw Feed
          </a>
          <a
            className="view-all-link"
            href={`https://feedly.com/i/subscription/feed/${encodedFeedUrl}`}
            rel="noreferrer"
            target="_blank"
          >
            Subscribe in Feedly
          </a>
          <Link className="view-all-link" href="/blog">
            ← Back to {siteConfig.blogLabel}
          </Link>
        </div>
        <p className="rss-feed-url">{feedUrl}</p>
      </section>
    </main>
  )
}
