import type { CollectionConfig } from 'payload/types'
import { setDefaultDisplayOrder } from '../utils/order'
import { convertLegacyStringToRichText, sanitizeRichTextContent } from '../utils/richText'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Project',
    plural: 'Projects',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'displayOrder', 'featured', 'updatedAt'],
    group: 'Portfolio',
  },
  defaultSort: 'displayOrder',
  hooks: {
    beforeValidate: [setDefaultDisplayOrder('projects')],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'displayOrder',
      label: 'Display Order',
      type: 'number',
      min: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first on the frontend.',
      },
    },
    {
      name: 'summary',
      type: 'richText',
      required: true,
      hooks: {
        afterRead: [convertLegacyStringToRichText, sanitizeRichTextContent],
        beforeValidate: [convertLegacyStringToRichText, sanitizeRichTextContent],
      },
      admin: {
        description: 'Project summary / description. Supports rich text.',
      },
    },
    {
      name: 'projectImage',
      label: 'Project Image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
        description: 'Optional project image for frontend card display.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'techStack',
      type: 'array',
      fields: [
        {
          name: 'technology',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'highlights',
      type: 'array',
      fields: [
        {
          name: 'bullet',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'repoUrl',
      type: 'text',
    },
    {
      name: 'caseStudyPost',
      label: 'Case Study (Blog Post)',
      type: 'relationship',
      relationTo: 'blog-posts',
      admin: {
        description: 'Optional internal case study link to a blog post.',
      },
    },
    {
      name: 'caseStudyUrl',
      label: 'Case Study URL (External)',
      type: 'text',
      admin: {
        description: 'Optional external case study URL. Used when no internal case study post is selected.',
      },
    },
    {
      name: 'liveUrl',
      type: 'text',
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
    },
    {
      name: 'endDate',
      type: 'date',
    },
  ],
}
