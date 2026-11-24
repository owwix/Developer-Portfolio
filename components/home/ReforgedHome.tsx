'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { HomepageCopy } from '../../src/utils/homepageCopy'
import { DEFAULT_HOMEPAGE_COPY } from '../../src/utils/homepageCopy'
import ThemeToggle from '../ui/ThemeToggle'
import Reveal from './Reveal'

const NAV_HREFS = [
  { key: 'about', href: '#about' },
  { key: 'experience', href: '#experience' },
  { key: 'projects', href: '#projects' },
  { key: 'skills', href: '#skills' },
  { key: 'notes', href: '#notes' },
  { key: 'openSource', href: '#open-source' },
  { key: 'education', href: '#education' },
  { key: 'contact', href: '#contact' },
] as const

type ProjectTabKey = 'all' | 'frontend' | 'backend' | 'ai' | 'infra'

export type ReforgedContactItem = {
  label: string
  value: string
  href: string
  external?: boolean
}

export type ReforgedSkillGroup = {
  title: string
  items: string[]
}

export type ReforgedProjectImage = {
  url: string
  alt: string
}

export type ReforgedProject = {
  id: string
  title: string
  focusAreas: string[]
  bullets: string[]
  images: ReforgedProjectImage[]
  liveUrl?: string
  liveUrlLabel?: string
  repoUrl?: string
  caseStudyUrl?: string
}

export type ReforgedExperience = {
  id: string
  role: string
  org: string
  period: string
  place?: string
  current?: boolean
  bullets: string[]
}

export type ReforgedEducation = {
  id: string
  title: string
  lead?: string
  period?: string
  place?: string
  current?: boolean
  highlights: string[]
}

export type ReforgedNote = {
  id: string
  title: string
  blurb: string
  meta: string
  tags: string[]
  href: string
}

export type ReforgedOpenSource = {
  id: string
  title: string
  description: string
  stack: string[]
  githubUrl?: string
}

export type ReforgedHomeProps = {
  name: string
  headline: string
  announcementEnabled?: boolean
  announcementMessage: string
  avatarAlt: string
  avatarUrl: string
  terminalPrompt: string
  identityCommand: string
  heroStatement: string
  aboutBodyHtml?: string
  personalNote?: string
  projectsLabel: string
  resumeLabel: string
  contactLabel: string
  email?: string
  resumeUrl?: string
  resumeFileName?: string
  isResumeMode?: boolean
  contactStrip: ReforgedContactItem[]
  projects: ReforgedProject[]
  skills: ReforgedSkillGroup[]
  experiences: ReforgedExperience[]
  education: ReforgedEducation[]
  notes: ReforgedNote[]
  openSource: ReforgedOpenSource[]
  contactLinks: ReforgedContactItem[]
  copy?: HomepageCopy
  showProjects?: boolean
  showSkills?: boolean
  showOpenSource?: boolean
  showExperience?: boolean
  showEducation?: boolean
  showBlog?: boolean
  currentYear: number
}

function Cmd({ children }: { children: string }) {
  return (
    <div className="rf-cmd">
      <span className="rf-cmd-dollar">$</span>
      <span>{children}</span>
      <span aria-hidden="true" className="rf-cmd-rule" />
    </div>
  )
}

function SectionHead({ cmd, title, lead }: { cmd: string; title: string; lead?: string }) {
  return (
    <div className="rf-section-head">
      <Cmd>{cmd}</Cmd>
      <h2 className="rf-section-title">{title}</h2>
      {lead ? <p className="rf-section-lead">{lead}</p> : null}
    </div>
  )
}

function Section({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section className="rf-section" id={id}>
      <div className="rf-section-inner">{children}</div>
    </section>
  )
}

function focusMatchesTab(areas: string[], tab: ProjectTabKey): boolean {
  if (tab === 'all') return true
  return areas.some((area) => area === tab || area.includes(tab))
}

export default function ReforgedHome(props: ReforgedHomeProps) {
  const {
    name,
    headline,
    announcementEnabled = false,
    announcementMessage,
    avatarAlt,
    avatarUrl,
    terminalPrompt,
    identityCommand,
    heroStatement,
    aboutBodyHtml,
    personalNote,
    projectsLabel,
    resumeLabel,
    contactLabel,
    email,
    resumeUrl,
    resumeFileName,
    isResumeMode = false,
    contactStrip,
    projects,
    skills,
    experiences,
    education,
    notes,
    openSource,
    contactLinks,
    copy = DEFAULT_HOMEPAGE_COPY,
    showProjects = true,
    showSkills = true,
    showOpenSource = true,
    showExperience = true,
    showEducation = true,
    showBlog = true,
    currentYear,
  } = props

  const [menuOpen, setMenuOpen] = useState(false)
  const [tab, setTab] = useState<ProjectTabKey>('all')
  const [activeId, setActiveId] = useState('')
  const [projectImageIndices, setProjectImageIndices] = useState<Record<string, number>>({})

  const promptUser = terminalPrompt.replace(/:~\$\s*$/, '') || 'alexander@portfolio'
  const navItems = NAV_HREFS.map((item) => ({
    ...item,
    label: copy.nav[item.key],
  }))
  const projectTabs: Array<{ key: ProjectTabKey; label: string }> = [
    { key: 'all', label: copy.labels.projectTabAll },
    { key: 'frontend', label: copy.labels.projectTabFrontend },
    { key: 'backend', label: copy.labels.projectTabBackend },
    { key: 'ai', label: copy.labels.projectTabAi },
    { key: 'infra', label: copy.labels.projectTabInfra },
  ]

  useEffect(() => {
    const ids = NAV_HREFS.map((n) => n.href.slice(1))
    const sections = ids.map((id) => document.getElementById(id)).filter((s): s is HTMLElement => Boolean(s))
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const filteredProjects = useMemo(
    () => projects.filter((project) => focusMatchesTab(project.focusAreas, tab)),
    [projects, tab],
  )

  const sayHiHref = email ? `mailto:${email}` : '#contact'
  const resumeHref = resumeUrl || '/?mode=resume'
  const resumeIsExternal = Boolean(resumeUrl)
  const activeTabLabel = projectTabs.find((item) => item.key === tab)?.label || tab

  return (
    <main className="rf-root" id="top">
      <header className="rf-nav">
        <div className="rf-nav-inner">
          <a className="rf-nav-brand" href="#top">
            <span className="rf-nav-brand-user">{promptUser}</span>
            <span className="rf-nav-brand-suffix">:~$</span>
          </a>
          <nav aria-label="Portfolio sections" className="rf-nav-links">
            {navItems.map((item) => (
              <a
                className={`rf-nav-link${activeId === item.href.slice(1) ? ' rf-nav-link-active' : ''}`}
                href={item.href}
                key={item.href}
                onClick={() => setActiveId(item.href.slice(1))}
              >
                {item.label}
              </a>
            ))}
            <ThemeToggle />
          </nav>
          <div className="rf-nav-actions">
            <ThemeToggle className="rf-theme-toggle-mobile" />
            <button
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
              className="rf-nav-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              {menuOpen ? copy.labels.menuCloseLabel : copy.labels.menuOpenLabel}
            </button>
          </div>
        </div>
        <nav aria-label="Mobile portfolio sections" className={`rf-nav-mobile${menuOpen ? ' is-open' : ''}`}>
          <div className="rf-nav-mobile-grid">
            {navItems.map((item) => (
              <a
                className={activeId === item.href.slice(1) ? 'is-active' : undefined}
                href={item.href}
                key={`mobile-${item.href}`}
                onClick={() => {
                  setMenuOpen(false)
                  setActiveId(item.href.slice(1))
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <section className="rf-hero rf-blueprint rf-blueprint-fade" id="hero">
        <div className="rf-hero-inner">
          {announcementEnabled ? (
            <p className="rf-announce">
              <span className="rf-announce-label">{copy.labels.announcementPrefix}</span>
              {announcementMessage}
            </p>
          ) : null}

          <div className="rf-hero-main">
            <div className="rf-hero-copy">
              <p className="rf-cmd-line">$ {identityCommand}</p>
              <h1 className="rf-hero-name">{name}</h1>
              <p className="rf-hero-role">{headline}</p>
              <p className="rf-hero-statement">{heroStatement}</p>
              <div className="rf-cta-row">
                <a className="rf-cta rf-cta-solid" href="#projects">
                  <span>{projectsLabel}</span>
                </a>
                {resumeIsExternal ? (
                  <a
                    className="rf-cta"
                    data-journey-type="resume-download"
                    download={resumeFileName || 'resume.pdf'}
                    href={resumeHref}
                    rel="noreferrer"
                  >
                    <span>{resumeLabel}</span>
                  </a>
                ) : (
                  <Link className="rf-cta" href={resumeHref}>
                    <span>{resumeLabel}</span>
                  </Link>
                )}
                <a className="rf-cta" href={sayHiHref}>
                  <span>{contactLabel}</span>
                </a>
              </div>
            </div>

            <figure className="rf-avatar-frame">
              <img alt={avatarAlt} className="rf-avatar" src={avatarUrl} />
              <figcaption>{copy.labels.portraitCaption}</figcaption>
            </figure>
          </div>
        </div>

        {contactStrip.length ? (
          <div className="rf-contact-strip">
            <dl className="rf-contact-strip-grid">
              {contactStrip.map((item) => (
                <a
                  className="rf-contact-cell"
                  href={item.href}
                  key={`${item.label}-${item.href}`}
                  {...(item.external ? { rel: 'noreferrer', target: '_blank' } : {})}
                >
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </a>
              ))}
            </dl>
          </div>
        ) : null}
      </section>

      <Section id="about">
        <Reveal>
          <SectionHead cmd={copy.about.command} lead={copy.about.lead} title={copy.about.title} />
        </Reveal>
        <Reveal delay={80}>
          <div className="rf-about-grid">
            <div>
              {aboutBodyHtml ? (
                <div className="rf-about-body" dangerouslySetInnerHTML={{ __html: aboutBodyHtml }} />
              ) : (
                <p className="rf-about-body">{copy.about.bodyFallback}</p>
              )}
            </div>
            <div>
              {!isResumeMode && personalNote ? (
                <>
                  <p className="rf-label">{copy.labels.offHoursLabel}</p>
                  <p className="rf-off-hours">{personalNote}</p>
                </>
              ) : null}

              {isResumeMode ? (
                <div className="rf-resume-banner" role="status">
                  <p>{copy.labels.resumeModeBanner}</p>
                  <div className="rf-resume-actions">
                    <Link href="/">{copy.labels.disableResumeModeLabel}</Link>
                    {resumeUrl ? (
                      <>
                        <a data-journey-type="resume-open" href={resumeUrl} rel="noreferrer" target="_blank">
                          {copy.labels.viewResumeLabel}
                        </a>
                        <a
                          data-journey-type="resume-download"
                          download={resumeFileName || 'resume.pdf'}
                          href={resumeUrl}
                        >
                          {copy.labels.downloadPdfLabel}
                        </a>
                      </>
                    ) : null}
                  </div>
                </div>
              ) : (
                <Link className="rf-inline-link" href="/?mode=resume">
                  {copy.labels.recruiterLinkLabel}
                </Link>
              )}
            </div>
          </div>
        </Reveal>
      </Section>

      {showExperience ? (
        <Section id="experience">
          <Reveal>
            <SectionHead
              cmd={copy.sections.experience.command}
              lead={copy.sections.experience.description}
              title={copy.sections.experience.title}
            />
          </Reveal>
          <div className="rf-stack">
            {experiences.length ? (
              experiences.map((exp, index) => (
                <Reveal delay={index * 70} key={exp.id}>
                  <div className="rf-exp-row rf-row-hover">
                    <div>
                      <div className="rf-exp-meta-row">
                        <span aria-hidden="true" className="rf-row-marker" />
                        {exp.period ? <p className="rf-exp-period">{exp.period}</p> : null}
                        {exp.current ? <span className="rf-exp-current">current</span> : null}
                      </div>
                      <h3 className="rf-exp-role">{exp.role}</h3>
                      {exp.org ? <p className="rf-exp-org">{exp.org}</p> : null}
                      {exp.place ? <p className="rf-exp-place">{exp.place}</p> : null}
                    </div>
                    {exp.bullets.length ? (
                      <ul className="rf-exp-bullets">
                        {exp.bullets.map((bullet) => (
                          <li key={bullet}>
                            <span aria-hidden="true" className="rf-bullet-mark" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </Reveal>
              ))
            ) : (
              <p className="rf-empty">No experience entries yet.</p>
            )}
          </div>
        </Section>
      ) : null}

      {showProjects ? (
        <Section id="projects">
          <Reveal>
            <SectionHead
              cmd={copy.sections.projects.command}
              lead={copy.sections.projects.description}
              title={copy.sections.projects.title}
            />
          </Reveal>
          <Reveal delay={60}>
            <div className="rf-tabs" role="tablist" aria-label="Project focus areas">
              {projectTabs.map((item) => (
                <button
                  aria-selected={tab === item.key}
                  className={`rf-tab${tab === item.key ? ' is-active' : ''}`}
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  role="tab"
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            {filteredProjects.length ? (
              filteredProjects.map((project, index) => {
                const images = project.images || []
                const imageCount = images.length
                const activeImageIndex =
                  imageCount <= 1 ? 0 : Math.min(Math.max(projectImageIndices[project.id] || 0, 0), imageCount - 1)
                const activeImage = images[activeImageIndex]
                const hasLinks = Boolean(project.liveUrl || project.repoUrl || project.caseStudyUrl)
                const hasAside = Boolean(activeImage || hasLinks)

                return (
                  <article
                    className={`rf-project${activeImage ? ' has-media' : ''}${hasAside ? '' : ' no-aside'}`}
                    key={project.id}
                  >
                    <div className="rf-project-main">
                      <div className="rf-project-head">
                        <div className="rf-project-title-row">
                          <span className="rf-project-index">{String(index + 1).padStart(2, '0')}</span>
                          <h3 className="rf-project-title">{project.title}</h3>
                        </div>
                        {project.focusAreas.length ? (
                          <p className="rf-project-tags">
                            {project.focusAreas
                              .map((area) => area.charAt(0).toUpperCase() + area.slice(1))
                              .join('  ·  ')}
                          </p>
                        ) : null}
                      </div>
                      {project.bullets.length ? (
                        <ul className="rf-bullet-list">
                          {project.bullets.map((bullet) => (
                            <li key={bullet}>
                              <span aria-hidden="true" className="rf-bullet-mark" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    {hasAside ? (
                      <aside className="rf-project-aside">
                        {activeImage ? (
                          <figure className="rf-project-media">
                            <div className="rf-project-media-frame">
                              <img alt={activeImage.alt} src={activeImage.url} />
                            </div>
                            {imageCount > 1 ? (
                              <div className="rf-project-media-controls">
                                <button
                                  aria-label={`Show previous image for ${project.title}`}
                                  className="rf-project-media-btn"
                                  onClick={() =>
                                    setProjectImageIndices((prev) => ({
                                      ...prev,
                                      [project.id]: (activeImageIndex - 1 + imageCount) % imageCount,
                                    }))
                                  }
                                  type="button"
                                >
                                  ←
                                </button>
                                <span className="rf-project-media-status">
                                  {activeImageIndex + 1} / {imageCount}
                                </span>
                                <button
                                  aria-label={`Show next image for ${project.title}`}
                                  className="rf-project-media-btn"
                                  onClick={() =>
                                    setProjectImageIndices((prev) => ({
                                      ...prev,
                                      [project.id]: (activeImageIndex + 1) % imageCount,
                                    }))
                                  }
                                  type="button"
                                >
                                  →
                                </button>
                              </div>
                            ) : null}
                          </figure>
                        ) : null}
                        {hasLinks ? (
                          <div className="rf-project-links">
                            {project.liveUrl ? (
                              <a href={project.liveUrl} rel="noreferrer" target="_blank">
                                {project.liveUrlLabel || `View ${project.title}`}
                              </a>
                            ) : null}
                            {project.repoUrl ? (
                              <a className="muted" href={project.repoUrl} rel="noreferrer" target="_blank">
                                {copy.labels.repoLabel}
                              </a>
                            ) : null}
                            {project.caseStudyUrl ? (
                              <Link className="muted" href={project.caseStudyUrl}>
                                {copy.labels.caseStudyLabel}
                              </Link>
                            ) : null}
                          </div>
                        ) : null}
                      </aside>
                    ) : null}
                  </article>
                )
              })
            ) : (
              <p className="rf-empty">
                {projects.length ? `No ${activeTabLabel.toLowerCase()} projects published yet.` : 'No projects yet.'}
              </p>
            )}
          </Reveal>
        </Section>
      ) : null}

      {showSkills ? (
        <Section id="skills">
          <Reveal>
            <SectionHead
              cmd={copy.sections.skills.command}
              lead={copy.sections.skills.description}
              title={copy.sections.skills.title}
            />
          </Reveal>
          <Reveal delay={80}>
            {skills.length ? (
              <div className="rf-skills-grid">
                {skills.map((group) => (
                  <div key={group.title}>
                    <h3 className="rf-label">{group.title}</h3>
                    <p className="rf-skill-items">{group.items.join('  ·  ')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rf-empty">No skills configured yet.</p>
            )}
          </Reveal>
        </Section>
      ) : null}

      {showBlog ? (
        <Section id="notes">
          <Reveal>
            <SectionHead
              cmd={copy.sections.notes.command}
              lead={copy.sections.notes.description}
              title={copy.sections.notes.title}
            />
          </Reveal>
          <div className="rf-stack">
            {notes.length ? (
              notes.map((note, index) => (
                <Reveal delay={index * 70} key={note.id}>
                  <Link className="rf-note-row rf-row-hover" href={note.href}>
                    <div>
                      <div className="rf-exp-meta-row">
                        <span aria-hidden="true" className="rf-row-marker" />
                        <p className="rf-note-meta">{note.meta}</p>
                      </div>
                      <h3 className="rf-note-title">{note.title}</h3>
                      {note.blurb ? <p className="rf-note-blurb">{note.blurb}</p> : null}
                    </div>
                    <div className="rf-note-side">
                      {note.tags.length ? (
                        <div className="rf-note-tags">
                          {note.tags.map((tag) => (
                            <span key={`${note.id}-${tag}`}>{tag}</span>
                          ))}
                        </div>
                      ) : null}
                      <span className="rf-link-arrow">
                        {copy.labels.readArticleLabel} <span className="rf-arrow">→</span>
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))
            ) : (
              <p className="rf-empty">No notes published yet.</p>
            )}
          </div>
        </Section>
      ) : null}

      {showOpenSource ? (
        <Section id="open-source">
          <Reveal>
            <SectionHead
              cmd={copy.sections.openSource.command}
              lead={copy.sections.openSource.description}
              title={copy.sections.openSource.title}
            />
          </Reveal>
          <Reveal delay={80}>
            {openSource.length ? (
              openSource.map((item) => (
                <article className="rf-os-card" key={item.id}>
                  <h3 className="rf-os-title">{item.title}</h3>
                  <p className="rf-os-desc">{item.description}</p>
                  {item.stack.length ? (
                    <div className="rf-tag-row">
                      {item.stack.map((tag) => (
                        <span className="rf-tag" key={`${item.id}-${tag}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="rf-os-actions">
                    <Link className="rf-cta" href="/open-source">
                      <span>{copy.labels.viewAllResourcesLabel}</span>
                    </Link>
                    {item.githubUrl ? (
                      <a className="rf-cta" href={item.githubUrl} rel="noreferrer" target="_blank">
                        <span>{copy.labels.viewGithubLabel}</span>
                      </a>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <p className="rf-empty">No open source resources yet.</p>
            )}
          </Reveal>
        </Section>
      ) : null}

      {showEducation ? (
        <Section id="education">
          <Reveal>
            <SectionHead
              cmd={copy.sections.education.command}
              lead={education[0]?.lead || copy.sections.education.description}
              title={education[0]?.title || copy.sections.education.title}
            />
          </Reveal>
          <div className="rf-stack">
            {education.length ? (
              education.flatMap((entry, entryIndex) => {
                const rows =
                  entry.highlights.length > 0
                    ? entry.highlights.map((highlight, highlightIndex) => {
                        const colon = highlight.indexOf(':')
                        if (colon > 0 && colon < 48) {
                          return {
                            id: `${entry.id}-h-${highlightIndex}`,
                            label: highlight.slice(0, colon).trim(),
                            body: highlight.slice(colon + 1).trim(),
                          }
                        }
                        return {
                          id: `${entry.id}-h-${highlightIndex}`,
                          label: highlightIndex === 0 ? 'background' : `detail ${highlightIndex + 1}`,
                          body: highlight,
                        }
                      })
                    : [
                        {
                          id: entry.id,
                          label: entry.period || 'education',
                          body: [entry.lead, entry.place].filter(Boolean).join(' · ') || entry.title,
                        },
                      ]

                return rows.map((row, rowIndex) => (
                  <Reveal delay={(entryIndex + rowIndex) * 70} key={row.id}>
                    <div className="rf-edu-row">
                      <p className="rf-label">{row.label}</p>
                      <p className="rf-edu-body">{row.body}</p>
                    </div>
                  </Reveal>
                ))
              })
            ) : (
              <p className="rf-empty">No education entries yet.</p>
            )}
          </div>
        </Section>
      ) : null}

      <section className="rf-contact rf-blueprint" id="contact">
        <div className="rf-section-inner">
          <Reveal>
            <SectionHead
              cmd={copy.sections.contact.command}
              lead={copy.sections.contact.description}
              title={copy.sections.contact.title}
            />
          </Reveal>
          <Reveal delay={80}>
            <div className="rf-contact-actions">
              {email ? (
                <a className="rf-cta rf-cta-solid" data-journey-type="contact" href={`mailto:${email}`}>
                  <span>{copy.labels.emailMeLabel}</span>
                </a>
              ) : null}
              <Link className="rf-cta" data-journey-type="contact" href="/reach-by-phone">
                <span>{copy.labels.reachByPhoneLabel}</span>
              </Link>
              {contactLinks.map((link) => (
                <a
                  className="rf-cta"
                  href={link.href}
                  key={`contact-${link.label}-${link.href}`}
                  {...(link.external ? { rel: 'noreferrer', target: '_blank' } : {})}
                >
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </Reveal>
        </div>
        <footer className="rf-footer">
          <div className="rf-footer-inner">
            <p>
              © {currentYear} {name}
            </p>
            <p>
              {promptUser}:~$
            </p>
          </div>
        </footer>
      </section>
    </main>
  )
}
