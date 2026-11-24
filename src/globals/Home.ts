import type { Field, GlobalConfig } from 'payload/types'
import { DEFAULT_HOMEPAGE_COPY } from '../utils/homepageCopy'
import { convertLegacyStringToRichText, sanitizeRichTextContent } from '../utils/richText'

function sectionHeadingFields(
  key: keyof typeof DEFAULT_HOMEPAGE_COPY.sections,
  label: string,
): Field {
  const defaults = DEFAULT_HOMEPAGE_COPY.sections[key]
  return {
    name: key,
    label,
    type: 'group',
    fields: [
      {
        name: 'command',
        label: 'Terminal Command',
        type: 'text',
        defaultValue: defaults.command,
        admin: {
          description: 'Shown as `$ command` above the section title.',
        },
      },
      {
        name: 'title',
        label: 'Section Title',
        type: 'text',
        defaultValue: defaults.title,
      },
    ],
  }
}

function sectionDescriptionField(
  key: keyof typeof DEFAULT_HOMEPAGE_COPY.sections,
  label: string,
): Field {
  return {
    name: key,
    label,
    type: 'textarea',
    defaultValue: DEFAULT_HOMEPAGE_COPY.sections[key].description,
  }
}

function navLabelField(name: keyof typeof DEFAULT_HOMEPAGE_COPY.nav, label: string): Field {
  return {
    name,
    label,
    type: 'text',
    defaultValue: DEFAULT_HOMEPAGE_COPY.nav[name],
  }
}

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Homepage Content',
  admin: {
    group: 'Site',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          description: 'Name, photo, bio, resume, and contact links.',
          fields: [
            {
              name: 'profilePhoto',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Square or portrait headshot for the homepage portrait frame.',
              },
            },
            {
              name: 'resumeFile',
              label: 'Resume PDF',
              type: 'upload',
              relationTo: 'resume-files',
              admin: {
                description: 'Resume PDF for the homepage resume button.',
              },
            },
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'headline',
              type: 'text',
              required: true,
              admin: {
                description: 'Role line under your name (e.g. Full-Stack Software Engineer).',
              },
            },
            {
              name: 'email',
              type: 'email',
              required: true,
            },
            {
              name: 'bio',
              type: 'richText',
              required: true,
              hooks: {
                afterRead: [convertLegacyStringToRichText, sanitizeRichTextContent],
                beforeValidate: [convertLegacyStringToRichText, sanitizeRichTextContent],
              },
              admin: {
                description: 'About section body. Supports rich text.',
              },
            },
            {
              name: 'links',
              label: 'Contact Links',
              type: 'array',
              labels: {
                singular: 'Link',
                plural: 'Links',
              },
              admin: {
                description: 'Shown in the hero contact strip and contact section.',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'icon',
                  label: 'Icon',
                  type: 'select',
                  defaultValue: 'none',
                  options: [
                    { label: 'None', value: 'none' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'GitHub', value: 'github' },
                    { label: 'Email', value: 'email' },
                    { label: 'Phone', value: 'phone' },
                  ],
                },
                {
                  name: 'customIcon',
                  label: 'Custom Icon (Optional)',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Overrides the selected icon when set.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Hero',
          description: 'Announcement banner and first-viewport terminal copy.',
          fields: [
            {
              name: 'announcement',
              label: 'Announcement Banner',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  label: 'Show Announcement',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'message',
                  label: 'Message',
                  type: 'textarea',
                  defaultValue: '',
                },
              ],
            },
            {
              name: 'terminalHero',
              label: 'Terminal Hero',
              type: 'group',
              fields: [
                {
                  name: 'prompt',
                  label: 'Terminal Prompt',
                  type: 'text',
                  defaultValue: 'alexander@portfolio:~$',
                  admin: {
                    description: 'Sticky nav brand and footer prompt.',
                  },
                },
                {
                  name: 'identityCommand',
                  label: 'Identity Command',
                  type: 'text',
                  defaultValue: 'whoami',
                },
                {
                  name: 'statement',
                  label: 'Hero Statement',
                  type: 'textarea',
                  defaultValue: 'I build production-ready web products, AI workflows, and dependable platforms.',
                },
                {
                  name: 'personalNote',
                  label: 'Personal Note',
                  type: 'textarea',
                  defaultValue:
                    'Outside of work, I lift weights, play chess, build personal coding projects, and seek out the occasional adrenaline rush. I have been interested in technology since childhood; some of my earliest experiences with code came from building simple Roblox games around 2009.',
                  admin: {
                    description: 'Shown under About as off_hours. Hidden in Resume mode.',
                  },
                },
                {
                  name: 'aboutCommand',
                  label: 'About Command (legacy)',
                  type: 'text',
                  defaultValue: DEFAULT_HOMEPAGE_COPY.about.command,
                  admin: {
                    description: 'Prefer About tab → Terminal Command. Kept for backward compatibility.',
                    condition: () => false,
                  },
                },
                {
                  name: 'projectsLabel',
                  label: 'Projects Button Label',
                  type: 'text',
                  defaultValue: 'view projects',
                },
                {
                  name: 'resumeLabel',
                  label: 'Resume Button Label',
                  type: 'text',
                  defaultValue: 'resume',
                },
                {
                  name: 'contactLabel',
                  label: 'Contact Button Label',
                  type: 'text',
                  defaultValue: 'say hi',
                },
              ],
            },
          ],
        },
        {
          label: 'About',
          description: 'About section heading and fallback body.',
          fields: [
            {
              name: 'aboutSection',
              label: 'About Section',
              type: 'group',
              fields: [
                {
                  name: 'command',
                  label: 'Terminal Command',
                  type: 'text',
                  defaultValue: DEFAULT_HOMEPAGE_COPY.about.command,
                },
                {
                  name: 'title',
                  label: 'Title',
                  type: 'text',
                  defaultValue: DEFAULT_HOMEPAGE_COPY.about.title,
                },
                {
                  name: 'lead',
                  label: 'Lead',
                  type: 'textarea',
                  defaultValue: DEFAULT_HOMEPAGE_COPY.about.lead,
                },
                {
                  name: 'bodyFallback',
                  label: 'Fallback Body',
                  type: 'textarea',
                  defaultValue: DEFAULT_HOMEPAGE_COPY.about.bodyFallback,
                  admin: {
                    description: 'Used only when the Identity bio field is empty.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Sections',
          description: 'Command, title, and lead copy for each homepage section.',
          fields: [
            {
              name: 'sectionHeadings',
              label: 'Section Headings',
              type: 'group',
              admin: {
                description: 'Terminal command + title for each section.',
              },
              fields: [
                sectionHeadingFields('projects', 'Projects'),
                sectionHeadingFields('skills', 'Skills'),
                sectionHeadingFields('openSource', 'Open Source'),
                sectionHeadingFields('experience', 'Experience'),
                sectionHeadingFields('education', 'Education'),
                sectionHeadingFields('notes', 'Notes'),
                sectionHeadingFields('contact', 'Contact'),
              ],
            },
            {
              name: 'sectionDescriptions',
              label: 'Section Descriptions',
              type: 'group',
              admin: {
                description: 'Short lead paragraph under each section title.',
              },
              fields: [
                sectionDescriptionField('projects', 'Projects'),
                sectionDescriptionField('skills', 'Skills'),
                sectionDescriptionField('openSource', 'Open Source'),
                sectionDescriptionField('experience', 'Experience'),
                sectionDescriptionField('education', 'Education'),
                {
                  name: 'blog',
                  label: 'Notes / Blog',
                  type: 'textarea',
                  defaultValue: DEFAULT_HOMEPAGE_COPY.sections.notes.description,
                },
                sectionDescriptionField('contact', 'Contact'),
              ],
            },
            {
              name: 'openSourceSubtitle',
              label: 'Open Source Subtitle (legacy)',
              type: 'textarea',
              defaultValue: DEFAULT_HOMEPAGE_COPY.sections.openSource.description,
              admin: {
                description: 'Fallback if Open Source description above is empty.',
                condition: () => false,
              },
            },
          ],
        },
        {
          label: 'Navigation & Labels',
          description: 'Nav items, project tabs, and shared button labels.',
          fields: [
            {
              name: 'navLabels',
              label: 'Navigation Labels',
              type: 'group',
              fields: [
                navLabelField('about', 'About'),
                navLabelField('projects', 'Projects'),
                navLabelField('skills', 'Skills'),
                navLabelField('openSource', 'Open Source'),
                navLabelField('experience', 'Experience'),
                navLabelField('education', 'Education'),
                navLabelField('notes', 'Notes'),
                navLabelField('contact', 'Contact'),
              ],
            },
            {
              name: 'uiLabels',
              label: 'UI Labels',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'announcementPrefix',
                      label: 'Announcement Prefix',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.announcementPrefix,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'portraitCaption',
                      label: 'Portrait Caption',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.portraitCaption,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'offHoursLabel',
                      label: 'Off Hours Label',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.offHoursLabel,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'recruiterLinkLabel',
                      label: 'Recruiter Link',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.recruiterLinkLabel,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'enableResumeModeLabel',
                      label: 'Enable Resume Mode',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.enableResumeModeLabel,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'disableResumeModeLabel',
                      label: 'Disable Resume Mode',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.disableResumeModeLabel,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'resumeModeBanner',
                  label: 'Resume Mode Banner',
                  type: 'textarea',
                  defaultValue: DEFAULT_HOMEPAGE_COPY.labels.resumeModeBanner,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'viewResumeLabel',
                      label: 'View Resume',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.viewResumeLabel,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'downloadPdfLabel',
                      label: 'Download PDF',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.downloadPdfLabel,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'menuOpenLabel',
                      label: 'Menu Open',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.menuOpenLabel,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'menuCloseLabel',
                      label: 'Menu Close',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.menuCloseLabel,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'repoLabel',
                      label: 'Repo Link',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.repoLabel,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'caseStudyLabel',
                      label: 'Case Study Link',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.caseStudyLabel,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'readArticleLabel',
                      label: 'Read Article Link',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.readArticleLabel,
                      admin: { width: '33%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'viewAllResourcesLabel',
                      label: 'View All Resources',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.viewAllResourcesLabel,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'viewGithubLabel',
                      label: 'View GitHub',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.viewGithubLabel,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'emailMeLabel',
                      label: 'Email Me',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.emailMeLabel,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'reachByPhoneLabel',
                      label: 'Reach By Phone',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.reachByPhoneLabel,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'projectTabAll',
                      label: 'Tab: All',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.projectTabAll,
                      admin: { width: '20%' },
                    },
                    {
                      name: 'projectTabFrontend',
                      label: 'Tab: Frontend',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.projectTabFrontend,
                      admin: { width: '20%' },
                    },
                    {
                      name: 'projectTabBackend',
                      label: 'Tab: Backend',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.projectTabBackend,
                      admin: { width: '20%' },
                    },
                    {
                      name: 'projectTabAi',
                      label: 'Tab: AI',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.projectTabAi,
                      admin: { width: '20%' },
                    },
                    {
                      name: 'projectTabInfra',
                      label: 'Tab: Infra',
                      type: 'text',
                      defaultValue: DEFAULT_HOMEPAGE_COPY.labels.projectTabInfra,
                      admin: { width: '20%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Visibility',
          description: 'Show or hide homepage sections, including resume mode.',
          fields: [
            {
              name: 'homepageLayout',
              label: 'Homepage Layout',
              type: 'select',
              defaultValue: 'softwareEngineering',
              options: [
                {
                  label: 'Software Engineering Narrative',
                  value: 'softwareEngineering',
                },
                {
                  label: 'Classic Portfolio',
                  value: 'classic',
                },
              ],
              admin: {
                description:
                  'Current homepage order: About → Experience → Projects → Skills → Notes → Open Source → Education → Contact.',
              },
            },
            {
              name: 'sectionVisibility',
              label: 'Section Visibility',
              type: 'group',
              fields: [
                { name: 'projects', label: 'Show Projects', type: 'checkbox', defaultValue: true },
                { name: 'skills', label: 'Show Skills', type: 'checkbox', defaultValue: true },
                { name: 'openSource', label: 'Show Open Source', type: 'checkbox', defaultValue: true },
                { name: 'nowPreview', label: 'Show Now Preview', type: 'checkbox', defaultValue: true },
                { name: 'githubSnapshot', label: 'Show GitHub Snapshot', type: 'checkbox', defaultValue: true },
                { name: 'experience', label: 'Show Experience', type: 'checkbox', defaultValue: true },
                { name: 'education', label: 'Show Education', type: 'checkbox', defaultValue: true },
                { name: 'blog', label: 'Show Blog / Notes', type: 'checkbox', defaultValue: true },
              ],
              admin: {
                description: 'Turn homepage sections on/off without code changes.',
              },
            },
            {
              name: 'resumeSectionVisibility',
              label: 'Resume Mode Visibility',
              type: 'group',
              fields: [
                { name: 'projects', label: 'Show Projects', type: 'checkbox', defaultValue: true },
                { name: 'skills', label: 'Show Skills', type: 'checkbox', defaultValue: true },
                { name: 'openSource', label: 'Show Open Source', type: 'checkbox', defaultValue: false },
                { name: 'nowPreview', label: 'Show Now Preview', type: 'checkbox', defaultValue: false },
                { name: 'githubSnapshot', label: 'Show GitHub Snapshot', type: 'checkbox', defaultValue: false },
                { name: 'experience', label: 'Show Experience', type: 'checkbox', defaultValue: true },
                { name: 'education', label: 'Show Education', type: 'checkbox', defaultValue: true },
                { name: 'blog', label: 'Show Blog / Notes', type: 'checkbox', defaultValue: false },
              ],
              admin: {
                description: 'Controls sections when visiting ?mode=resume or ?view=resume.',
              },
            },
          ],
        },
        {
          label: 'Extras',
          description: 'Optional blocks used by other pages or future homepage modules.',
          fields: [
            {
              name: 'githubSnapshot',
              label: 'GitHub Snapshot',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  label: 'Enabled',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'GitHub Snapshot',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue: 'Public coding activity and open-source momentum from my current work.',
                },
                {
                  name: 'username',
                  label: 'GitHub Username',
                  type: 'text',
                  admin: {
                    description: 'If empty, username is inferred from your GitHub profile link.',
                  },
                },
                {
                  name: 'featuredRepos',
                  label: 'Featured Repositories',
                  type: 'array',
                  fields: [
                    {
                      name: 'repository',
                      label: 'Repository',
                      type: 'text',
                      required: true,
                      admin: {
                        description: 'Use "owner/name" or just "name".',
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'blogCta',
              label: 'Blog Digest + RSS CTA',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  label: 'Show Blog CTA',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Stay in the Loop',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue:
                    'Get new engineering notes when they ship. Subscribe to the digest or follow the RSS feed for direct updates.',
                },
                {
                  name: 'digestUrl',
                  label: 'Digest URL',
                  type: 'text',
                  admin: {
                    description: 'Optional subscription URL (Substack, ConvertKit, Beehiiv, etc.).',
                  },
                },
                {
                  name: 'digestLabel',
                  label: 'Digest Button Label',
                  type: 'text',
                  defaultValue: 'Join Digest',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
