import type { Metadata } from 'next'
import { IBM_Plex_Mono, Space_Grotesk } from 'next/font/google'
import type { ReactNode } from 'react'
import NetworkBackground from '../components/ui/NetworkBackground'
import ThemeToggle from '../components/ui/ThemeToggle'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.alexok.dev'),
  title: 'Alexander Okonkwo | Software Engineer',
  description:
    'Portfolio of Alexander Okonkwo, a full-stack software engineer building scalable web applications with React, Next.js, TypeScript, and cloud technologies.',
  icons: {
    icon: [{ url: '/ao-icon.svg', type: 'image/svg+xml' }],
    shortcut: '/ao-icon.svg',
    apple: '/ao-icon.svg',
  },
  openGraph: {
    title: 'Alexander Okonkwo | Software Engineer',
    description:
      'Portfolio of Alexander Okonkwo, featuring engineering notes, project breakdowns, and technical build logs.',
    url: 'https://www.alexok.dev',
    siteName: 'Alexander Okonkwo Portfolio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alexander Okonkwo | Software Engineer',
    description:
      'Portfolio of Alexander Okonkwo, featuring engineering notes, project breakdowns, and technical build logs.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const themeInitScript = `
    (function () {
      try {
        var stored = localStorage.getItem('theme');
        var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        var nextTheme = stored === 'light' || stored === 'dark' ? stored : (prefersLight ? 'light' : 'dark');
        document.documentElement.setAttribute('data-theme', nextTheme);
      } catch (e) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    })();
  `

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Alexander Okonkwo',
    jobTitle: 'Software Engineer',
    url: 'https://www.alexok.dev',
  }

  return (
    <html className={`${spaceGrotesk.variable} ${plexMono.variable}`} data-theme="dark" lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <NetworkBackground />
        <ThemeToggle />
        {children}
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
