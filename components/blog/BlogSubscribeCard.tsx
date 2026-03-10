import Link from 'next/link'

type BlogSubscribeCardProps = {
  title?: string
  description?: string
  digestUrl?: string
  digestLabel?: string
}

function isExternalUrl(value?: string): boolean {
  return /^https?:\/\//i.test(String(value || '').trim())
}

export default function BlogSubscribeCard({ title, description, digestUrl, digestLabel }: BlogSubscribeCardProps) {
  const cleanDigestUrl = String(digestUrl || '').trim()
  const hasDigestUrl = isExternalUrl(cleanDigestUrl)

  return (
    <section className="card reveal blog-subscribe-card" aria-label="Blog subscriptions">
      <p className="eyebrow">Publishing Updates</p>
      <h2>{title || 'Stay in the Loop'}</h2>
      <p className="blog-subscribe-description">
        {description ||
          'Get new engineering notes as they ship. Subscribe to the digest or follow the RSS feed for direct updates.'}
      </p>
      <div className="blog-subscribe-actions">
        {hasDigestUrl ? (
          <a className="view-all-link" href={cleanDigestUrl} rel="noreferrer" target="_blank">
            {digestLabel || 'Join Digest'}
          </a>
        ) : null}
        <Link className="view-all-link" href="/rss">
          Follow RSS
        </Link>
      </div>
    </section>
  )
}
