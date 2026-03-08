import Link from 'next/link'

type SectionContextItem = {
  label: string
  href?: string
}

export default function SectionContextNav({ items, className = '' }: { items: SectionContextItem[]; className?: string }) {
  if (!items.length) return null

  return (
    <nav aria-label="Section context" className={`section-context ${className}`.trim()}>
      <ol>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1 || !item.href

          return (
            <li className={`section-context-item${isCurrent ? ' is-current' : ''}`} key={`${item.label}-${index}`}>
              {isCurrent ? (
                <span aria-current="page" className="section-context-current">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
