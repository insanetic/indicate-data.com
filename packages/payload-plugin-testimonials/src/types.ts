import type { CollectionConfig } from 'payload'

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
  /** Where the usage panel looks for blocks; default pages.layout. `false` hides the panel. */
  usage?: false | { collection: string; field: string; blockSlug?: string }
  /** Import-map paths of the admin components. */
  componentPaths?: Partial<ComponentPaths>
  /**
   * Access overrides for the testimonials collection, merged key by key over the defaults
   * (read: published for visitors, everything for logged-in users; create/update/delete: logged-in users).
   */
  access?: Partial<NonNullable<CollectionConfig['access']>>
}

export interface ResolvedOptions {
  slugs: { testimonials: string; tags: string }
  mediaSlug: string
  linkCollections: string[]
  adminGroup: string | Record<string, string>
  cacheTag: string
  usage: false | { collection: string; field: string; blockSlug: string }
  componentPaths: ComponentPaths
  access: Partial<NonNullable<CollectionConfig['access']>>
  localized: boolean
}

export const resolveOptions = (options: TestimonialsPluginOptions = {}, localized = false): ResolvedOptions => ({
  slugs: { testimonials: options.slugs?.testimonials || 'testimonials', tags: options.slugs?.tags || 'testimonial-tags' },
  mediaSlug: options.mediaSlug || 'media',
  linkCollections: options.linkCollections ?? ['pages', 'posts'],
  adminGroup: options.adminGroup || { de: 'Kundenstimmen', en: 'Testimonials' },
  cacheTag: options.cacheTag || DEFAULT_CACHE_TAG,
  usage:
    options.usage === false
      ? false
      : { collection: 'pages', field: 'layout', blockSlug: 'testimonials', ...(options.usage || {}) },
  componentPaths: {
    usagePanel: '@subneo/payload-testimonials/admin#UsagePanel',
    selectionPreview: '@subneo/payload-testimonials/admin#SelectionPreview',
    ...(options.componentPaths || {}),
  },
  access: options.access || {},
  localized,
})
