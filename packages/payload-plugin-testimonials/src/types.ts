import type { CollectionConfig, Field } from 'payload'

export type Id = number | string

/** A relationship value: an id, or the populated document. */
export type Rel<T extends { id: Id }> = Id | T | null | undefined

export interface TestimonialTag {
  id: Id
  title?: string | null
  slug?: string | null
}

export interface TestimonialLink {
  type?: 'none' | 'internal' | 'external' | null
  doc?: { relationTo: string; value: Id | { id: Id; slug?: string | null; title?: string | null } } | null
  url?: string | null
  label?: string | null
}

export interface Testimonial {
  id: Id
  quote?: string | null
  name?: string | null
  role?: string | null
  company?: string | null
  avatar?: unknown
  logo?: unknown
  tags?: Rel<TestimonialTag>[] | null
  link?: TestimonialLink | null
  title?: string | null
  _status?: 'draft' | 'published' | null
}

export interface TestimonialsBlockData {
  id?: string | null
  blockType?: string
  mode?: 'auto' | 'manual' | null
  testimonials?: Rel<Testimonial>[] | null
  tags?: Rel<TestimonialTag>[] | null
  tagMatch?: 'any' | 'all' | null
  count?: number | null
  pinned?: Rel<Testimonial>[] | null
  exclude?: Rel<Testimonial>[] | null
  seed?: string | null
}

export type Reason = 'manual' | 'pinned' | 'auto'

export interface Selected {
  testimonial: Testimonial
  reason: Reason
}

export const DEFAULT_COUNT = 3
export const MAX_COUNT = 6

/** Normalises a relationship value to a string id (ids arrive as numbers or strings). */
export const idOf = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') {
    const id = (value as { id?: Id }).id
    return id === undefined || id === null ? null : String(id)
  }
  return String(value)
}

export const idsOf = (values: unknown[] | null | undefined): string[] =>
  (values || []).map(idOf).filter((id): id is string => id !== null)

export const DEFAULT_CACHE_TAG = 'testimonials'

export interface ComponentPaths {
  usagePanel: string
  selectionPreview: string
}

/** Payload's override shape (as in form-builder, search, SEO): replace or extend the default fields. */
export type FieldsOverride = (args: { defaultFields: Field[] }) => Field[]

/**
 * Overrides for one of the plugin's collections. `access` and `admin` merge key by key over the
 * defaults, `hooks` are appended after the plugin's own (which keep the cache fresh), `fields`
 * gets the default fields, and every other key replaces the default. The slug comes from `slugs`.
 */
export type CollectionOverrides = Partial<Omit<CollectionConfig, 'fields' | 'slug'>> & { fields?: FieldsOverride }

/** A blocks field that holds the testimonials block, found when the plugin runs. */
export interface BlockLocation {
  collection: string
  /** Dotted path of the blocks field in the document, e.g. `layout` or `content.sections`. */
  path: string
  blockSlug: string
}

export interface TestimonialsPluginOptions {
  /** Set to `false` to leave the config untouched. */
  enabled?: boolean
  slugs?: { testimonials?: string; tags?: string }
  /** Upload collection for photo and logo; default `media`. */
  mediaSlug?: string
  /** Collections a testimonial can link to (case study etc.); default pages + posts. `[]` = external links only. */
  linkCollections?: string[]
  /** Admin sidebar group; default Kundenstimmen / Testimonials. */
  adminGroup?: string | Record<string, string>
  /** Next cache tag of the loaded pool; default `testimonials`. */
  cacheTag?: string
  /** `false` hides the "Shown on" panel. It looks in every collection whose blocks fields hold the testimonials block. */
  usage?: boolean
  /** Import-map paths of the admin components. */
  componentPaths?: Partial<ComponentPaths>
  /** Overrides for the testimonials collection. */
  testimonialsOverrides?: CollectionOverrides
  /** Overrides for the tags collection. */
  tagsOverrides?: CollectionOverrides
}

/** The options after defaults, stored in `config.custom` so the block, the server helpers and the endpoints all read the same values. */
export interface ResolvedOptions {
  slugs: { testimonials: string; tags: string }
  mediaSlug: string
  linkCollections: string[]
  adminGroup: string | Record<string, string>
  cacheTag: string
  usage: boolean
  componentPaths: ComponentPaths
  testimonialsOverrides: CollectionOverrides
  tagsOverrides: CollectionOverrides
  localized: boolean
  /** Where the testimonials block is used; filled in by the plugin. */
  locations: BlockLocation[]
}

export const resolveOptions = (options: TestimonialsPluginOptions = {}, localized = false): ResolvedOptions => ({
  slugs: { testimonials: options.slugs?.testimonials || 'testimonials', tags: options.slugs?.tags || 'testimonial-tags' },
  mediaSlug: options.mediaSlug || 'media',
  linkCollections: options.linkCollections ?? ['pages', 'posts'],
  adminGroup: options.adminGroup || { de: 'Kundenstimmen', en: 'Testimonials' },
  cacheTag: options.cacheTag || DEFAULT_CACHE_TAG,
  usage: options.usage !== false,
  componentPaths: {
    usagePanel: '@subneo/payload-testimonials/admin#UsagePanel',
    selectionPreview: '@subneo/payload-testimonials/admin#SelectionPreview',
    ...(options.componentPaths || {}),
  },
  testimonialsOverrides: options.testimonialsOverrides || {},
  tagsOverrides: options.tagsOverrides || {},
  localized,
  locations: [],
})

/** Key under `config.custom` (and on the block's and its fields' `custom`). */
export const PLUGIN_KEY = '@subneo/payload-testimonials'

/**
 * The plugin's resolved options, read from a Payload instance or config. Without the plugin
 * (tests, or `enabled: false`) this is the defaults, so the helpers still work.
 */
export const getPluginOptions = (source?: { config?: { custom?: Record<string, unknown> }; custom?: Record<string, unknown> } | null): ResolvedOptions => {
  const custom = source?.config?.custom ?? source?.custom
  return (custom?.[PLUGIN_KEY] as ResolvedOptions | undefined) || resolveOptions()
}
