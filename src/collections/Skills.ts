import type { CollectionConfig } from 'payload/types'

export const Skills: CollectionConfig = {
  slug: 'skills',
  labels: {
    singular: 'Skill Set',
    plural: 'Skills',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    group: 'Portfolio',
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) return data
        if (!data.title || String(data.title).trim().length === 0) {
          const count = Array.isArray(data.skills) ? data.skills.length : 0
          return {
            ...data,
            title: count > 0 ? `Skills (${count})` : 'Technical Skills',
          }
        }
        return data
      },
    ],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Technical Skills',
    },
    {
      name: 'skills',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Add multiple skills and choose a category for each one.',
        disableListColumn: true,
      },
      fields: [
        {
          name: 'category',
          type: 'select',
          required: true,
          options: [
            { label: 'Frontend Development', value: 'frontend-development' },
            { label: 'Backend Development', value: 'backend-development' },
            { label: 'Programming Languages', value: 'programming-languages' },
            { label: 'Databases', value: 'databases' },
            { label: 'Cloud & Deployment', value: 'cloud-deployment' },
            { label: 'Developer Tools', value: 'developer-tools' },
          ],
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'proficiency',
          type: 'number',
          required: true,
          min: 1,
          max: 5,
          admin: {
            description: 'Rate from 1 (beginner) to 5 (expert).',
          },
        },
        {
          name: 'yearsExperience',
          type: 'number',
          min: 0,
        },
      ],
    },
  ],
}
