export type HomepageNavLabels = {
  about: string
  projects: string
  skills: string
  openSource: string
  experience: string
  education: string
  notes: string
  contact: string
}

export type HomepageSectionChrome = {
  command: string
  title: string
  description: string
}

export type HomepageUiLabels = {
  announcementPrefix: string
  portraitCaption: string
  offHoursLabel: string
  recruiterLinkLabel: string
  enableResumeModeLabel: string
  resumeModeBanner: string
  disableResumeModeLabel: string
  viewResumeLabel: string
  downloadPdfLabel: string
  menuOpenLabel: string
  menuCloseLabel: string
  repoLabel: string
  caseStudyLabel: string
  readArticleLabel: string
  viewAllResourcesLabel: string
  viewGithubLabel: string
  emailMeLabel: string
  reachByPhoneLabel: string
  projectTabAll: string
  projectTabFrontend: string
  projectTabBackend: string
  projectTabAi: string
  projectTabInfra: string
}

export type HomepageCopy = {
  nav: HomepageNavLabels
  about: {
    command: string
    title: string
    lead: string
    bodyFallback: string
  }
  sections: {
    projects: HomepageSectionChrome
    skills: HomepageSectionChrome
    openSource: HomepageSectionChrome
    experience: HomepageSectionChrome
    education: HomepageSectionChrome
    notes: HomepageSectionChrome
    contact: HomepageSectionChrome
  }
  labels: HomepageUiLabels
}

export const DEFAULT_HOMEPAGE_COPY: HomepageCopy = {
  nav: {
    about: 'about',
    projects: 'projects',
    skills: 'skills',
    openSource: 'open source',
    experience: 'experience',
    education: 'education',
    notes: 'notes',
    contact: 'contact',
  },
  about: {
    command: 'cat about.txt',
    title: 'Systems built to hold up in production.',
    lead: 'Full-stack software engineer focused on building modern web applications and developer-friendly systems.',
    bodyFallback:
      'I work across the entire stack using React, Next.js, TypeScript, Node.js, and PostgreSQL, designing scalable platforms from frontend interfaces to backend services and cloud infrastructure.',
  },
  sections: {
    projects: {
      command: 'featured projects',
      title: 'Work I own end to end.',
      description: 'Shipped systems, from product strategy through infrastructure and public developer tooling.',
    },
    skills: {
      command: 'skills --version',
      title: 'The stack I reach for.',
      description: 'Tools I use daily to take a product from interface to infrastructure.',
    },
    openSource: {
      command: 'open source --ls',
      title: 'Templates other engineers can ship on.',
      description: 'Public starting points, documented and production-ready.',
    },
    experience: {
      command: 'experience --log',
      title: 'Where I have been shipping.',
      description: 'Founding work, platform engineering, university systems, and chess coaching.',
    },
    education: {
      command: 'education --cat',
      title: 'Computer Science, Cal Poly Pomona.',
      description: 'California State Polytechnic University, Pomona · Alumni Class of 26',
    },
    notes: {
      command: 'engineering notes --ls',
      title: 'Build logs and tradeoffs, written down.',
      description:
        'Technical writing that documents architecture decisions, tradeoffs, deployment lessons, and build logs from systems I ship.',
    },
    contact: {
      command: 'contact --say-hi',
      title: "Let's talk about what you're building.",
      description: 'For software engineering roles, product engineering work, or technical discussions, start here.',
    },
  },
  labels: {
    announcementPrefix: 'site update · ',
    portraitCaption: 'alexander.okonkwo',
    offHoursLabel: 'off_hours',
    recruiterLinkLabel: 'Recruiter? Open streamlined view →',
    enableResumeModeLabel: 'resume mode',
    resumeModeBanner: 'Resume mode is enabled: streamlined for recruiters and quick portfolio review.',
    disableResumeModeLabel: 'Disable Resume Mode',
    viewResumeLabel: 'View Resume',
    downloadPdfLabel: 'Download PDF',
    menuOpenLabel: '[ menu ]',
    menuCloseLabel: '[ close ]',
    repoLabel: 'Repo',
    caseStudyLabel: 'Case study',
    readArticleLabel: 'Read article',
    viewAllResourcesLabel: 'View All Resources',
    viewGithubLabel: 'View GitHub',
    emailMeLabel: 'Email Me',
    reachByPhoneLabel: 'Reach Me by Phone',
    projectTabAll: 'All',
    projectTabFrontend: 'Frontend',
    projectTabBackend: 'Backend',
    projectTabAi: 'AI',
    projectTabInfra: 'Infra',
  },
}

function text(value: unknown, fallback: string): string {
  const next = String(value ?? '').trim()
  return next || fallback
}

type Nested = Record<string, unknown> | null | undefined

function group(value: unknown): Nested {
  if (!value || typeof value !== 'object') return null
  return value as Record<string, unknown>
}

export function resolveHomepageCopy(home: {
  terminalHero?: Nested
  sectionDescriptions?: Nested
  sectionHeadings?: Nested
  navLabels?: Nested
  uiLabels?: Nested
  aboutSection?: Nested
  openSourceSubtitle?: string | null
} | null): HomepageCopy {
  const terminalHero = group(home?.terminalHero)
  const descriptions = group(home?.sectionDescriptions)
  const headings = group(home?.sectionHeadings)
  const nav = group(home?.navLabels)
  const labels = group(home?.uiLabels)
  const about = group(home?.aboutSection)

  const section = (key: keyof HomepageCopy['sections']): HomepageSectionChrome => {
    const heading = group(headings?.[key])
    const defaults = DEFAULT_HOMEPAGE_COPY.sections[key]
    const descriptionKey = key === 'notes' ? 'notes' : key
    const legacyDescriptionKey = key === 'notes' ? 'blog' : key
    const descriptionFallback =
      key === 'openSource'
        ? text(home?.openSourceSubtitle, defaults.description)
        : defaults.description

    return {
      command: text(heading?.command, defaults.command),
      title: text(heading?.title, defaults.title),
      description: text(
        descriptions?.[descriptionKey] ?? descriptions?.[legacyDescriptionKey],
        descriptionFallback,
      ),
    }
  }

  return {
    nav: {
      about: text(nav?.about, DEFAULT_HOMEPAGE_COPY.nav.about),
      projects: text(nav?.projects, DEFAULT_HOMEPAGE_COPY.nav.projects),
      skills: text(nav?.skills, DEFAULT_HOMEPAGE_COPY.nav.skills),
      openSource: text(nav?.openSource, DEFAULT_HOMEPAGE_COPY.nav.openSource),
      experience: text(nav?.experience, DEFAULT_HOMEPAGE_COPY.nav.experience),
      education: text(nav?.education, DEFAULT_HOMEPAGE_COPY.nav.education),
      notes: text(nav?.notes, DEFAULT_HOMEPAGE_COPY.nav.notes),
      contact: text(nav?.contact, DEFAULT_HOMEPAGE_COPY.nav.contact),
    },
    about: {
      command: text(about?.command ?? terminalHero?.aboutCommand, DEFAULT_HOMEPAGE_COPY.about.command),
      title: text(about?.title, DEFAULT_HOMEPAGE_COPY.about.title),
      lead: text(about?.lead, DEFAULT_HOMEPAGE_COPY.about.lead),
      bodyFallback: text(about?.bodyFallback, DEFAULT_HOMEPAGE_COPY.about.bodyFallback),
    },
    sections: {
      projects: section('projects'),
      skills: section('skills'),
      openSource: section('openSource'),
      experience: section('experience'),
      education: section('education'),
      notes: section('notes'),
      contact: section('contact'),
    },
    labels: {
      announcementPrefix: text(labels?.announcementPrefix, DEFAULT_HOMEPAGE_COPY.labels.announcementPrefix),
      portraitCaption: text(labels?.portraitCaption, DEFAULT_HOMEPAGE_COPY.labels.portraitCaption),
      offHoursLabel: text(labels?.offHoursLabel, DEFAULT_HOMEPAGE_COPY.labels.offHoursLabel),
      recruiterLinkLabel: text(labels?.recruiterLinkLabel, DEFAULT_HOMEPAGE_COPY.labels.recruiterLinkLabel),
      enableResumeModeLabel: text(labels?.enableResumeModeLabel, DEFAULT_HOMEPAGE_COPY.labels.enableResumeModeLabel),
      resumeModeBanner: text(labels?.resumeModeBanner, DEFAULT_HOMEPAGE_COPY.labels.resumeModeBanner),
      disableResumeModeLabel: text(labels?.disableResumeModeLabel, DEFAULT_HOMEPAGE_COPY.labels.disableResumeModeLabel),
      viewResumeLabel: text(labels?.viewResumeLabel, DEFAULT_HOMEPAGE_COPY.labels.viewResumeLabel),
      downloadPdfLabel: text(labels?.downloadPdfLabel, DEFAULT_HOMEPAGE_COPY.labels.downloadPdfLabel),
      menuOpenLabel: text(labels?.menuOpenLabel, DEFAULT_HOMEPAGE_COPY.labels.menuOpenLabel),
      menuCloseLabel: text(labels?.menuCloseLabel, DEFAULT_HOMEPAGE_COPY.labels.menuCloseLabel),
      repoLabel: text(labels?.repoLabel, DEFAULT_HOMEPAGE_COPY.labels.repoLabel),
      caseStudyLabel: text(labels?.caseStudyLabel, DEFAULT_HOMEPAGE_COPY.labels.caseStudyLabel),
      readArticleLabel: text(labels?.readArticleLabel, DEFAULT_HOMEPAGE_COPY.labels.readArticleLabel),
      viewAllResourcesLabel: text(labels?.viewAllResourcesLabel, DEFAULT_HOMEPAGE_COPY.labels.viewAllResourcesLabel),
      viewGithubLabel: text(labels?.viewGithubLabel, DEFAULT_HOMEPAGE_COPY.labels.viewGithubLabel),
      emailMeLabel: text(labels?.emailMeLabel, DEFAULT_HOMEPAGE_COPY.labels.emailMeLabel),
      reachByPhoneLabel: text(labels?.reachByPhoneLabel, DEFAULT_HOMEPAGE_COPY.labels.reachByPhoneLabel),
      projectTabAll: text(labels?.projectTabAll, DEFAULT_HOMEPAGE_COPY.labels.projectTabAll),
      projectTabFrontend: text(labels?.projectTabFrontend, DEFAULT_HOMEPAGE_COPY.labels.projectTabFrontend),
      projectTabBackend: text(labels?.projectTabBackend, DEFAULT_HOMEPAGE_COPY.labels.projectTabBackend),
      projectTabAi: text(labels?.projectTabAi, DEFAULT_HOMEPAGE_COPY.labels.projectTabAi),
      projectTabInfra: text(labels?.projectTabInfra, DEFAULT_HOMEPAGE_COPY.labels.projectTabInfra),
    },
  }
}
