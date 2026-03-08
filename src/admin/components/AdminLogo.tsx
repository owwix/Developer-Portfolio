type AdminLogoProps = {
  className?: string
}

export default function AdminLogo({ className = '' }: AdminLogoProps) {
  return (
    <div className={`ao-admin-logo ${className}`.trim()}>
      <div aria-hidden="true" className="ao-admin-logo-mark">
        AO
      </div>
      <div className="ao-admin-logo-copy">
        <strong>Alexander Okonkwo CMS</strong>
        <span>Engineering Journal Control Center</span>
      </div>
    </div>
  )
}
