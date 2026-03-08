import type { GlobalConfig } from 'payload/types'

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
      name: 'bio',
      type: 'richText',
      required: true,
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
      ],
    },
  ],
}
