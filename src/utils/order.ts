type MaybeOrder = {
  displayOrder?: number | string | null
}

export function toDisplayOrderValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

export function sortByDisplayOrder<T extends MaybeOrder>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const orderA = toDisplayOrderValue(a?.displayOrder)
    const orderB = toDisplayOrderValue(b?.displayOrder)

    if (orderA != null || orderB != null) {
      if (orderA == null) return 1
      if (orderB == null) return -1
      if (orderA !== orderB) return orderA - orderB
    }

    const dateA = extractDate(a)
    const dateB = extractDate(b)
    if (dateA !== dateB) return dateB - dateA

    const titleA = extractString(a, ['title', 'name', 'role', 'slug'])
    const titleB = extractString(b, ['title', 'name', 'role', 'slug'])
    return titleA.localeCompare(titleB)
  })
}

function extractDate(input: unknown): number {
  if (!input || typeof input !== 'object') return 0
  const item = input as Record<string, unknown>
  const dateFields = ['publishedDate', 'startDate', 'createdAt', 'updatedAt']
  for (const field of dateFields) {
    const value = item[field]
    if (typeof value !== 'string') continue
    const ts = new Date(value).getTime()
    if (Number.isFinite(ts) && ts > 0) return ts
  }
  return 0
}

function extractString(input: unknown, fields: string[]): string {
  if (!input || typeof input !== 'object') return ''
  const item = input as Record<string, unknown>
  for (const field of fields) {
    const value = item[field]
    if (typeof value === 'string' && value.trim().length > 0) return value.trim().toLowerCase()
  }
  return ''
}

export const setDefaultDisplayOrder =
  (collectionSlug: string) =>
  async ({ data, operation, req }: { data?: Record<string, unknown>; operation?: string; req?: any }) => {
    if (!data || !req?.payload) return data

    const hasValue = Object.prototype.hasOwnProperty.call(data, 'displayOrder')
    if (operation === 'update' && !hasValue) return data

    const numericValue = toDisplayOrderValue(data.displayOrder)
    if (numericValue != null) {
      return {
        ...data,
        displayOrder: numericValue,
      }
    }

    if (operation !== 'create') return data

    const result = await req.payload.find({
      collection: collectionSlug,
      depth: 0,
      limit: 1,
      sort: '-displayOrder',
      overrideAccess: true,
    })

    const current = result?.docs?.[0] as MaybeOrder | undefined
    const maxOrder = toDisplayOrderValue(current?.displayOrder) ?? 0

    return {
      ...data,
      displayOrder: maxOrder + 1,
    }
  }
