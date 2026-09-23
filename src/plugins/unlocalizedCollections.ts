import type { Plugin } from 'payload'

import { withoutLocalization } from '@/utilities/withoutLocalization'

/**
 * Keeps the given collections free of localised fields, even when a plugin (SEO, form
 * builder, search, nested docs) marks its fields `localized` automatically once site
 * localisation is enabled.
 *
 * Why: these collections already hold content from the starter template. Localising a field
 * moves its column into a `_locales` table, and the generated migration drops the old column
 * with its content.
 *
 * Remove a slug from the list, together with a migration that copies the values over, when
 * that collection should become localised.
 */
export const unlocalizedCollections =
  (slugs: string[]): Plugin =>
  (config) => ({
    ...config,
    collections: (config.collections || []).map((collection) =>
      slugs.includes(collection.slug)
        ? { ...collection, fields: withoutLocalization(collection.fields) }
        : collection,
    ),
  })
