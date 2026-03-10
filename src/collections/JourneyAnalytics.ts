import type { CollectionConfig } from 'payload/types'

export const JourneyAnalytics: CollectionConfig = {
  slug: 'journey-analytics',
  labels: {
    singular: 'Journey Metric',
    plural: 'Journey Metrics',
  },
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['sourcePath', 'targetPath', 'journeyType', 'count', 'lastSeenAt'],
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
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'sourcePath',
      type: 'text',
      required: true,
    },
    {
      name: 'targetPath',
      type: 'text',
      required: true,
    },
    {
      name: 'journeyType',
      type: 'text',
      required: true,
    },
    {
      name: 'count',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'lastSeenAt',
      type: 'date',
    },
  ],
}
