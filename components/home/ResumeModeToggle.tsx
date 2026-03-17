import Link from 'next/link'

type ResumeModeToggleProps = {
  enabled: boolean
  resumeFileUrl?: string
  resumeFileName?: string
}

export default function ResumeModeToggle({ enabled, resumeFileUrl, resumeFileName }: ResumeModeToggleProps) {
  return (
    <div className={`resume-mode-banner ${enabled ? 'is-active' : ''}`.trim()} role="status">
      <p className="resume-mode-text">
        {enabled
          ? 'Resume mode is enabled: streamlined for recruiters and quick portfolio review.'
          : 'Need a quick recruiter-friendly view? Enable Resume mode.'}
      </p>
      <div className="resume-mode-actions">
        {enabled && resumeFileUrl ? (
          <>
            <a className="resume-mode-action" data-journey-type="resume-open" href={resumeFileUrl} rel="noreferrer" target="_blank">
              View Resume
            </a>
            <a className="resume-mode-action" data-journey-type="resume-download" download={resumeFileName || 'resume.pdf'} href={resumeFileUrl}>
              Download PDF
            </a>
          </>
        ) : null}
        <Link className="resume-mode-action" href={enabled ? '/' : '/?mode=resume'}>
        {enabled ? 'Disable Resume Mode' : 'Enable Resume Mode'}
        </Link>
      </div>
    </div>
  )
}
