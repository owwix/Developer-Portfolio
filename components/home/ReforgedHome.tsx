'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Reveal from './Reveal'

const NAV = [
  { label: 'about', href: '#about' },
  { label: 'experience', href: '#experience' },
  { label: 'projects', href: '#projects' },
  { label: 'notes', href: '#notes' },
  { label: 'skills', href: '#skills' },
  { label: 'open source', href: '#open-source' },
  { label: 'contact', href: '#contact' },
] as const

const PROJECT_TABS = ['All', 'Frontend', 'Backend', 'AI', 'Infra'] as const
type ProjectTab = (typeof PROJECT_TABS)[number]

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

export type ReforgedProject = {
  id: string
  title: string
  focusAreas: string[]
  bullets: string[]
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
  founderLine?: string
  announcementEnabled?: boolean
  announcementMessage: string
  avatarAlt: string
  avatarUrl: string
  terminalPrompt: string
  identityCommand: string
  aboutCommand: string
  heroStatement: string
  aboutTitle?: string
  aboutLead?: string
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
  projectsDescription?: string
  skills: ReforgedSkillGroup[]
  skillsDescription?: string
  experiences: ReforgedExperience[]
  experienceDescription?: string
  education: ReforgedEducation[]
  educationDescription?: string
  notes: ReforgedNote[]
  notesDescription?: string
  openSource: ReforgedOpenSource[]
  openSourceDescription?: string
  contactDescription?: string
  contactLinks: ReforgedContactItem[]
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

function focusMatchesTab(areas: string[], tab: ProjectTab): boolean {
  if (tab === 'All') return true
  const needle = tab.toLowerCase()
  return areas.some((area) => area === needle || area.includes(needle))
}

export default function ReforgedHome(props: ReforgedHomeProps) {
  const {
    name,
    headline,
    founderLine = 'CEO & Founder of Turnkeeper',
    announcementEnabled = true,
    announcementMessage,
    avatarAlt,
    avatarUrl,
    terminalPrompt,
    identityCommand,
    aboutCommand,
    heroStatement,
    aboutTitle = 'Systems built to hold up in production.',
    aboutLead,
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
    projectsDescription,
    skills,
    skillsDescription,
    experiences,
    experienceDescription,
    education,
    educationDescription,
    notes,
    notesDescription,
    openSource,
    openSourceDescription,
    contactDescription,
    contactLinks,
    showProjects = true,
    showSkills = true,
    showOpenSource = true,
    showExperience = true,
    showEducation = true,
    showBlog = true,
    currentYear,
  } = props

  const [menuOpen, setMenuOpen] = useState(false)
  const [tab, setTab] = useState<ProjectTab>('All')
  const [activeId, setActiveId] = useState('')

  const promptUser = terminalPrompt.replace(/:~\$\s*$/, '') || 'alexander@portfolio'

  useEffect(() => {
    const ids = NAV.map((n) => n.href.slice(1))
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

  const aboutLeadText =
    aboutLead || 'Full-stack software engineer focused on building modern web applications and developer-friendly systems.'

  return (
    <main className="rf-root" id="top">
      <header className="rf-nav">
        <div className="rf-nav-inner">
          <a className="rf-nav-brand" href="#top">
            <span className="rf-nav-brand-user">{promptUser}</span>
            <span className="rf-nav-brand-suffix">:~$</span>
          </a>
          <nav aria-label="Portfolio sections" className="rf-nav-links">
            {NAV.map((item) => (
              <a
                className={`rf-nav-link${activeId === item.href.slice(1) ? ' rf-nav-link-active' : ''}`}
                href={item.href}
                key={item.href}
                onClick={() => setActiveId(item.href.slice(1))}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <button
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            className="rf-nav-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? '[ close ]' : '[ menu ]'}
          </button>
        </div>
        <nav aria-label="Mobile portfolio sections" className={`rf-nav-mobile${menuOpen ? ' is-open' : ''}`}>
          <div className="rf-nav-mobile-grid">
            {NAV.map((item) => (
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
              <span className="rf-announce-label">site update · </span>
              {announcementMessage}
            </p>
          ) : null}

          <div className="rf-hero-main">
            <div className="rf-hero-copy">
              <p className="rf-cmd-line">$ {identityCommand}</p>
              <h1 className="rf-hero-name">{name}</h1>
              <p className="rf-hero-role">
                {headline} <span className="rf-hero-role-sep">·</span> {founderLine}
              </p>
              <p className="rf-hero-statement">{heroStatement}</p>
              <div className="rf-cta-row">
                <a className="rf-cta rf-cta-solid" href="#projects">
                  <span>{projectsLabel}</span>
                </a>
                {resumeIsExternal ? (
                  <a className="rf-cta" data-journey-type="resume-open" href={resumeHref} rel="noreferrer" target="_blank">
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
              <figcaption>alexander.okonkwo</figcaption>
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
          <SectionHead cmd={aboutCommand} lead={aboutLeadText} title={aboutTitle} />
        </Reveal>
        <Reveal delay={80}>
          <div className="rf-about-grid">
            <div>
              {aboutBodyHtml ? (
                <div className="rf-about-body" dangerouslySetInnerHTML={{ __html: aboutBodyHtml }} />
              ) : (
                <p className="rf-about-body">
                  I work across the entire stack using React, Next.js, TypeScript, Node.js, and PostgreSQL, designing
                  scalable platforms from frontend interfaces to backend services and cloud infrastructure.
                </p>
              )}
            </div>
            <div>
              {!isResumeMode && personalNote ? (
                <>
                  <p className="rf-label">off_hours</p>
                  <p className="rf-off-hours">{personalNote}</p>
                </>
              ) : null}

              {isResumeMode ? (
                <div className="rf-resume-banner" role="status">
                  <p>Resume mode is enabled: streamlined for recruiters and quick portfolio review.</p>
                  <div className="rf-resume-actions">
                    <Link href="/">Disable Resume Mode</Link>
                    {resumeUrl ? (
                      <>
                        <a data-journey-type="resume-open" href={resumeUrl} rel="noreferrer" target="_blank">
                          View Resume
                        </a>
                        <a
                          data-journey-type="resume-download"
                          download={resumeFileName || 'resume.pdf'}
                          href={resumeUrl}
                        >
                          Download PDF
                        </a>
                      </>
                    ) : null}
                  </div>
                </div>
              ) : (
                <Link className="rf-inline-link" href="/?mode=resume">
                  Recruiter? Open streamlined view →
                </Link>
              )}
            </div>
          </div>
        </Reveal>
      </Section>

      {showProjects ? (
        <Section id="projects">
          <Reveal>
            <SectionHead
              cmd="featured projects"
              lead={projectsDescription || 'Shipped systems, from product strategy through infrastructure and public developer tooling.'}
              title="Work I own end to end."
            />
          </Reveal>
          <Reveal delay={60}>
            <div className="rf-tabs" role="tablist" aria-label="Project focus areas">
              {PROJECT_TABS.map((item) => (
                <button
                  aria-selected={tab === item}
                  className={`rf-tab${tab === item ? ' is-active' : ''}`}
                  key={item}
                  onClick={() => setTab(item)}
                  role="tab"
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            {filteredProjects.length ? (
              filteredProjects.map((project, index) => (
                <article className="rf-project" key={project.id}>
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
                  <div className="rf-project-links">
                    {project.liveUrl ? (
                      <a href={project.liveUrl} rel="noreferrer" target="_blank">
                        {project.liveUrlLabel || `View ${project.title}`}
                      </a>
                    ) : null}
                    {project.repoUrl ? (
                      <a className="muted" href={project.repoUrl} rel="noreferrer" target="_blank">
                        Repo
                      </a>
                    ) : null}
                    {project.caseStudyUrl ? (
                      <Link className="muted" href={project.caseStudyUrl}>
                        Case study
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <p className="rf-empty">
                {projects.length ? `No ${tab.toLowerCase()} projects published yet.` : 'No projects yet.'}
              </p>
            )}
          </Reveal>
        </Section>
      ) : null}

      {showSkills ? (
        <Section id="skills">
          <Reveal>
            <SectionHead
              cmd="skills --version"
              lead={skillsDescription || 'Tools I use daily to take a product from interface to infrastructure.'}
              title="The stack I reach for."
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

      {showOpenSource ? (
        <Section id="open-source">
          <Reveal>
            <SectionHead
              cmd="open source --ls"
              lead={openSourceDescription || 'Public starting points, documented and production-ready.'}
              title="Templates other engineers can ship on."
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
                      <span>View All Resources</span>
                    </Link>
                    {item.githubUrl ? (
                      <a className="rf-cta" href={item.githubUrl} rel="noreferrer" target="_blank">
                        <span>View GitHub</span>
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

      {showExperience ? (
        <Section id="experience">
          <Reveal>
            <SectionHead
              cmd="experience --log"
              lead={experienceDescription || 'Founding work, platform engineering, and university systems.'}
              title="Where I have been shipping."
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

      {showEducation ? (
        <Section id="education">
          <Reveal>
            <SectionHead
              cmd="education --cat"
              lead={
                education[0]?.lead ||
                educationDescription ||
                'California State Polytechnic University, Pomona · Alumni Class of 26'
              }
              title={education[0]?.title || 'Computer Science, Cal Poly Pomona.'}
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

      {showBlog ? (
        <Section id="notes">
          <Reveal>
            <SectionHead
              cmd="engineering notes --ls"
              lead={
                notesDescription ||
                'Technical writing that documents architecture decisions, tradeoffs, deployment lessons, and build logs from systems I ship.'
              }
              title="Build logs and tradeoffs, written down."
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
                        Read article <span className="rf-arrow">→</span>
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

      <section className="rf-contact rf-blueprint" id="contact">
        <div className="rf-section-inner">
          <Reveal>
            <SectionHead
              cmd="contact --say-hi"
              lead={
                contactDescription ||
                'For software engineering roles, product engineering work, or technical discussions, start here.'
              }
              title="Let's talk about what you're building."
            />
          </Reveal>
          <Reveal delay={80}>
            <div className="rf-contact-actions">
              {email ? (
                <a className="rf-cta rf-cta-solid" data-journey-type="contact" href={`mailto:${email}`}>
                  <span>Email Me</span>
                </a>
              ) : null}
              <Link className="rf-cta" data-journey-type="contact" href="/reach-by-phone">
                <span>Reach Me by Phone</span>
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
