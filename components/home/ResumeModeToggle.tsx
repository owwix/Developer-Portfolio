import Link from 'next/link'

type ResumeModeToggleProps = {
  enabled: boolean
}

export default function ResumeModeToggle({ enabled }: ResumeModeToggleProps) {
  return (
    <div className="resume-mode-banner" role="status">
      <p>
        {enabled
          ? 'Resume mode is enabled: streamlined for recruiters and quick portfolio review.'
          : 'Need a quick recruiter-friendly view? Enable Resume mode.'}
      </p>
      <Link className="view-all-link" href={enabled ? '/' : '/?mode=resume'}>
        {enabled ? 'Disable Resume Mode' : 'Enable Resume Mode'}
      </Link>
    </div>
  )
}
