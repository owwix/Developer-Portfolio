import type { CollectionConfig } from 'payload/types'
import { setDefaultDisplayOrder } from '../utils/order'
import { convertLegacyStringToRichText, sanitizeRichTextContent } from '../utils/richText'

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: {
    singular: 'Note',
    plural: 'Notes',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'displayOrder', '_status', 'isComingSoon', 'publishedDate', 'updatedAt'],
    group: 'Publishing',
  },
  defaultSort: 'displayOrder',
  hooks: {
    beforeValidate: [setDefaultDisplayOrder('blog-posts')],
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
        description: 'Lower numbers appear first in blog lists.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Used for blog URLs.',
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            if (typeof value === 'string' && value.trim().length > 0) {
              return toSlug(value)
            }
            const fromTitle = typeof siblingData?.title === 'string' ? siblingData.title : ''
            return toSlug(fromTitle)
          },
        ],
      },
    },
    {
      name: 'coverImage',
      label: 'Cover Image',
      type: 'upload',
      relationTo: 'media',
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
        description: 'Article summary / lead paragraph. Supports rich text.',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Main body of your post.',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'difficulty',
      type: 'select',
      defaultValue: 'Intermediate',
      options: [
        { label: 'Beginner', value: 'Beginner' },
        { label: 'Intermediate', value: 'Intermediate' },
        { label: 'Advanced', value: 'Advanced' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'prerequisites',
      type: 'array',
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Optional checklist shown before the article body.',
      },
    },
    {
      name: 'seriesTitle',
      label: 'Series',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Optional series name (for multi-part posts).',
      },
    },
    {
      name: 'seriesOrder',
      label: 'Series Order',
      type: 'number',
      min: 1,
      admin: {
        position: 'sidebar',
        description: 'Part number inside the series.',
        condition: (_, siblingData) => Boolean(String(siblingData?.seriesTitle || '').trim()),
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'isComingSoon',
      label: 'Show as Coming Soon',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'If enabled, this post appears in blog lists as "Coming Soon" and is not publicly readable yet.',
        position: 'sidebar',
      },
    },
  ],
}
