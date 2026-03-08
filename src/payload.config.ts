import path from 'path'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'
import { buildConfig } from 'payload/config'
import { BlogPosts } from './collections/BlogPosts'
import { Experiences } from './collections/Experiences'
import { Media } from './collections/Media'
import { PhoneRequests } from './collections/PhoneRequests'
import { Projects } from './collections/Projects'
import { Skills } from './collections/Skills'
import { Home } from './globals/Home'

export default buildConfig({
  db: mongooseAdapter({
    url: process.env.MONGODB_URI ?? '',
  }),
  editor: slateEditor({}),
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
  admin: {
    bundler: webpackBundler(),
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
    Media,
    BlogPosts,
    Projects,
    Skills,
    Experiences,
    PhoneRequests,
  ],
  globals: [Home],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
})
