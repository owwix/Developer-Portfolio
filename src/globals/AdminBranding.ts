import type { GlobalConfig } from 'payload/types'
import { siteConfig } from '../utils/siteConfig'

export const AdminBranding: GlobalConfig = {
  slug: 'admin-branding',
  label: 'Admin Branding',
  admin: {
    group: 'Site',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'brandImage',
      label: 'Brand Icon Image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional square icon displayed above login and in the admin nav.',
      },
    },
    {
      name: 'brandMonogram',
      label: 'Brand Monogram',
      type: 'text',
      defaultValue: siteConfig.cmsMonogram,
      admin: {
        description: 'Fallback text icon when no image is set.',
      },
    },
    {
      name: 'loginTitle',
      label: 'Login Title',
      type: 'text',
      defaultValue: siteConfig.cmsTitle,
      required: true,
    },
    {
      name: 'loginSubtitle',
      label: 'Login Subtitle',
      type: 'text',
      defaultValue: siteConfig.cmsSubtitle,
    },
  ],
}
