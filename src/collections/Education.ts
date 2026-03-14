import type { CollectionConfig } from 'payload/types'
import { setDefaultDisplayOrder } from '../utils/order'
import { convertLegacyStringToRichText, sanitizeRichTextContent } from '../utils/richText'

export const Education: CollectionConfig = {
  slug: 'education',
  labels: {
    singular: 'Education Entry',
    plural: 'Education',
  },
  admin: {
    useAsTitle: 'degree',
    defaultColumns: ['degree', 'institution', 'displayOrder', 'startDate', 'current'],
    group: 'Portfolio',
  },
  defaultSort: 'displayOrder',
  hooks: {
    beforeValidate: [setDefaultDisplayOrder('education')],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'degree',
      type: 'text',
      required: true,
    },
    {
      name: 'fieldOfStudy',
      label: 'Field of Study',
      type: 'text',
    },
    {
      name: 'institution',
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
      hooks: {
        afterRead: [convertLegacyStringToRichText, sanitizeRichTextContent],
        beforeValidate: [convertLegacyStringToRichText, sanitizeRichTextContent],
      },
      admin: {
        description: 'Optional summary shown under the degree and institution.',
      },
    },
    {
      name: 'highlights',
      type: 'array',
      fields: [
        {
          name: 'highlight',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
