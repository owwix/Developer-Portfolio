import type { CollectionConfig } from 'payload/types'
import { convertLegacyStringToRichText, sanitizeRichTextContent } from '../utils/richText'

export const Experiences: CollectionConfig = {
  slug: 'experiences',
  labels: {
    singular: 'Experience',
    plural: 'Experience',
  },
  admin: {
    useAsTitle: 'role',
    defaultColumns: ['role', 'company', 'startDate', 'current'],
    group: 'Portfolio',
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'role',
      type: 'text',
      required: true,
    },
    {
      name: 'company',
      type: 'text',
      required: true,
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'current',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        condition: (_, siblingData) => !siblingData.current,
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
        description: 'Role summary / experience description. Supports rich text.',
      },
    },
    {
      name: 'achievements',
      type: 'array',
      fields: [
        {
          name: 'achievement',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
