import type { CollectionConfig } from 'payload/types'

export const PhoneRequests: CollectionConfig = {
  slug: 'phone-requests',
  labels: {
    singular: 'Inquiry',
    plural: 'Inquiries',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phoneNumber', 'status', 'createdAt'],
    group: 'Site',
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && !req.user) {
          return {
            ...data,
            status: 'pending',
            reviewNotes: undefined,
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
      admin: {
        description: 'Include country code if outside the US.',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: false,
    },
    {
      name: 'company',
      type: 'text',
      required: false,
    },
    {
      name: 'bestTime',
      label: 'Best Time To Call',
      type: 'text',
      required: false,
    },
    {
      name: 'topic',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Accepted',
          value: 'accepted',
        },
        {
          label: 'Declined',
          value: 'declined',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'reviewNotes',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Optional internal notes when accepting or declining.',
      },
    },
  ],
}
