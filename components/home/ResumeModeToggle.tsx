import Link from 'next/link'

type ResumeModeToggleProps = {
  enabled: boolean
  resumeFileUrl?: string
  resumeFileName?: string
}

export default function ResumeModeToggle({ enabled, resumeFileUrl, resumeFileName }: ResumeModeToggleProps) {
  if (!enabled) {
    return (
      <div className="resume-mode-banner resume-mode-banner-compact">
        <p className="resume-mode-text">Recruiter?</p>
        <Link className="resume-mode-inline-action" href="/?mode=resume">
          Open streamlined view <span aria-hidden="true">→</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="resume-mode-banner is-active" role="status">
      <div className="resume-mode-top">
        <p className="resume-mode-text">
          Resume mode is enabled: streamlined for recruiters and quick portfolio review.
        </p>
        <Link className="resume-mode-action resume-mode-toggle-action" href="/">
          Disable Resume Mode
        </Link>
      </div>
      {resumeFileUrl ? (
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
