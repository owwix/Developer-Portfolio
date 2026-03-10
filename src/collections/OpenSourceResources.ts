import type { CollectionConfig } from 'payload/types'
import { setDefaultDisplayOrder } from '../utils/order'

export const OpenSourceResources: CollectionConfig = {
  slug: 'open-source-resources',
  labels: {
    singular: 'Open Source Resource',
    plural: 'Open Source',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'displayOrder', 'updatedAt'],
    group: 'Portfolio',
  },
  defaultSort: 'displayOrder',
  hooks: {
    beforeValidate: [setDefaultDisplayOrder('open-source-resources')],
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
        description: 'Lower numbers appear first in Open Source lists.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'CMS Templates',
      options: [
        { label: 'CMS Templates', value: 'CMS Templates' },
        { label: 'Starter Kits', value: 'Starter Kits' },
        { label: 'UI Libraries', value: 'UI Libraries' },
        { label: 'Developer Tools', value: 'Developer Tools' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'In Progress',
      options: [
        { label: 'Released', value: 'Released' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Planned', value: 'Planned' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'marker',
      type: 'text',
      admin: {
        description: 'Optional short label (for example: TPL, KIT, UI).',
        position: 'sidebar',
      },
    },
    {
      name: 'showOnHomepage',
      label: 'Show on homepage',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'techStack',
      label: 'Tech Stack',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'technology',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'githubStars',
      label: 'GitHub Stars',
      type: 'number',
      min: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'githubForks',
      label: 'GitHub Forks',
      type: 'number',
      min: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'links',
      type: 'group',
      fields: [
        {
          name: 'github',
          label: 'GitHub URL',
          type: 'text',
        },
        {
          name: 'template',
          label: 'Template URL',
          type: 'text',
        },
        {
          name: 'docs',
          label: 'Documentation URL',
          type: 'text',
        },
        {
          name: 'demo',
          label: 'Live Demo URL',
          type: 'text',
        },
      ],
    },
  ],
}
