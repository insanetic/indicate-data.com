import type { Block, BlocksField, CollectionConfig, CollectionSlug, Field, Plugin } from 'payload'

import { createCopyBlockEndpoint } from './endpoint'

export const BLOCK_TOOLS_COMPONENTS = '@/plugins/blockTools/admin'

export type BlockToolsOptions = {
  /** Collections and the name of their blocks field, e.g. `{ pages: { field: 'layout' } }`. */
  collections: Partial<Record<CollectionSlug, { field: string }>>
}

/** Stored value; the toolbar's visibility switch edits it, so the checkbox itself stays out of sight. */
const hiddenField: Field = {
  name: 'hidden',
  type: 'checkbox',
  defaultValue: false,
  label: { de: 'Auf der Website ausblenden', en: 'Hide on website' },
  admin: { hidden: true },
}

/** Slim bar at the top of every block: visibility switch and "copy to page". */
const toolbarField: Field = {
  name: 'blockToolbar',
  type: 'ui',
  admin: { components: { Field: `${BLOCK_TOOLS_COMPONENTS}#BlockToolbar` } },
}

const withTools = (block: Block): Block => {
  if (block.admin?.components?.Label) {
    throw new Error(`blockTools: block "${block.slug}" already has admin.components.Label`)
  }
  const singular = block.labels?.singular
  return {
    ...block,
    admin: {
      ...block.admin,
      components: {
        ...block.admin?.components,
        Label: {
          path: `${BLOCK_TOOLS_COMPONENTS}#BlockRowLabel`,
          clientProps: { label: typeof singular === 'function' || !singular ? block.slug : singular },
        },
      },
    },
    fields: [hiddenField, toolbarField, ...block.fields],
  }
}

const withToolsOnField = (field: BlocksField): BlocksField => {
  if (field.blockReferences) throw new Error(`blockTools: "${field.name}" uses blockReferences, which is not supported`)
  return { ...field, blocks: field.blocks.map(withTools) }
}

/** Finds the named blocks field at the top level or inside rows, collapsibles and unnamed tabs. */
const mapBlocksField = (fields: Field[], name: string): { fields: Field[]; found: boolean } => {
  let found = false
  const next = fields.map((f): Field => {
    if (found) return f
    if ('name' in f && f.name === name) {
      if (f.type !== 'blocks') throw new Error(`blockTools: "${name}" is not a blocks field`)
      found = true
      return withToolsOnField(f)
    }
    if (f.type === 'row' || f.type === 'collapsible') {
      const inner = mapBlocksField(f.fields, name)
      if (inner.found) {
        found = true
        return { ...f, fields: inner.fields }
      }
    }
    if (f.type === 'tabs') {
      const tabs = f.tabs.map((tab) => {
        if (found || ('name' in tab && tab.name)) return tab
        const inner = mapBlocksField(tab.fields, name)
        if (!inner.found) return tab
        found = true
        return { ...tab, fields: inner.fields }
      })
      if (found) return { ...f, tabs }
    }
    return f
  })
  return { fields: next, found }
}

/**
 * Adds "hide on website" and "copy to page" to every block of the configured blocks fields:
 * a `hidden` checkbox and a copy button on each block, a row label that shows hidden blocks,
 * and `POST /api/<collection>/copy-block`. Rendering code filters with `visibleBlocks`.
 */
export const blockToolsPlugin =
  (options: BlockToolsOptions): Plugin =>
  (config) => {
    const collections = config.collections || []
    for (const slug of Object.keys(options.collections)) {
      if (!collections.some((c) => c.slug === slug)) throw new Error(`blockTools: unknown collection "${slug}"`)
    }
    return {
      ...config,
      collections: collections.map((collection): CollectionConfig => {
        const o = options.collections[collection.slug as CollectionSlug]
        if (!o) return collection
        const { fields, found } = mapBlocksField(collection.fields, o.field)
        if (!found) throw new Error(`blockTools: collection "${collection.slug}" has no field "${o.field}"`)
        return {
          ...collection,
          fields,
          endpoints: [...(collection.endpoints || []), createCopyBlockEndpoint({ collection: collection.slug as CollectionSlug, field: o.field })],
        }
      }),
    }
  }
