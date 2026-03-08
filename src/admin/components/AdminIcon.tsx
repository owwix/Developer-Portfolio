type AdminIconProps = {
  className?: string
}

export default function AdminIcon({ className = '' }: AdminIconProps) {
  return (
    <div aria-label="Alexander Okonkwo CMS" className={`ao-admin-icon ${className}`.trim()} role="img">
      <span>AO</span>
    </div>
  )
}
