import type { Metadata } from 'next'
import Link from 'next/link'
import PhoneRequestForm from '../../components/forms/PhoneRequestForm'
import { siteConfig } from '../../src/utils/siteConfig'

export const metadata: Metadata = {
  title: `Reach Me by Phone | ${siteConfig.ownerName}`,
  description: 'Submit a phone request for collaboration, interview opportunities, or technical discussions.',
}

export default function ReachByPhonePage() {
  return (
    <main className="container page-phone">
      <header className="card page-hero reveal">
        <p className="eyebrow">Direct Contact</p>
        <h1>Reach Me by Phone</h1>
        <p className="page-intro">
          Use this form if you want to discuss a role, contract, or project call. I review requests and follow up directly by
          phone or email.
        </p>
        <Link className="view-all-link" href="/">
          ← Back to Portfolio
        </Link>
      </header>

      <PhoneRequestForm />
    </main>
  )
}
