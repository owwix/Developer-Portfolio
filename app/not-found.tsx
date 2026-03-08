import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <main className="container page-not-found">
      <section className="card reveal">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="page-intro">The page you requested is unavailable or may have been moved.</p>
        <Link className="view-all-link" href="/">
          Return to portfolio
        </Link>
      </section>
    </main>
  )
}
