import path from 'path'
import type { CollectionConfig } from 'payload/types'

const MEDIA_STATIC_DIR = process.env.PAYLOAD_MEDIA_DIR
  ? path.resolve(process.env.PAYLOAD_MEDIA_DIR)
  : path.resolve(process.cwd(), 'src/media')

const MEDIA_STATIC_URL = process.env.PAYLOAD_MEDIA_URL || '/media'

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
    staticDir: MEDIA_STATIC_DIR,
    staticURL: MEDIA_STATIC_URL,
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
