import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { unlocalizedCollections } from './unlocalizedCollections'
import { blockToolsPlugin } from './blockTools'
import { subneoPricingPlugin } from '@subneo/payload-pricing'
import { testimonialsPlugin } from '@subneo/payload-testimonials'
import { pricingFixtures } from '@/pricing/fixture'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Indicate Data` : 'Indicate Data'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  // MCP endpoint at /api/mcp. Create a key under "MCP -> API Keys" in the admin,
  // then `claude mcp add --transport http payload http://localhost:3000/api/mcp --header "Authorization: Bearer <key>"`
  // (or export PAYLOAD_MCP_API_KEY and use the repo's .mcp.json).
  mcpPlugin({
    collections: {
      pages: {
        description:
          'Website pages composed of layout blocks (hero, logoWall, featureTabs, agentShowcase, steps, integrations, cardGrid, stats, testimonials (central, references the testimonials collection), pricingTeaser, pricing, faq, ctaSection, content, media, archive, form). Localised: de (default) and en.',
        enabled: { find: true, create: true, update: true, delete: false },
      },
      posts: {
        description: 'Blog posts with rich text content, categories and SEO meta.',
        enabled: { find: true, create: true, update: true, delete: false },
      },
      media: {
        description: 'Uploaded images and files.',
        enabled: { find: true },
      },
      categories: {
        description: 'Post categories.',
        enabled: { find: true, create: true, update: true, delete: false },
      },
      testimonials: {
        description:
          'Central customer testimonials (quote, person, company, cohort tags, optional link). Pages reference them from the testimonials block. Localised: de and en for quote, role, link label.',
        enabled: { find: true, create: true, update: true, delete: false },
      },
      'testimonial-tags': {
        description: 'Cohort tags for testimonials (e.g. hotellerie, agenturen). Used by the testimonials block filter; never shown to visitors.',
        enabled: { find: true, create: true, update: true, delete: false },
      },
    },
    globals: {
      'site-settings': {
        description: 'Site name, logo, contact details, product links, social links.',
        enabled: { find: true, update: true },
      },
      header: {
        description: 'Announcement bar, main navigation (single links or mega-menu columns), header buttons.',
        enabled: { find: true, update: true },
      },
      footer: {
        description: 'Footer link columns, legal links, bottom line.',
        enabled: { find: true, update: true },
      },
      'subneo-pricing': {
        description: 'Pricing page source: Subneo connection, plan families, per-language overrides, button templates.',
        enabled: { find: true, update: true },
      },
    },
  }),
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    localize: false,
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  // Pricing page fed by Subneo: settings global, refresh endpoint; the block is registered on Pages.
  subneoPricingPlugin({ fixtures: pricingFixtures }),
  // Central testimonials and cohort tags; the testimonials block on Pages references them.
  testimonialsPlugin(),
  // Hide any page block without deleting it, and copy blocks to other pages (see spec 2026-09-24-block-tools).
  blockToolsPlugin({ collections: { pages: { field: 'layout' } } }),
  // Must come last: strips `localized` that the plugins above add to these collections.
  // Posts, forms, search and categories are not localised yet (see spec "Assumptions").
  unlocalizedCollections(['posts', 'forms', 'form-submissions', 'search', 'categories']),
]
