import type { Plugin } from 'payload'

import { createTagsCollection, createTestimonialsCollection } from './collections'
import { PLUGIN_KEY, resolveOptions, type TestimonialsPluginOptions } from './types'
import { wireBlocks } from './wire'

/**
 * Adds the testimonials collection (with its usage and preview endpoints and admin panel) and
 * the cohort tag collection, and wires every testimonials block already in the config to them.
 * The resolved options are stored in `config.custom`, so `getTestimonials` and the endpoints read
 * the same slugs without being told again.
 */
export const testimonialsPlugin =
  (options: TestimonialsPluginOptions = {}): Plugin =>
  (incoming) => {
    if (options.enabled === false) return incoming
    const resolved = resolveOptions(options, Boolean(incoming.localization))
    const { config, locations } = wireBlocks(incoming, resolved)
    const o = { ...resolved, locations }
    return {
      ...config,
      collections: [...(config.collections || []), createTestimonialsCollection(o), createTagsCollection(o)],
      custom: { ...config.custom, [PLUGIN_KEY]: o },
    }
  }
