# indicate-data.com.demo

Payload CMS 3 website (official website template) on Next.js 16 and PostgreSQL 18, set up as the evaluation project for the CMS selection. No git yet.

## Quick start

```bash
docker compose up            # Postgres (host port 5433) + app in dev mode with hot reload
# or: docker compose up -d postgres && pnpm payload migrate && pnpm dev   (faster on macOS)
```

The app container runs pending migrations from `src/migrations/` before it starts the dev server. Development and production share the same migration files; there is no schema push. A database that was used before this switch needs a one-time baseline first, see [Schema changes](deploy/README.md#schema-changes).

Then open http://localhost:3000/admin, create the first user, and press **Seed your database** on the dashboard to install the Indicate Data site (home page and contact page in German and English, header, footer, site settings, integration logos). The site is at http://localhost:3000 and redirects to `/de` or `/en`.

The seed can also run from the host while the Docker stack is up:

```bash
DATABASE_URL=postgres://payload:payload@localhost:5433/payload \
  ./node_modules/.bin/payload run scripts/seed.ts
```

It updates by slug and never deletes anything. After a host-side seed, save any document in the admin (or restart the app container) so the Next.js caches pick up the new content.

Production: `make ship` builds a site-agnostic image and pushes it to Docker Hub; the server supplies all configuration at runtime (mounted `config/*.env` or environment) and rollout is done with Ansible (guide and image contract in [deploy/README.md](deploy/README.md)). Schema changes need a migration: change the config, `make migration NAME=...`, `make migrate`, commit (details in [deploy/README.md](deploy/README.md#schema-changes)).

Environment names: `SITE_URL` (public origin; the older `NEXT_PUBLIC_SERVER_URL` still works) and `GTM_ID` (Tag Manager container id) are read on the server at request time, never compiled in.
Local smoke test of the image: `docker compose --profile prod up --build app-prod`.

## Sharing the database content

`backups/` holds a `pg_dump` of the local Payload database plus the media uploads, so every developer can run the same content instead of re-seeding and re-editing.

```bash
scripts/db-restore.sh                 # restore the newest backup (replaces your local content), unpack media, restart app
scripts/db-restore.sh 20260916-1322   # restore a specific one
scripts/db-backup.sh                  # make a new backup after content changes, then commit backups/
```

Dumps taken before development switched to migrations still carry the schema push marker; `db-restore.sh` stops and points to the one-time baseline in [deploy/README.md](deploy/README.md#switching-an-existing-dev-database-over-once).

The dump is custom format (`pg_restore`), made from the Docker Postgres 18 container, and contains the admin users of the machine it was taken on (log in with one of those or create a new user via `payload run`). The MCP access key stored in it is encrypted with `PAYLOAD_SECRET` from `.env`; if your secret differs, create a new one in the admin.

## Claude Code via MCP

The official `@payloadcms/plugin-mcp` is wired in `src/plugins/index.ts` and serves `http://localhost:3000/api/mcp` (pages, posts, media, categories, header, footer).

1. In the admin go to **MCP -> API Keys**, create a key, choose what it may do, copy it.
2. Either `export PAYLOAD_MCP_API_KEY=<key>` and use the repo's `.mcp.json`, or run
   `claude mcp add --transport http payload http://localhost:3000/api/mcp --header "Authorization: Bearer <key>"`.
3. Start `claude` in this folder. The Payload skill in `.claude/skills/payload` covers the code side.

## What is in the box

- Collections: pages (block layout builder), posts, media, categories, users. Globals: header, footer.
- Live Preview with mobile/tablet/desktop breakpoints, drafts, versions, scheduled publish (jobs queue).
- Plugins: SEO, redirects, forms, search, nested docs, MCP.
- Frontend: Next.js App Router, Tailwind 4, shadcn-style components, on-demand revalidation, sitemap.

---

# Payload Website Template

This is the official [Payload Website Template](https://github.com/payloadcms/payload/blob/3.x/templates/website). Use it to power websites, blogs, or portfolios from small to enterprise. This repo includes a fully-working backend, enterprise-grade admin panel, and a beautifully designed, production-ready website.

This template is right for you if you are working on:

- A personal or enterprise-grade website, blog, or portfolio
- A content publishing platform with a fully featured publication workflow
- Exploring the capabilities of Payload

Core features:

- [Pre-configured Payload Config](#how-it-works)
- [Authentication](#users-authentication)
- [Access Control](#access-control)
- [Layout Builder](#layout-builder)
- [Draft Preview](#draft-preview)
- [Live Preview](#live-preview)
- [On-demand Revalidation](#on-demand-revalidation)
- [SEO](#seo)
- [Search](#search)
- [Redirects](#redirects)
- [Jobs and Scheduled Publishing](#jobs-and-scheduled-publish)
- [Website](#website)

## Quick Start

To spin up this example locally, follow these steps:

### Clone

If you have not done so already, you need to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

Use the `create-payload-app` CLI to clone this template directly to your machine:

```bash
pnpx create-payload-app my-project -t website
```

### Development

1. First [clone the repo](#clone) if you have not done so already
1. `cd my-project && cp .env.example .env` to copy the example environment variables
1. `pnpm install && pnpm dev` to install dependencies and start the dev server
1. open `http://localhost:3000` to open the app in your browser

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel and unpublished content. See [Access Control](#access-control) for more details.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/3.x/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Posts

  Posts are used to generate blog posts, news articles, or any other type of content that is published over time. All posts are layout builder enabled so you can generate unique layouts for each post using layout-building blocks, see [Layout Builder](#layout-builder) for more details. Posts are also draft-enabled so you can preview them before publishing them to your website, see [Draft Preview](#draft-preview) for more details.

- #### Pages

  All pages are layout builder enabled so you can generate unique layouts for each page using layout-building blocks, see [Layout Builder](#layout-builder) for more details. Pages are also draft-enabled so you can preview them before publishing them to your website, see [Draft Preview](#draft-preview) for more details.

- #### Media

  This is the uploads enabled collection used by pages, posts, and projects to contain media like images, videos, downloads, and other assets. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

- #### Categories

  A taxonomy used to group posts together. Categories can be nested inside of one another, for example "News > Technology". See the official [Payload Nested Docs Plugin](https://payloadcms.com/docs/plugins/nested-docs) for more details.

### Globals

See the [Globals](https://payloadcms.com/docs/configuration/globals) docs for details on how to extend this functionality.

- `Header`

  The data required by the header on your front-end like nav links.

- `Footer`

  Same as above but for the footer of your site.

## Access control

Basic access control is setup to limit access to various content based based on publishing status.

- `users`: Users can access the admin panel and create or edit content.
- `posts`: Everyone can access published posts, but only users can create, update, or delete them.
- `pages`: Everyone can access published pages, but only users can create, update, or delete them.

For more details on how to extend this functionality, see the [Payload Access Control](https://payloadcms.com/docs/access-control/overview#access-control) docs.

## Layout Builder

Create unique page layouts for any type of content using a powerful layout builder. This template comes pre-configured with the following layout building blocks:

- Hero
- Content
- Media
- Call To Action
- Archive

Each block is fully designed and built into the front-end website that comes with this template. See [Website](#website) for more details.

## Lexical editor

A deep editorial experience that allows complete freedom to focus just on writing content without breaking out of the flow with support for Payload blocks, media, links and other features provided out of the box. See [Lexical](https://payloadcms.com/docs/rich-text/overview) docs.

## Draft Preview

All posts and pages are draft-enabled so you can preview them before publishing them to your website. To do this, these collections use [Versions](https://payloadcms.com/docs/configuration/collections#versions) with `drafts` set to `true`. This means that when you create a new post, project, or page, it will be saved as a draft and will not be visible on your website until you publish it. This also means that you can preview your draft before publishing it to your website. To do this, we automatically format a custom URL which redirects to your front-end to securely fetch the draft version of your content.

Since the front-end of this template is statically generated, this also means that pages, posts, and projects will need to be regenerated as changes are made to published documents. To do this, we use an `afterChange` hook to regenerate the front-end when a document has changed and its `_status` is `published`.

For more details on how to extend this functionality, see the official [Draft Preview Example](https://github.com/payloadcms/payload/tree/3.x/examples/draft-preview).

## Live preview

In addition to draft previews you can also enable live preview to view your end resulting page as you're editing content with full support for SSR rendering. See [Live preview docs](https://payloadcms.com/docs/live-preview/overview) for more details.

## On-demand Revalidation

We've added hooks to collections and globals so that all of your pages, posts, footer, or header changes will automatically be updated in the frontend via on-demand revalidation supported by Nextjs.

> Note: if an image has been changed, for example it's been cropped, you will need to republish the page it's used on in order to be able to revalidate the Nextjs image cache.

## SEO

This template comes pre-configured with the official [Payload SEO Plugin](https://payloadcms.com/docs/plugins/seo) for complete SEO control from the admin panel. All SEO data is fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.

## Search

This template also pre-configured with the official [Payload Search Plugin](https://payloadcms.com/docs/plugins/search) to showcase how SSR search features can easily be implemented into Next.js with Payload. See [Website](#website) for more details.

## Redirects

If you are migrating an existing site or moving content to a new URL, you can use the `redirects` collection to create a proper redirect from old URLs to new ones. This will ensure that proper request status codes are returned to search engines and that your users are not left with a broken link. This template comes pre-configured with the official [Payload Redirects Plugin](https://payloadcms.com/docs/plugins/redirects) for complete redirect control from the admin panel. All redirects are fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.

## Jobs and Scheduled Publish

We have configured [Scheduled Publish](https://payloadcms.com/docs/versions/drafts#scheduled-publish) which uses the [jobs queue](https://payloadcms.com/docs/jobs-queue/jobs) in order to publish or unpublish your content on a scheduled time. The tasks are run on a cron schedule and can also be run as a separate instance if needed.

> Note: When deployed on Vercel, depending on the plan tier, you may be limited to daily cron only.

## Website

This template includes a beautifully designed, production-ready front-end built with the [Next.js App Router](https://nextjs.org), served right alongside your Payload app in a instance. This makes it so that you can deploy both your backend and website where you need it.

Core features:

- [Next.js App Router](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [React Hook Form](https://react-hook-form.com)
- [Payload Admin Bar](https://github.com/payloadcms/payload/tree/3.x/packages/admin-bar)
- [TailwindCSS styling](https://tailwindcss.com/)
- [shadcn/ui components](https://ui.shadcn.com/)
- User Accounts and Authentication
- Fully featured blog
- Publication workflow
- Dark mode
- Pre-made layout building blocks
- SEO
- Search
- Redirects
- Live preview

### Cache

Although Next.js includes a robust set of caching strategies out of the box, Payload Cloud proxies and caches all files through Cloudflare using the [Official Cloud Plugin](https://www.npmjs.com/package/@payloadcms/payload-cloud). This means that Next.js caching is not needed and is disabled by default. If you are hosting your app outside of Payload Cloud, you can easily reenable the Next.js caching mechanisms by removing the `no-store` directive from all fetch requests in `./src/app/_api` and then removing all instances of `export const dynamic = 'force-dynamic'` from pages files, such as `./src/app/(pages)/[slug]/page.tsx`. For more details, see the official [Next.js Caching Docs](https://nextjs.org/docs/app/building-your-application/caching).

## Development

To spin up this example locally, follow the [Quick Start](#quick-start). Then [Seed](#seed) the database with a few pages, posts, and projects.

### Working with Postgres

Postgres and other SQL-based databases follow a strict schema for managing your data. In comparison to our MongoDB adapter, this means that there's a few extra steps to working with Postgres.

Note that often times when making big schema changes you can run the risk of losing data if you're not manually migrating it.

#### Local development

This project runs migrations in development too; `push: false` is set in `src/payload.config.ts`. The workflow (config change, `make migration NAME=...`, `make migrate`, commit), the one-time baseline for an older database and how to start from an empty one are in [deploy/README.md](deploy/README.md#schema-changes).

#### Migrations

[Migrations](https://payloadcms.com/docs/database/migrations) are SQL files in `src/migrations/` that record every schema change. `make migration NAME=...` creates one; `pnpm payload migrate` runs the ones a database has not seen yet and records them in `payload_migrations`. The dev container runs it on start, the production image too (`PAYLOAD_MIGRATE_ON_START=true`).

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the `.env` file in your project root
1. Next run `docker-compose up`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

### Seed

To seed the database with a few pages, posts, and projects you can click the 'seed database' link from the admin panel.

The seed script will also create a demo user for demonstration purposes only:

- Demo Author
  - Email: `demo-author@payloadcms.com`
  - Password: `password`

> NOTICE: seeding the database is destructive because it drops your current database to populate a fresh one from the seed template. Only run this command if you are starting a new project or can afford to lose your current data.

## Production

To run Payload in production, you need to build and start the Admin panel. To do so, follow these steps:

1. Invoke the `next build` script by running `pnpm build` or `npm run build` in your project root. This creates a `.next` directory with a production-ready admin bundle.
1. Finally run `pnpm start` or `npm run start` to run Node in production and serve Payload from the `.build` directory.
1. When you're ready to go live, see Deployment below for more details.

### Deploying to Vercel

This template can also be deployed to Vercel for free. You can get started by choosing the Vercel DB adapter during the setup of the template or by manually installing and configuring it:

```bash
pnpm add @payloadcms/db-vercel-postgres
```

```ts
// payload.config.ts
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'

export default buildConfig({
  // ...
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  // ...
```

We also support Vercel's blob storage:

```bash
pnpm add @payloadcms/storage-vercel-blob
```

```ts
// payload.config.ts
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

export default buildConfig({
  // ...
  plugins: [
    vercelBlobStorage({
      collections: {
        [Media.slug]: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
  // ...
```

There is also a simplified [one click deploy](https://github.com/payloadcms/payload/tree/3.x/templates/with-vercel-postgres) to Vercel should you need it.

### Self-hosting

Before deploying your app, you need to:

1. Ensure your app builds and serves in production. See [Production](#production) for more details.
2. You can then deploy Payload as you would any other Node.js or Next.js application either directly on a VPS, DigitalOcean's Apps Platform, via Coolify or more. More guides coming soon.

You can also deploy your app manually, check out the [deployment documentation](https://payloadcms.com/docs/production/deployment) for full details.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).


## Editing the website (marketing)

Everything a visitor sees lives in the admin under **Website**:

- **Website-Einstellungen / Site settings**: name, logo, tagline, contact details, product links (login, demo booking, help centre, developer docs), social links.
- **Kopfzeile & Navigation / Header**: announcement bar, navigation items (single link or a menu with columns), the two header buttons.
- **Fußzeile / Footer**: link columns, legal links, bottom line.
- **Pages → Startseite**: the home page is a list of sections (blocks). Reorder them by dragging, collapse them, duplicate them, or add new ones with **Add block**. Each block has a **Section** row at the bottom: background (white / tinted / dark), spacing and an anchor id for links such as `#pricing`.

Languages: the language switch at the top of every document (DE / EN) edits one language at a time. German is the default; English falls back to German until it is filled in. Fields marked "Gilt für alle Sprachen / Shared across languages" (prices, KPI numbers, names of systems) are the same in every language.

Illustrations: blocks with a **Visual** field offer built-in illustrations by name (dashboard, agent, comparison, sources, team, integrations, alerts) and four looping product scenes (builder, flyingKpis, portfolio, campaigns), or an uploaded image.

Available sections: Hero (with the layered product stage), Feature story (heading row, wide looping scene, points in a row; or text beside the scene; used for dashboards, Flying KPIs, hotels and agencies), AI agent (streaming question & answer with a switch for the chats it works in), Integrations (ClickHouse-style tree of sources lighting up into Indicate), Testimonials (editorial quotes), FAQ (with FAQ structured data), Call to action (use the yellow background for the closing band), Logo wall, Product tabs, Why Indicate (pillars + tiles), Steps, Card grid, Stats strip, Pricing overview, plus the starter template's rich text, media, form and archive blocks.

## For developers

- Routes live under `src/app/(frontend)/[locale]`; `src/proxy.ts` redirects unprefixed paths to the visitor's language. Add a language in `src/i18n/config.ts` and `payload.config.ts`.
- Design tokens (dark-first colours in oklch with the brand yellow as the single accent, type scale, motion curves, shadows) are in `src/app/(frontend)/globals.css`. Section backgrounds: default, slightly raised, deeper dark, yellow accent. Blocks render inside `<Section>`; shared field factories are in `src/fields/` (`sectionHeader`, `sectionSettings`, `visual`, `iconSelect`).
- A new block = `src/blocks/<Name>/config.ts` + `Component.tsx`, registered in `src/collections/Pages/index.ts`, `src/blocks/RenderBlocks.tsx` and `src/blocks/registry.ts` (a test checks the three stay in sync).
- Motion: one hero entrance per session, scroll-linked reveals via `animation-timeline: view()`, everything else answers user input. Every animation has a `prefers-reduced-motion` variant.
- Schema changes go through migrations (`make migration NAME=...`, then `make migrate`). Read the generated SQL: a rename comes out as drop + add and loses the column's data. The starter template's `meta` group on pages and `navItems` on header/footer are still hidden; removing them now takes a migration like any other change.
- Verify: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test:int`, `pnpm test:e2e` (needs the app on :3000).
