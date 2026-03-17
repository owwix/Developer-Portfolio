import path from 'path'
import type { CollectionConfig } from 'payload/types'

const RESUME_STATIC_DIR = process.env.PAYLOAD_MEDIA_DIR
  ? path.resolve(process.env.PAYLOAD_MEDIA_DIR)
  : path.resolve(process.cwd(), 'src/media')

const RESUME_STATIC_URL = process.env.PAYLOAD_MEDIA_URL || '/media'

export const ResumeFiles: CollectionConfig = {
  slug: 'resume-files',
  labels: {
    singular: 'Resume File',
    plural: 'Resume Files',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'filename', 'updatedAt'],
    group: 'Publishing',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: RESUME_STATIC_DIR,
    staticURL: RESUME_STATIC_URL,
    mimeTypes: ['application/pdf'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal label for this resume file in the CMS.',
      },
    },
  ],
}
