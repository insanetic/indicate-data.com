import type { Block, CollectionSlug, Config, Field } from 'payload'

import type { BlockFieldRole } from './block'
import { PLUGIN_KEY, type BlockLocation, type ResolvedOptions } from './types'

const isOurBlock = (block: Block): boolean => Boolean(block.custom?.[PLUGIN_KEY])

/** Points the block's own fields at the configured slugs and preview component. Other fields are left alone. */
const wireOwnFields = (fields: Field[], o: ResolvedOptions): Field[] =>
  fields.map((field) => {
    const r = field.custom?.[PLUGIN_KEY] as BlockFieldRole | undefined
    if (r === 'testimonials') return { ...field, relationTo: o.slugs.testimonials as CollectionSlug } as Field
    if (r === 'tags') return { ...field, relationTo: o.slugs.tags as CollectionSlug } as Field
    if (r === 'preview') {
      return {
        ...field,
        admin: {
          ...field.admin,
          components: { Field: { path: o.componentPaths.selectionPreview, clientProps: { apiSlug: o.slugs.testimonials } } },
        },
      } as Field
    }
    // The block's own rows; named fields (a site's group, say) are not ours.
    if (field.type === 'row') return { ...field, fields: wireOwnFields(field.fields, o) }
    return field
  })

const wireBlock = (block: Block, o: ResolvedOptions): Block => ({ ...block, fields: wireOwnFields(block.fields, o) })

interface Walk {
  o: ResolvedOptions
  /** Slugs of our blocks among `config.blocks`, for blocks fields that only reference them. */
  referenced: Set<string>
  /** Set while walking a collection: where the block sits at document level. */
  found?: (path: string, blockSlug: string) => void
}

/**
 * Rewrites every testimonials block under `fields` and reports where it sits. Only blocks fields
 * reachable without passing an array or another block are reported: the usage panel reads a
 * document's field by path, which a block nested in rows of an array does not have.
 * Returns the same array when nothing changed.
 */
const walkFields = (fields: Field[], w: Walk, path: string[], nested: boolean): Field[] => {
  let changed = false
  const next = fields.map((field) => {
    const updated = walkField(field, w, path, nested)
    if (updated !== field) changed = true
    return updated
  })
  return changed ? next : fields
}

const walkField = (field: Field, w: Walk, path: string[], nested: boolean): Field => {
  const named = 'name' in field && field.name ? [...path, field.name] : path
  switch (field.type) {
    case 'blocks': {
      const report = (slug: string) => {
        if (!nested) w.found?.(named.join('.'), slug)
      }
      const blocks = field.blocks?.map((b) => {
        if (isOurBlock(b)) {
          report(b.slug)
          return wireBlock(b, w.o)
        }
        const inner = walkFields(b.fields, w, named, true)
        return inner === b.fields ? b : { ...b, fields: inner }
      })
      const blockReferences = field.blockReferences?.map((ref) => {
        if (typeof ref === 'string') {
          if (w.referenced.has(ref)) report(ref)
          return ref
        }
        if (isOurBlock(ref)) {
          report(ref.slug)
          return wireBlock(ref, w.o)
        }
        return ref
      })
      const changed = blocks?.some((b, i) => b !== field.blocks[i]) || blockReferences?.some((r, i) => r !== field.blockReferences?.[i])
      return changed ? ({ ...field, blocks: blocks ?? field.blocks, ...(blockReferences ? { blockReferences } : {}) } as Field) : field
    }
    case 'array': {
      const inner = walkFields(field.fields, w, named, true)
      return inner === field.fields ? field : { ...field, fields: inner }
    }
    case 'group':
    case 'row':
    case 'collapsible': {
      const inner = walkFields(field.fields, w, named, nested)
      return inner === field.fields ? field : ({ ...field, fields: inner } as Field)
    }
    case 'tabs': {
      let changed = false
      const tabs = field.tabs.map((tab) => {
        const tabPath = 'name' in tab && tab.name ? [...path, tab.name] : path
        const inner = walkFields(tab.fields, w, tabPath, nested)
        if (inner === tab.fields) return tab
        changed = true
        return { ...tab, fields: inner }
      })
      return changed ? { ...field, tabs } : field
    }
    default:
      return field
  }
}

/**
 * Wires every testimonials block in the config to the plugin's slugs and component paths, and
 * returns where the block is used (collections only; globals are wired but have no usage panel).
 */
export const wireBlocks = (config: Config, o: ResolvedOptions): { config: Config; locations: BlockLocation[] } => {
  const referenced = new Set<string>()
  const blocks = config.blocks?.map((b) => {
    if (!isOurBlock(b)) return b
    referenced.add(b.slug)
    return wireBlock(b, o)
  })
  const locations: BlockLocation[] = []
  const collections = config.collections?.map((c) => {
    const fields = walkFields(c.fields, { o, referenced, found: (path, blockSlug) => locations.push({ collection: c.slug, path, blockSlug }) }, [], false)
    return fields === c.fields ? c : { ...c, fields }
  })
  const globals = config.globals?.map((g) => {
    const fields = walkFields(g.fields, { o, referenced }, [], false)
    return fields === g.fields ? g : { ...g, fields }
  })
  return { config: { ...config, ...(blocks ? { blocks } : {}), ...(collections ? { collections } : {}), ...(globals ? { globals } : {}) }, locations }
}
