'use client'

import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

function getInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  const current = document.documentElement.getAttribute('data-theme')
  return current === 'light' ? 'light' : 'dark'
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    setMounted(true)
    setTheme(getInitialTheme())
  }, [])

  const onToggle = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    localStorage.setItem('theme', nextTheme)
  }

  return (
    <button
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="theme-toggle"
      onClick={onToggle}
      type="button"
    >
      <span aria-hidden="true" className="theme-toggle-icon">
        {theme === 'dark' ? 'LM' : 'DM'}
      </span>
      <span className="theme-toggle-label">{mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  )
}
