import type { CollectionConfig } from 'payload/types'

export const Skills: CollectionConfig = {
  slug: 'skills',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'proficiency'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Frontend', value: 'frontend' },
        { label: 'Backend', value: 'backend' },
        { label: 'DevOps', value: 'devops' },
        { label: 'Database', value: 'database' },
        { label: 'Tooling', value: 'tooling' },
      ],
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
}
