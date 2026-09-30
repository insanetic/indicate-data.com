import type { MCPPluginConfig } from '@payloadcms/plugin-mcp'

/**
 * What the MCP endpoint exposes. The email settings are deliberately absent: MCP keys must never
 * change who receives the contact form.
 */
export const mcpPluginOptions: MCPPluginConfig = {
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
}
