import type { Metadata } from 'next'
import { IBM_Plex_Mono, Space_Grotesk } from 'next/font/google'
import type { ReactNode } from 'react'
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
  return (
    <html className={`${spaceGrotesk.variable} ${plexMono.variable}`} lang="en">
      <body>
        <div className="bg-layer" aria-hidden="true" />
        <div className="bg-grid" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
