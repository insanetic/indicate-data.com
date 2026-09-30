import type { Block, CollectionSlug, Field } from 'payload'

import { l } from './labels'
import { MAX_COUNT, DEFAULT_COUNT, PLUGIN_KEY } from './types'

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
}

/**
 * What a field of the block points at. The plugin finds the block by its `custom` marker and
 * rewrites these fields to its configured slugs and component path, so the block needs no slugs
 * of its own.
 */
export type BlockFieldRole = 'testimonials' | 'tags' | 'preview'
const role = (r: BlockFieldRole) => ({ custom: { [PLUGIN_KEY]: r } })

type Sibling = { mode?: string; tags?: unknown[] }
const isAuto = (_: unknown, s: Sibling) => s?.mode !== 'manual'
const isManual = (_: unknown, s: Sibling) => s?.mode === 'manual'

export const newSeed = () => Math.random().toString(36).slice(2, 10)

// The defaults below are replaced by the plugin with its own slugs (see BlockFieldRole). They are
// strings cast to CollectionSlug: the site's generated union can't know configurable slugs.
const testimonialsSlug = 'testimonials'
const tagsSlug = 'testimonial-tags'

/**
 * The page block. It stores *which* testimonials a section shows (hand-picked, or a filter +
 * seed); the content lives in the testimonials collection and is resolved at render time. The
 * block has no markup: each site renders it with its own component. Put it in a blocks field of
 * a collection before `testimonialsPlugin` runs, and the plugin wires it to its collections.
 */
export const createTestimonialsBlock = ({
  slug = 'testimonials',
  interfaceName = 'TestimonialsBlock',
  before = [],
  after = [],
  extraFields = [],
}: TestimonialsBlockOptions = {}): Block => ({
  slug,
  interfaceName,
  custom: { [PLUGIN_KEY]: true },
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
      ...role('testimonials'),
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
          ...role('tags'),
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
          ...role('testimonials'),
          relationTo: testimonialsSlug as CollectionSlug,
          hasMany: true,
          label: l('Immer zeigen (zuerst)', 'Always show (first)'),
          admin: { width: '50%', condition: isAuto, isSortable: true },
        },
        {
          name: 'exclude',
          type: 'relationship',
          ...role('testimonials'),
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
      ...role('preview'),
      admin: {
        condition: isAuto,
        components: { Field: { path: '@subneo/payload-testimonials/admin#SelectionPreview', clientProps: { apiSlug: testimonialsSlug } } },
      },
    },
    ...extraFields,
    ...after,
  ],
})
