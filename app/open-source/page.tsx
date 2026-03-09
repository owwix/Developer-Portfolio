import type { Metadata } from 'next'
import OpenSourcePortal from '../../components/open-source/OpenSourcePortal'
import { siteConfig } from '../../src/utils/siteConfig'

export const metadata: Metadata = {
  title: `Open Source | ${siteConfig.ownerName}`,
  description: `Reusable templates, starter kits, and developer tools built by ${siteConfig.ownerName}.`,
}

export default function OpenSourcePage() {
  return <OpenSourcePortal />
}
