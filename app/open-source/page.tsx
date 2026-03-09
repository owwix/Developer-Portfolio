import type { Metadata } from 'next'
import OpenSourcePortal from '../../components/open-source/OpenSourcePortal'
import { fetchOpenSourceResources } from '../../lib/cms'
import { defaultOpenSourceResources, normalizeOpenSourceResources, type OpenSourceResource, type OpenSourceResourceRow } from '../../lib/openSource'
import { siteConfig } from '../../src/utils/siteConfig'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `Open Source | ${siteConfig.ownerName}`,
  description: `Reusable templates, starter kits, and developer tools built by ${siteConfig.ownerName}.`,
}

export default async function OpenSourcePage() {
  let resources: OpenSourceResource[] = defaultOpenSourceResources

  try {
    const res = await fetchOpenSourceResources<{ docs?: OpenSourceResourceRow[] }>(200)
    const fromCMS = normalizeOpenSourceResources(res?.docs || [])
    if (fromCMS.length) resources = fromCMS
  } catch (error) {
    console.error(error)
  }

  return <OpenSourcePortal resources={resources} />
}
