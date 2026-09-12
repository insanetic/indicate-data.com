import type { Field } from 'payload'

/**
 * Returns a deep copy of `fields` with `localized` removed everywhere, including inside
 * tabs, rows, groups, arrays and blocks. Used to keep plugin-provided collections
 * non-localised while the rest of the site is localised.
 */
export const withoutLocalization = (fields: Field[]): Field[] =>
  fields.map((field) => {
    const next = { ...field } as Field & { localized?: boolean }
    if ('localized' in next) delete next.localized

    if ('fields' in next && Array.isArray(next.fields)) {
      next.fields = withoutLocalization(next.fields)
    }
    if (next.type === 'tabs') {
      next.tabs = next.tabs.map((tab) => ({ ...tab, fields: withoutLocalization(tab.fields) }))
    }
    if (next.type === 'blocks' && Array.isArray(next.blocks)) {
      next.blocks = next.blocks.map((block) => ({
        ...block,
        fields: withoutLocalization(block.fields),
      }))
    }
    return next
  })
