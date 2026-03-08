import type { ReactNode } from 'react'

export type EngineeringCalloutVariant = 'decision' | 'why' | 'tradeoff' | 'lesson' | 'improve'

type EngineeringCalloutProps = {
  variant: EngineeringCalloutVariant
  title?: string
  icon?: string
  children: ReactNode
  className?: string
}

const CALLOUT_META: Record<EngineeringCalloutVariant, { label: string; icon: string }> = {
  decision: { label: 'Decision', icon: '◆' },
  why: { label: 'Why This Mattered', icon: '◉' },
  tradeoff: { label: 'Tradeoff', icon: '◌' },
  lesson: { label: 'Lesson Learned', icon: '▣' },
  improve: { label: "What I'd Improve Next", icon: '→' },
}

export default function EngineeringCallout({ variant, title, icon, children, className = '' }: EngineeringCalloutProps) {
  const meta = CALLOUT_META[variant]

  return (
    <aside className={`callout callout-${variant} ${className}`.trim()}>
      <div className="callout-head">
        <span aria-hidden="true" className="callout-icon">
          {icon || meta.icon}
        </span>
        <span className="callout-title">{title || meta.label}</span>
      </div>
      <div className="callout-content">{children}</div>
    </aside>
  )
}
