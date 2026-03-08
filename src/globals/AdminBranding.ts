import type { GlobalConfig } from 'payload/types'

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
      defaultValue: 'AO',
      admin: {
        description: 'Fallback text icon when no image is set.',
      },
    },
    {
      name: 'loginTitle',
      label: 'Login Title',
      type: 'text',
      defaultValue: 'Alexander Okonkwo CMS',
      required: true,
    },
    {
      name: 'loginSubtitle',
      label: 'Login Subtitle',
      type: 'text',
      defaultValue: 'Engineering Journal Control Center',
    },
  ],
}
