/**
 * Slugs of every layout block available on pages. `RenderBlocks` is typed against the
 * generated `Page['layout']` union, so a block missing there fails type-checking; this list
 * exists for lightweight tests and admin tooling that must not import React components.
 */
export const blockSlugs = [
  'hero',
  'logoWall',
  'featureTabs',
  'featureStory',
  'agentShowcase',
  'steps',
  'integrations',
  'pillars',
  'cardGrid',
  'stats',
  'testimonials',
  'pricingTeaser',
  'faq',
  'ctaSection',
  'content',
  'mediaBlock',
  'formBlock',
  'archive',
  'cta',
] as const

export type BlockSlug = (typeof blockSlugs)[number]
