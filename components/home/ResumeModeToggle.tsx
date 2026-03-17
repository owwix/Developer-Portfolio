import Link from 'next/link'

type ResumeModeToggleProps = {
  enabled: boolean
  resumeFileUrl?: string
  resumeFileName?: string
}

export default function ResumeModeToggle({ enabled, resumeFileUrl, resumeFileName }: ResumeModeToggleProps) {
  return (
    <div className={`resume-mode-banner ${enabled ? 'is-active' : ''}`.trim()} role="status">
      <div className="resume-mode-top">
        <p className="resume-mode-text">
          {enabled
            ? 'Resume mode is enabled: streamlined for recruiters and quick portfolio review.'
            : 'Need a quick recruiter-friendly view? Enable Resume mode.'}
        </p>
        <Link className="resume-mode-action resume-mode-toggle-action" href={enabled ? '/' : '/?mode=resume'}>
          {enabled ? 'Disable Resume Mode' : 'Enable Resume Mode'}
        </Link>
      </div>
      {enabled && resumeFileUrl ? (
        <span className="resume-mode-file-actions">
          <a className="resume-mode-action" data-journey-type="resume-open" href={resumeFileUrl} rel="noreferrer" target="_blank">
            View Resume
          </a>
          <a className="resume-mode-action" data-journey-type="resume-download" download={resumeFileName || 'resume.pdf'} href={resumeFileUrl}>
            Download PDF
          </a>
        </span>
      ) : null}
    </div>
  )
}
