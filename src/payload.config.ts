import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { migrations } from './migrations'

import { AssetTypes } from './collections/AssetTypes'
import { Bookings } from './collections/Bookings'
import { Businesses } from './collections/Businesses'
import { Categories } from './collections/Categories'
import { Customers } from './collections/Customers'
import { Events } from './collections/Events'
import { Invoices } from './collections/Invoices'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Quotes } from './collections/Quotes'
import { Regions } from './collections/Regions'
import { Reviews } from './collections/Reviews'
import { ServiceTypes } from './collections/ServiceTypes'
import { Suburbs } from './collections/Suburbs'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    avatar: 'gravatar',
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  // database-adapter-config-start
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URI,
    },
    pushSchema: false,
    prodMigrations: migrations,
  }),
  // database-adapter-config-end
  collections: [
    Pages,
    Posts,
    Projects,
    ServiceTypes,
    AssetTypes,
    Businesses,
    Regions,
    Suburbs,
    Media,
    Categories,
    Users,
    Customers,
    Quotes,
    Bookings,
    Invoices,
    Events,
    Reviews,
  ],
  // Email — Google Workspace SMTP (service@winningtrimming.com.au)
  // Requires SMTP_HOST, SMTP_USER, SMTP_PASSWORD env vars.
  // When not configured, email sending is silently skipped.
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || process.env.SMTP_USER || 'service@winningtrimming.com.au',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: parseInt(process.env.SMTP_PORT || '465') === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        },
      })
    : undefined,
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [...plugins],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
