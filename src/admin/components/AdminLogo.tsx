import { usePayloadAPI } from 'payload/components/hooks'

type AdminLogoProps = {
  className?: string
}

type AdminBrandingData = {
  brandMonogram?: string
  loginTitle?: string
  loginSubtitle?: string
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

export default function AdminLogo({ className = '' }: AdminLogoProps) {
  const [brandingResult] = usePayloadAPI('/api/globals/admin-branding?depth=1')
  const branding = (brandingResult?.data || {}) as AdminBrandingData
  const iconImage = branding?.brandImage?.url || branding?.brandImage?.sizes?.avatar?.url || ''
  const monogram = String(branding?.brandMonogram || 'AO').trim() || 'AO'
  const title = String(branding?.loginTitle || 'Alexander Okonkwo CMS').trim() || 'Alexander Okonkwo CMS'
  const subtitle = String(branding?.loginSubtitle || 'Engineering Journal Control Center').trim()

  return (
    <div className={`ao-admin-logo ${className}`.trim()}>
      <div aria-hidden="true" className="ao-admin-logo-mark">
        {iconImage ? <img alt={branding?.brandImage?.alt || 'CMS icon'} className="ao-admin-logo-image" src={iconImage} /> : monogram}
      </div>
      <div className="ao-admin-logo-copy">
        <strong>{title}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
    </div>
  )
}
