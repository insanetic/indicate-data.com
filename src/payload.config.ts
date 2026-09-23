import { postgresAdapter } from '@payloadcms/db-postgres'
import { consentPlugin } from '@subneo/payload-consent/server'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Sidebars } from './collections/Sidebars'
import { Users } from './collections/Users'
import { consentSetup } from './consent/setup'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { migrations } from './migrations'
import { SiteSettings } from './globals/SiteSettings/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { de } from 'payload/i18n/de'
import { en } from 'payload/i18n/en'
import { defaultLocale, localeLabels, locales } from './i18n/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
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
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // The schema only ever changes through the files in src/migrations, in every environment.
    // No schema push, so `pnpm dev`, tests and host scripts never alter tables on their own.
    push: false,
    // Production: the image sets PAYLOAD_MIGRATE_ON_START=true, and pending migrations run when
    // the container starts, before the first request is served. Payload only runs these with
    // NODE_ENV=production, so the flag keeps host scripts started with NODE_ENV=production from
    // migrating whatever database they point at.
    // Development: the dev container runs `pnpm payload migrate` before `pnpm dev`; while it is
    // running, `make migrate` applies new files. See deploy/README.md, "Schema changes".
    prodMigrations: process.env.PAYLOAD_MIGRATE_ON_START === 'true' ? migrations : undefined,
  }),
  collections: [Pages, Posts, Media, Categories, Sidebars, Users],
  // Content localisation: German is the primary language, English the second.
  localization: {
    locales: locales.map((code) => ({ code, label: localeLabels[code] })),
    defaultLocale,
    fallback: true,
  },
  // Admin panel UI languages (independent from content localisation).
  i18n: {
    supportedLanguages: { de, en },
    fallbackLanguage: 'de',
  },
  cors: [getServerSideURL()].filter(Boolean),
  globals: [SiteSettings, Header, Footer],
  plugins: [...plugins, consentPlugin(consentSetup)],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
