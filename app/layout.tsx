import type { Metadata } from 'next'
import { Archivo, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import type { ReactNode } from 'react'
import JourneyTracker from '../components/analytics/JourneyTracker'
import NetworkBackground from '../components/ui/NetworkBackground'
import { siteConfig, siteMetadata } from '../src/utils/siteConfig'
import './globals.css'
import './reforged.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
})

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: siteMetadata.title,
  description: siteMetadata.description,
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  icons: {
    icon: [{ url: '/ao-icon.svg', type: 'image/svg+xml' }],
    shortcut: '/ao-icon.svg',
    apple: '/ao-icon.svg',
  },
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteConfig.siteUrl,
    siteName: `${siteConfig.ownerName} Portfolio`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteMetadata.title,
    description: siteMetadata.description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.ownerName,
    jobTitle: siteConfig.ownerRole,
    url: siteConfig.siteUrl,
  }

  const currentYear = new Date().getFullYear()

  return (
    <html className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${archivo.variable}`} data-theme="dark" lang="en">
      <body>
        <NetworkBackground />
        <JourneyTracker />
        {children}
        <footer className="site-footer">
          <p>
            &copy; {currentYear} {siteConfig.ownerName}. All rights reserved.
          </p>
        </footer>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd),
          }}
        />
      </body>
    </html>
  )
}
