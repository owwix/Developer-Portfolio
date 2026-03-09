import { usePayloadAPI } from 'payload/components/hooks'
import { siteConfig } from '../../utils/siteConfig'

type AdminIconProps = {
  className?: string
}

type AdminBrandingData = {
  brandMonogram?: string
  brandImage?: {
    url?: string
    alt?: string
    sizes?: {
      avatar?: {
        url?: string
      }
    }
  } | null
}

export default function AdminIcon({ className = '' }: AdminIconProps) {
  const [brandingResult] = usePayloadAPI('/api/globals/admin-branding?depth=1')
  const branding = (brandingResult?.data || {}) as AdminBrandingData
  const iconImage = branding?.brandImage?.url || branding?.brandImage?.sizes?.avatar?.url || ''
  const monogram = String(branding?.brandMonogram || siteConfig.cmsMonogram).trim() || siteConfig.cmsMonogram

  return (
    <div aria-label={siteConfig.cmsTitle} className={`ao-admin-icon ${className}`.trim()} role="img">
      {iconImage ? <img alt={branding?.brandImage?.alt || 'CMS icon'} className="ao-admin-icon-image" src={iconImage} /> : <span>{monogram}</span>}
    </div>
  )
}
