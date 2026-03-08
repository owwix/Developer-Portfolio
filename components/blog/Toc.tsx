import type { TocItem } from '../../lib/blog'

export default function Toc({ items = [] }: { items?: TocItem[] }) {
  if (!items.length) return null

  return (
    <aside className="toc" aria-label="Table of contents">
      <h2>On This Page</h2>
      <nav>
        <ul>
          {items.map((item) => (
            <li className={item.level >= 3 ? 'toc-indent' : ''} key={item.id}>
              <a href={`#${item.id}`}>{item.text}</a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
