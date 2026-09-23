import type { Plugin } from 'payload'

import { createTagsCollection, createTestimonialsCollection } from './collections'
import { resolveOptions, type TestimonialsPluginOptions } from './types'

/**
 * Adds the testimonials collection (with its usage and preview endpoints, admin panel and list
 * cell) and the cohort tag collection. The page block comes separately from `createTestimonialsBlock`.
 */
export const testimonialsPlugin =
  (options: TestimonialsPluginOptions = {}): Plugin =>
  (config) => {
    if (options.enabled === false) return config
    const o = resolveOptions(options, Boolean(config.localization))
    return {
      ...config,
      collections: [...(config.collections || []), createTestimonialsCollection(o), createTagsCollection(o)],
    }
  }
