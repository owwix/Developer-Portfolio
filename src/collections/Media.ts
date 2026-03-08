import path from 'path'
import type { CollectionConfig } from 'payload/types'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Asset',
    plural: 'Assets',
  },
  admin: {
    group: 'Publishing',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'src/media'),
    staticURL: '/media',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'avatar',
        width: 600,
        height: 600,
        position: 'centre',
      },
    ],
    adminThumbnail: 'avatar',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
