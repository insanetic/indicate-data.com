import type { Plugin } from 'payload'

import { createTagsCollection, createTestimonialsCollection } from './collections'
import { resolveOptions, type TestimonialsPluginOptions } from './types'

/** Adds the testimonials and tag collections (and, from Task 5, the usage and preview endpoints). */
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
