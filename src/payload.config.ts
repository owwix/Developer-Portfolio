import path from 'path'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'
import { buildConfig } from 'payload/config'
import AdminIcon from './admin/components/AdminIcon'
import AdminLogo from './admin/components/AdminLogo'
import EditorialDashboard from './admin/components/EditorialDashboard'
import { BlogAnalytics } from './collections/BlogAnalytics'
import { BlogPosts } from './collections/BlogPosts'
import { Education } from './collections/Education'
import { Experiences } from './collections/Experiences'
import { JourneyAnalytics } from './collections/JourneyAnalytics'
import { Media } from './collections/Media'
import { PhoneRequests } from './collections/PhoneRequests'
import { OpenSourceResources } from './collections/OpenSourceResources'
import { Projects } from './collections/Projects'
import { Skills } from './collections/Skills'
import { AdminBranding } from './globals/AdminBranding'
import { Home } from './globals/Home'
import { Now } from './globals/Now'
import { siteConfig } from './utils/siteConfig'

export default buildConfig({
  upload: {
    // Keep filenames stable and URL-safe across environments and deploys.
    safeFileNames: /[^a-zA-Z0-9._-]/g,
    preserveExtension: true,
    uriDecodeFileNames: true,
    createParentPath: true,
  },
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
      titleSuffix: ` · ${siteConfig.cmsTitle}`,
      favicon: '/ao-icon.svg',
      ogImage: '/ao-icon.svg',
    },
    components: {
      views: {
        Dashboard: EditorialDashboard,
      },
      graphics: {
        Icon: AdminIcon,
        Logo: AdminLogo,
      },
    },
  },
  collections: [
    BlogPosts,
    BlogAnalytics,
    JourneyAnalytics,
    Media,
    Projects,
    OpenSourceResources,
    Skills,
    Experiences,
    Education,
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
  globals: [Home, Now, AdminBranding],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
})
