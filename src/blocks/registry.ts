/**
 * Slugs of every layout block available on pages. `RenderBlocks` is typed against the
 * generated `Page['layout']` union, so a block missing there fails type-checking; this list
 * exists for lightweight tests and admin tooling that must not import React components.
 */
export const blockSlugs = [
  'hero',
  'heading',
  'media',
  'items',
  'actions',
  'integrationTree',
  'split',
  'logoWall',
  'featureTabs',
  'featureStory',
  'agentShowcase',
  'steps',
  'integrations',
  'integrationDirectory',
  'pillars',
  'cardGrid',
  'stats',
  'testimonials',
  'pricingTeaser',
  'pricing',
  'faq',
  'ctaSection',
  'spotlight',
  'document',
  'content',
  'mediaBlock',
  'formBlock',
  'archive',
  'cta',
] as const

export type BlockSlug = (typeof blockSlugs)[number]

/**
 * Structural blocks replaced by the section blocks (Heading, Media, Items, Actions, Integration
 * tree, Split). Hidden from the block picker; the section conversion rewrites them and phase 2
 * deletes them.
 */
export const legacySectionSlugs = ['featureStory', 'ctaSection', 'pillars', 'cardGrid', 'steps', 'stats', 'integrations'] as const
