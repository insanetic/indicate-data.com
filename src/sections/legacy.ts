/**
 * The seven structural blocks the section blocks replace, as stored, and the pure conversion into
 * section blocks. Used by the phase 1 migration, `scripts/convert-sections.ts` and the seed (which
 * still writes some sections in these shapes). Nothing here touches the database.
 */
import type {
  ActionsBlock,
  HeadingBlock,
  IntegrationTreeBlock,
  ItemsBlock,
  MediaSectionBlock,
  SplitBlock,
} from '@/payload-types'
import { legacySectionSlugs } from '@/blocks/registry'

import type { Background, Gap } from './rhythm'

export type SectionBlock = HeadingBlock | MediaSectionBlock | ItemsBlock | ActionsBlock | IntegrationTreeBlock | SplitBlock

type Id = string | null
type LinkRow = NonNullable<HeadingBlock['links']>[number]
type Visual = NonNullable<MediaSectionBlock['visual']>
type Header = { eyebrow?: string | null; heading?: string | null; lead?: string | null; align?: 'left' | 'center' | 'right' | null }
type Icon = NonNullable<ItemsBlock['items']>[number]['icon']
/** Card and tile links: text links only, like the Items rows they become. */
type ItemLinks = NonNullable<ItemsBlock['items']>[number]['links']
type TreeGroup = NonNullable<IntegrationTreeBlock['groups']>[number]
type OldSpacing = 'default' | 'compact' | 'none'
type Base = {
  id?: Id
  blockName?: string | null
  hidden?: boolean | null
  settings?: { background?: Background | null; spacing?: OldSpacing | null; anchor?: string | null } | null
}

export type LegacyFeatureStory = Base & {
  blockType: 'featureStory'
  header: Header
  layout?: 'stacked' | 'visual-right' | 'visual-left' | null
  visual?: Visual | null
  points?: { icon?: Icon; title: string; text?: string | null; id?: Id }[] | null
  links?: LinkRow[] | null
}
export type LegacyCtaSection = Base & { blockType: 'ctaSection'; header: Header; links?: LinkRow[] | null; note?: string | null }
export type LegacyPillars = Base & {
  blockType: 'pillars'
  header: Header
  pillars?: { icon?: Icon; title: string; text: string; id?: Id }[] | null
  /** `text` and `width` exist only on the items block; the seed sets them through this converter. */
  tiles?: { value?: string | null; suffix?: string | null; label: string; text?: string | null; width?: ItemRow['width']; links?: ItemLinks; id?: Id }[] | null
}
export type LegacyCardGrid = Base & {
  blockType: 'cardGrid'
  header: Header
  layout?: 'grid-3' | 'grid-4' | 'bento' | null
  cards?: {
    icon?: Icon
    title: string
    size?: 'sm' | 'lg' | null
    text?: string | null
    points?: { text: string; id?: Id }[] | null
    links?: ItemLinks
    id?: Id
  }[] | null
}
export type LegacySteps = Base & { blockType: 'steps'; header: Header; steps?: { icon?: Icon; title: string; text: string; id?: Id }[] | null }
export type LegacyStats = Base & {
  blockType: 'stats'
  header?: Header | null
  items?: { value: string; suffix?: string | null; label: string; note?: string | null; id?: Id }[] | null
}
export type LegacyIntegrations = Base & {
  blockType: 'integrations'
  header: Header
  visual?: Visual | null
  groups?: TreeGroup[] | null
  links?: LinkRow[] | null
}

export type LegacyBlock =
  | LegacyFeatureStory
  | LegacyCtaSection
  | LegacyPillars
  | LegacyCardGrid
  | LegacySteps
  | LegacyStats
  | LegacyIntegrations

type ItemRow = NonNullable<ItemsBlock['items']>[number]
type Part = [suffix: string, block: SectionBlock]

/**
 * `withHeader`: ids of the legacy blocks that get a heading part (see `headerTextIds`). The page
 * layout is shared across locales, so the parts must not depend on one locale's text. Blocks
 * without an id, or calls without the set (the seed), decide by their own heading or lead.
 */
export type SplitOptions = { withHeader?: ReadonlySet<string> }

export const isLegacyBlock = (block: unknown): block is LegacyBlock =>
  (legacySectionSlugs as readonly string[]).includes((block as { blockType?: string } | null)?.blockType || '')

const gapFor = (spacing: OldSpacing | null | undefined): Gap => (spacing === 'compact' ? 'tight' : spacing === 'none' ? 'none' : 'auto')

/** The background each old block had when none was stored. */
const defaultBackground: Partial<Record<LegacyBlock['blockType'], Background>> = { stats: 'tinted', integrations: 'tinted', ctaSection: 'dark' }

/**
 * Common fields for the generated parts: background and hidden on every part (a part may also
 * hide itself), anchor and the old spacing only at the group's edges, ids derived from the old id
 * so every locale pass writes the same rows.
 */
const finish = (old: LegacyBlock, parts: Part[]): SectionBlock[] =>
  parts.map(([suffix, block], i) => {
    const settings: NonNullable<HeadingBlock['settings']> = {
      background: old.settings?.background || defaultBackground[old.blockType] || 'default',
      gapTop: i === 0 ? gapFor(old.settings?.spacing) : 'auto',
      gapBottom: i === parts.length - 1 ? gapFor(old.settings?.spacing) : 'auto',
      ...(i === 0 && old.settings?.anchor ? { anchor: old.settings.anchor } : {}),
    }
    return {
      ...block,
      ...(old.id ? { id: `${old.id}-${suffix}` } : {}),
      ...(old.blockName ? { blockName: old.blockName } : {}),
      hidden: Boolean(old.hidden) || block.hidden === true,
      settings,
    } as SectionBlock
  })

const hasHeaderText = (header: Header | null | undefined): boolean => Boolean(header?.heading || header?.lead)

/** Ids of legacy blocks whose heading or lead is filled in any of the given per-locale layouts. */
export const headerTextIds = (layouts: readonly (readonly unknown[])[]): Set<string> =>
  new Set(
    layouts.flatMap((layout) =>
      layout.filter((b): b is LegacyBlock => isLegacyBlock(b) && Boolean(b.id) && hasHeaderText(b.header)).map((b) => b.id as string),
    ),
  )

const headingPart = (
  old: LegacyBlock,
  options: SplitOptions,
  align: 'left' | 'center' | 'right',
  extra: Partial<HeadingBlock> = {},
): Part[] => {
  const { header } = old
  const show = options.withHeader && old.id ? options.withHeader.has(old.id) : hasHeaderText(header)
  return show
    ? [['heading', { blockType: 'heading', header: { eyebrow: header?.eyebrow ?? null, heading: header?.heading ?? null, lead: header?.lead ?? null, align }, size: 'h2', links: [], ...extra }]]
    : []
}

const itemsPart = (suffix: string, style: ItemsBlock['style'], items: ItemRow[], o: Partial<Pick<ItemsBlock, 'columns' | 'frame' | 'divider'>> = {}): Part[] =>
  items.length > 0 ? [[suffix, { blockType: 'items', style, columns: o.columns || 'auto', frame: o.frame || 'none', divider: o.divider || false, items }]] : []

const actionsPart = (links: LinkRow[] | null | undefined, align: ActionsBlock['align']): Part[] =>
  (links || []).length > 0 ? [['actions', { blockType: 'actions', links: links as LinkRow[], align }]] : []

/** One old block → its section blocks, in page order. See the mapping table in the spec. */
export const splitLegacyBlock = (old: LegacyBlock, options: SplitOptions = {}): SectionBlock[] => {
  switch (old.blockType) {
    case 'featureStory': {
      const visual = old.visual || { type: 'illustration' as const, illustration: 'builder' as const }
      if (old.layout === 'visual-left' || old.layout === 'visual-right') {
        return finish(old, [
          [
            'split',
            {
              blockType: 'split',
              header: { eyebrow: old.header.eyebrow ?? null, heading: old.header.heading ?? null, lead: old.header.lead ?? null },
              mediaSide: old.layout === 'visual-left' ? 'left' : 'right',
              visual,
              points: old.points || [],
              links: old.links || [],
            },
          ],
        ])
      }
      return finish(old, [
        ...headingPart(old, options, 'left'),
        ['media', { blockType: 'media', visual, width: 'full' }],
        ...itemsPart('items', 'points', (old.points || []).map((p) => ({ id: p.id, icon: p.icon, title: p.title, text: p.text })), { divider: true }),
        ...actionsPart(old.links, 'left'),
      ])
    }
    case 'ctaSection':
      return finish(old, headingPart(old, options, 'center', { size: 'display', links: old.links || [] }))
    case 'pillars': {
      const pillars = old.pillars || []
      return finish(old, [
        ...headingPart(old, options, 'center'),
        ...itemsPart('cards', 'cards', pillars.map((p) => ({ id: p.id, icon: p.icon, title: p.title, text: p.text })), {
          frame: 'panel',
          columns: pillars.length === 4 ? '4' : '3',
        }),
        ...itemsPart(
          'stats',
          'stats',
          (old.tiles || []).map((t) => ({
            id: t.id,
            value: t.value,
            suffix: t.suffix,
            title: t.label,
            ...(t.text ? { text: t.text } : {}),
            ...(t.width ? { width: t.width } : {}),
            ...(t.links?.length ? { links: t.links } : {}),
          })),
          { frame: 'panel' },
        ),
      ])
    }
    case 'cardGrid':
      return finish(old, [
        ...headingPart(old, options, old.header.align || 'left'),
        ...itemsPart(
          'items',
          'cards',
          (old.cards || []).map((c) => ({
            id: c.id,
            icon: c.icon,
            title: c.title,
            text: c.text,
            size: old.layout === 'bento' ? c.size || 'sm' : 'sm',
            points: c.points || [],
            links: c.links || [],
          })),
          { columns: old.layout === 'grid-3' ? '3' : '4' },
        ),
      ])
    case 'steps':
      return finish(old, [
        ...headingPart(old, options, 'center'),
        ...itemsPart('items', 'steps', (old.steps || []).map((s) => ({ id: s.id, icon: s.icon, title: s.title, text: s.text }))),
      ])
    case 'stats':
      return finish(old, [
        ...headingPart(old, options, 'center'),
        ...itemsPart('items', 'stats', (old.items || []).map((s) => ({ id: s.id, value: s.value, suffix: s.suffix, title: s.label, text: s.note }))),
      ])
    case 'integrations': {
      const customImage = old.visual?.type === 'image' && Boolean(old.visual.image)
      // With an uploaded image the old block showed only the image; the tree keeps the groups, hidden.
      const tree: Part = ['tree', { blockType: 'integrationTree', groups: old.groups || [], hidden: customImage }]
      return finish(old, [
        ...headingPart(old, options, 'center'),
        tree,
        ...(customImage ? ([['media', { blockType: 'media', visual: old.visual as Visual, width: 'narrow' }]] as Part[]) : []),
        ...actionsPart(old.links, 'center'),
      ])
    }
  }
}

type WithSpacing = { settings?: { spacing?: OldSpacing | null; gapTop?: Gap | null; gapBottom?: Gap | null } | null }

/**
 * Widgets keep their block but move a non-default old spacing into both gaps. The old field is
 * reset to `default`, which marks the block as converted. Returns the same object when there is
 * nothing to do.
 */
export const convertWidgetSpacing = <B>(block: B): B => {
  const s = (block as WithSpacing).settings
  if (!s?.spacing || s.spacing === 'default') return block
  if ((s.gapTop && s.gapTop !== 'auto') || (s.gapBottom && s.gapBottom !== 'auto')) return block
  const gap = gapFor(s.spacing)
  return { ...block, settings: { ...s, spacing: 'default', gapTop: gap, gapBottom: gap } }
}

/** A whole layout: legacy blocks replaced in place, widget spacing converted, the rest untouched. */
export const splitLegacyLayout = (layout: readonly unknown[], options: SplitOptions = {}): unknown[] =>
  layout.flatMap((block) => (isLegacyBlock(block) ? splitLegacyBlock(block, options) : [convertWidgetSpacing(block)]))

export const needsSectionConversion = (layout: readonly unknown[] | null | undefined): boolean =>
  (layout || []).some((block) => isLegacyBlock(block) || convertWidgetSpacing(block) !== block)
