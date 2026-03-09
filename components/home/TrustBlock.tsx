type TrustItem = {
  label?: string
  value?: string
}

type TrustBlockProps = {
  title?: string
  description?: string
  items?: TrustItem[]
}

const defaultItems: TrustItem[] = [
  { label: 'Deployment discipline', value: 'Production-focused, iterative shipping' },
  { label: 'System design', value: 'Maintainable architecture for long-term scale' },
  { label: 'Documentation', value: 'Technical notes and engineering writeups' },
]

export default function TrustBlock({ title, description, items = [] }: TrustBlockProps) {
  const normalizedItems = items.filter((item) => item?.label && item?.value)
  const trustItems = normalizedItems.length ? normalizedItems : defaultItems

  return (
    <article className="card reveal full trust-block-card">
      <h2>{title || 'Delivery Signals'}</h2>
      {description ? <p className="trust-block-description">{description}</p> : null}
      <div className="trust-block-grid">
        {trustItems.map((item) => (
          <article className="trust-block-item" key={`${item.label}-${item.value}`}>
            <p className="trust-block-item-label">{item.label}</p>
            <p className="trust-block-item-value">{item.value}</p>
          </article>
        ))}
      </div>
    </article>
  )
}
