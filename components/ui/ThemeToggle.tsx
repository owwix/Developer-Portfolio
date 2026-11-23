'use client'

import { useEffect, useState } from 'react'

export type SiteTheme = 'dark' | 'light'

const STORAGE_KEY = 'alexok-theme'

export function getStoredTheme(): SiteTheme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark') return value
  } catch {
    // Ignore storage access failures.
  }
  return null
}

export function resolvePreferredTheme(): SiteTheme {
  const stored = getStoredTheme()
  if (stored) return stored
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

export function applyTheme(theme: SiteTheme): void {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Ignore storage access failures.
  }
}

type ThemeToggleProps = {
  className?: string
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<SiteTheme>('dark')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const next = resolvePreferredTheme()
    applyTheme(next)
    setTheme(next)
    setReady(true)

    const media = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => {
      if (getStoredTheme()) return
      const systemTheme: SiteTheme = media.matches ? 'light' : 'dark'
      applyTheme(systemTheme)
      setTheme(systemTheme)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const nextTheme: SiteTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      aria-label={`Switch to ${nextTheme} mode`}
      className={['rf-theme-toggle', className].filter(Boolean).join(' ')}
      onClick={() => {
        applyTheme(nextTheme)
        setTheme(nextTheme)
      }}
      type="button"
    >
      {ready ? `[ ${nextTheme} ]` : '[ theme ]'}
    </button>
  )
}
