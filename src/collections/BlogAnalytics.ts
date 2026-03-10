import type { CollectionConfig } from 'payload/types'

export const BlogAnalytics: CollectionConfig = {
  slug: 'blog-analytics',
  labels: {
    singular: 'Blog Metric',
    plural: 'Blog Metrics',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'views', 'avgReadDepth', 'dropOffRate', 'updatedAt'],
    group: 'Publishing',
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'avgReadDepth',
      label: 'Average Read Depth (%)',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 100,
    },
    {
      name: 'depthSamples',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'dropOffs',
      label: 'Drop-offs',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'dropOffRate',
      label: 'Drop-off Rate (%)',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 100,
    },
    {
      name: 'lastViewedAt',
      type: 'date',
    },
    {
      name: 'lastEventType',
      type: 'select',
      options: [
        { label: 'View', value: 'view' },
        { label: 'Read Depth', value: 'read-depth' },
        { label: 'Drop-off', value: 'drop-off' },
      ],
    },
  ],
}
