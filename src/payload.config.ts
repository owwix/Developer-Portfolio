import path from 'path'
import { buildConfig } from 'payload/config'
import { Experiences } from './collections/Experiences'
import { Projects } from './collections/Projects'
import { Skills } from './collections/Skills'
import { Home } from './globals/Home'

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
  admin: {
    user: 'users',
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [],
    },
    Projects,
    Skills,
    Experiences,
  ],
  globals: [Home],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
})
