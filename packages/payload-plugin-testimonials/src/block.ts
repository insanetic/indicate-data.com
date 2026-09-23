import type { Block, CollectionSlug, Field } from 'payload'

import { l } from './labels'
import { MAX_COUNT, DEFAULT_COUNT } from './types'

export interface TestimonialsBlockOptions {
  slug?: string
  interfaceName?: string
  /** Kept for symmetry with the other packages; the block's own fields are not localised. */
  localized?: boolean
  /** Site fields before the block's own (e.g. a section header). */
  before?: Field[]
  /** Site fields after (e.g. section settings). */
  after?: Field[]
  /** Site fields placed before `after`, e.g. legacy fields kept for a migration. */
  extraFields?: Field[]
  testimonialsSlug?: string
  tagsSlug?: string
  selectionPreviewPath?: string
}

type Sibling = { mode?: string; tags?: unknown[] }
const isAuto = (_: unknown, s: Sibling) => s?.mode !== 'manual'
const isManual = (_: unknown, s: Sibling) => s?.mode === 'manual'

export const newSeed = () => Math.random().toString(36).slice(2, 10)

// Slugs are configurable strings, so relationTo casts them: the site's generated
// CollectionSlug union can't know them.

/**
 * The page block. It stores *which* testimonials a section shows (hand-picked, or a filter +
 * seed); the content lives in the testimonials collection and is resolved at render time.
 */
export const createTestimonialsBlock = ({
  slug = 'testimonials',
  interfaceName = 'TestimonialsBlock',
  before = [],
  after = [],
  extraFields = [],
  testimonialsSlug = 'testimonials',
  tagsSlug = 'testimonial-tags',
  selectionPreviewPath = '@subneo/payload-testimonials/admin#SelectionPreview',
}: TestimonialsBlockOptions = {}): Block => ({
  slug,
  interfaceName,
  labels: { singular: l('Kundenstimmen', 'Testimonials'), plural: l('Kundenstimmen-Abschnitte', 'Testimonial sections') },
  fields: [
    ...before,
    {
      name: 'mode',
      type: 'radio',
      defaultValue: 'auto',
      label: l('Auswahl', 'Selection'),
      admin: { layout: 'horizontal' },
      options: [
        { label: l('Automatisch', 'Automatic'), value: 'auto' },
        { label: l('Von Hand', 'Manual'), value: 'manual' },
      ],
    },
    {
      name: 'testimonials',
      type: 'relationship',
      relationTo: testimonialsSlug as CollectionSlug,
      hasMany: true,
      label: l('Kundenstimmen (Reihenfolge = Anzeige)', 'Testimonials (order = display order)'),
      admin: { condition: isManual, isSortable: true },
    },
    {
      type: 'row',
      admin: { condition: isAuto },
      fields: [
        {
          name: 'tags',
          type: 'relationship',
          relationTo: tagsSlug as CollectionSlug,
          hasMany: true,
          label: l('Nur mit Tags (leer = alle)', 'Only with tags (empty = all)'),
          admin: { width: '50%', condition: isAuto },
        },
        {
          name: 'tagMatch',
          type: 'radio',
          defaultValue: 'any',
          label: l('Tags', 'Tags'),
          options: [
            { label: l('mindestens einer', 'any'), value: 'any' },
            { label: l('alle', 'all'), value: 'all' },
          ],
          admin: { width: '25%', condition: (_: unknown, s: Sibling) => isAuto(_, s) && (s?.tags?.length ?? 0) >= 2 },
        },
        {
          name: 'count',
          type: 'number',
          defaultValue: DEFAULT_COUNT,
          min: 1,
          max: MAX_COUNT,
          label: l('Anzahl', 'Count'),
          admin: { width: '25%', condition: isAuto },
        },
      ],
    },
    {
      type: 'row',
      admin: { condition: isAuto },
      fields: [
        {
          name: 'pinned',
          type: 'relationship',
          relationTo: testimonialsSlug as CollectionSlug,
          hasMany: true,
          label: l('Immer zeigen (zuerst)', 'Always show (first)'),
          admin: { width: '50%', condition: isAuto, isSortable: true },
        },
        {
          name: 'exclude',
          type: 'relationship',
          relationTo: testimonialsSlug as CollectionSlug,
          hasMany: true,
          label: l('Nie zeigen', 'Never show'),
          admin: { width: '50%', condition: isAuto },
        },
      ],
    },
    { name: 'seed', type: 'text', defaultValue: newSeed, admin: { hidden: true } },
    {
      name: 'preview',
      type: 'ui',
      admin: {
        condition: isAuto,
        components: { Field: { path: selectionPreviewPath, clientProps: { apiSlug: testimonialsSlug } } },
      },
    },
    ...extraFields,
    ...after,
  ],
})
