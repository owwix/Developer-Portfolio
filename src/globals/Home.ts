import type { GlobalConfig } from 'payload/types'
import { convertLegacyStringToRichText, sanitizeRichTextContent } from '../utils/richText'

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
      name: 'profilePhoto',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Upload a square or portrait headshot. It will display circle-cropped on the site.',
      },
    },
    {
      name: 'resumeFile',
      label: 'Resume PDF',
      type: 'upload',
      relationTo: 'resume-files',
      admin: {
        description: 'Upload the resume PDF shown as a view/download button on the homepage.',
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
    },
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
          'Choose the homepage section order. Software Engineering Narrative prioritizes experience, featured projects, and engineering notes.',
      },
    },
    {
      name: 'openSourceSubtitle',
      label: 'Open Source Subtitle',
      type: 'textarea',
      defaultValue: 'Reusable templates, starter kits, and developer tools built for real-world use.',
      admin: {
        description: 'Short description shown under the Open Source section title on the homepage.',
      },
    },
    {
      name: 'sectionDescriptions',
      label: 'Homepage Section Descriptions',
      type: 'group',
      fields: [
        {
          name: 'experience',
          label: 'Experience Description',
          type: 'textarea',
          defaultValue:
            'Professional and product-focused engineering work first: roles and applied systems where I owned implementation, reliability, and delivery.',
        },
        {
          name: 'projects',
          label: 'Featured Projects Description',
          type: 'textarea',
          defaultValue:
            'Selected shipped systems with product value up front, including AI-powered workflows, learning tools, and production portfolio infrastructure.',
        },
        {
          name: 'blog',
          label: 'Engineering Notes Description',
          type: 'textarea',
          defaultValue:
            'Technical writing that documents architecture decisions, tradeoffs, deployment lessons, and build logs from systems I ship.',
        },
        {
          name: 'skills',
          label: 'Skills Description',
          type: 'textarea',
          defaultValue: 'Technologies I use to support the product, AI, platform, and delivery work above.',
        },
        {
          name: 'openSource',
          label: 'Open Source Description',
          type: 'textarea',
          defaultValue: 'Reusable templates, starter kits, and developer tools built for real-world use.',
          admin: {
            description: 'Overrides Open Source Subtitle when filled.',
          },
        },
        {
          name: 'education',
          label: 'Education Description',
          type: 'textarea',
          defaultValue: 'Academic background and learning milestones that support the engineering work above.',
        },
        {
          name: 'contact',
          label: 'Contact Description',
          type: 'textarea',
          defaultValue: 'For software engineering roles, product engineering work, or technical discussions, start here.',
        },
      ],
      admin: {
        description: 'Edit the short intro copy shown beneath each homepage section heading.',
      },
    },
    {
      name: 'sectionVisibility',
      label: 'Section Visibility',
      type: 'group',
      fields: [
        {
          name: 'projects',
          label: 'Show Projects',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'skills',
          label: 'Show Skills',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'openSource',
          label: 'Show Open Source',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'nowPreview',
          label: 'Show Now Preview',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'githubSnapshot',
          label: 'Show GitHub Snapshot',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'trustBlock',
          label: 'Show Trust Block',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'experience',
          label: 'Show Experience',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'education',
          label: 'Show Education',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'blog',
          label: 'Show Blog',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
      admin: {
        description: 'Turn homepage sections on/off without code changes.',
      },
    },
    {
      name: 'resumeSectionVisibility',
      label: 'Resume Section Visibility',
      type: 'group',
      fields: [
        {
          name: 'projects',
          label: 'Show Projects',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'skills',
          label: 'Show Skills',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'openSource',
          label: 'Show Open Source',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'nowPreview',
          label: 'Show Now Preview',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'githubSnapshot',
          label: 'Show GitHub Snapshot',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'trustBlock',
          label: 'Show Trust Block',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'experience',
          label: 'Show Experience',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'education',
          label: 'Show Education',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'blog',
          label: 'Show Blog',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
      admin: {
        description: 'Controls sections when visiting resume mode via ?mode=resume or ?view=resume.',
      },
    },
    {
      name: 'githubSnapshot',
      label: 'GitHub Snapshot',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          label: 'Show GitHub Snapshot',
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
                description: 'Use "owner/name" or just "name" (uses the username above).',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'trustBlock',
      label: 'Trust Block',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          label: 'Show Trust Block',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Delivery Signals',
        },
        {
          name: 'description',
          type: 'textarea',
          defaultValue:
            'I treat product delivery like an engineering system: predictable deploys, clear ownership, and maintainable architecture decisions.',
        },
        {
          name: 'items',
          label: 'Signals',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              required: true,
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
    {
      name: 'bio',
      type: 'richText',
      required: true,
      hooks: {
        afterRead: [convertLegacyStringToRichText, sanitizeRichTextContent],
        beforeValidate: [convertLegacyStringToRichText, sanitizeRichTextContent],
      },
      admin: {
        description: 'Supports rich text for longer bio content.',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'links',
      type: 'array',
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
          admin: {
            description: 'Optional icon shown in the link pill.',
          },
        },
        {
          name: 'customIcon',
          label: 'Custom Icon (Optional)',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'If set, this image overrides the selected icon.',
          },
        },
      ],
    },
  ],
}
