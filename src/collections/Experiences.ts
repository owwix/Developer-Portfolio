import type { CollectionConfig } from 'payload/types'
import { setDefaultDisplayOrder } from '../utils/order'
import { convertLegacyStringToRichText, sanitizeRichTextContent } from '../utils/richText'

export const Experiences: CollectionConfig = {
  slug: 'experiences',
  labels: {
    singular: 'Experience',
    plural: 'Experience',
  },
  admin: {
    useAsTitle: 'role',
    defaultColumns: ['role', 'company', 'displayOrder', 'startDate', 'current'],
    group: 'Portfolio',
  },
  defaultSort: 'displayOrder',
  hooks: {
    beforeValidate: [setDefaultDisplayOrder('experiences')],
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
