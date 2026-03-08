import path from 'path'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'
import { buildConfig } from 'payload/config'
import AdminIcon from './admin/components/AdminIcon'
import AdminLogo from './admin/components/AdminLogo'
import EditorialDashboard from './admin/components/EditorialDashboard'
import { BlogPosts } from './collections/BlogPosts'
import { Experiences } from './collections/Experiences'
import { Media } from './collections/Media'
import { PhoneRequests } from './collections/PhoneRequests'
import { Projects } from './collections/Projects'
import { Skills } from './collections/Skills'
import { AdminBranding } from './globals/AdminBranding'
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
    css: path.resolve(process.cwd(), 'src/admin/admin.css'),
    meta: {
      titleSuffix: ' · Alexander Okonkwo CMS',
      favicon: '/ao-icon.svg',
      ogImage: '/ao-icon.svg',
    },
    components: {
      beforeDashboard: [EditorialDashboard],
      graphics: {
        Icon: AdminIcon,
        Logo: AdminLogo,
      },
    },
  },
  collections: [
    BlogPosts,
    Media,
    Projects,
    Skills,
    Experiences,
    PhoneRequests,
    {
      slug: 'users',
      labels: {
        singular: 'Editor',
        plural: 'Editors',
      },
      auth: true,
      admin: {
        useAsTitle: 'email',
        group: 'Site',
      },
      fields: [],
    },
  ],
  globals: [Home, AdminBranding],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
})
