import type { GlobalConfig } from 'payload/types'

export const Now: GlobalConfig = {
  slug: 'now',
  label: 'Now Page',
  admin: {
    group: 'Site',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'enabled',
      label: 'Show Now Page',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: 'Current Focus',
    },
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Now',
      required: true,
    },
    {
      name: 'intro',
      type: 'textarea',
      required: true,
      defaultValue:
        'What I am currently building, improving, and learning. This page changes as priorities shift across projects and writing.',
    },
    {
      name: 'updatedAt',
      label: 'Last Updated',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'focusAreas',
      label: 'Focus Areas',
      type: 'array',
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'buildingNow',
      label: 'Building Now',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'Active',
          options: [
            { label: 'Active', value: 'Active' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Planned', value: 'Planned' },
          ],
        },
        {
          name: 'details',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'shippingNext',
      label: 'Shipping Next',
      type: 'array',
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
