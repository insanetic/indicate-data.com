/**
 * Turns the retired Items `steps` row (and the Heading above it) into a Split block in steps mode.
 * Pure; used by `scripts/convert-steps.ts`, the split_steps migration and the seed.
 */
import type { HeadingBlock, ItemsBlock, SplitBlock } from '@/payload-types'
import type { IllustrationKey } from '@/components/Illustrations/registry'

type Scenes = { section: IllustrationKey; steps?: (IllustrationKey | null)[] }

/** Scene per page slug; `steps[i]` null means step i shows the section scene. See the spec's table. */
export const stepScenes: Record<string, Scenes> = {
  agent: { section: 'resi', steps: ['sources', null, 'dashboard'] },
  mcp: { section: 'semanticLayer', steps: [null, null, 'agentChat'] },
  'build-with-ai': { section: 'dashboard', steps: [null, null, 'alerts'] },
  dashboards: { section: 'comparison', steps: ['templates', null, 'team'] },
  'flying-kpis': { section: 'dashboard', steps: [null, null, 'alerts'] },
  integrations: { section: 'integrations', steps: [null, 'sources', null] },
  'kpi-studio': { section: 'semanticLayer', steps: [null, 'kpiStudio', 'dimensions', 'collections'] },
  governance: { section: 'team', steps: [null, null, 'governance'] },
}

const isSteps = (b: unknown): b is ItemsBlock => (b as ItemsBlock)?.blockType === 'items' && (b as ItemsBlock).style === 'steps'
const isHeading = (b: unknown): b is HeadingBlock => (b as HeadingBlock)?.blockType === 'heading'

const toSplit = (heading: HeadingBlock | null, steps: ItemsBlock, slug: string | null | undefined): SplitBlock => {
  const scenes = stepScenes[slug || ''] || { section: 'builder' }
  const head = heading && !heading.hidden ? heading : null
  return {
    blockType: 'split',
    id: `${(heading || steps).id}-split`,
    blockName: steps.blockName || heading?.blockName || null,
    hidden: Boolean(steps.hidden),
    header: { eyebrow: head?.header?.eyebrow ?? null, heading: head?.header?.heading ?? null, lead: head?.header?.lead ?? null },
    mediaSide: 'right',
    pointStyle: 'steps',
    visual: { type: 'illustration', illustration: scenes.section },
    points: (steps.items || []).map((row, i) => {
      const own = scenes.steps?.[i] || null
      return {
        id: row.id,
        icon: row.icon,
        title: row.title,
        text: row.text,
        ownVisual: Boolean(own),
        ...(own ? { visual: { type: 'illustration' as const, illustration: own } } : {}),
      }
    }),
    links: head?.links || [],
    settings: {
      background: steps.settings?.background || 'default',
      gapTop: (heading || steps).settings?.gapTop || 'auto',
      gapBottom: steps.settings?.gapBottom || 'auto',
      ...((heading || steps).settings?.anchor ? { anchor: (heading || steps).settings!.anchor } : {}),
    },
  } as SplitBlock
}

export const stepsToSplit = (layout: readonly unknown[], slug: string | null | undefined): unknown[] => {
  const out: unknown[] = []
  for (let i = 0; i < layout.length; i++) {
    const block = layout[i]
    const next = layout[i + 1]
    if (isHeading(block) && isSteps(next)) {
      // A visible heading over hidden steps keeps showing on its own.
      if (next.hidden && !block.hidden) out.push(block, toSplit(null, next, slug))
      else out.push(toSplit(block, next, slug))
      i++
    } else if (isSteps(block)) {
      out.push(toSplit(null, block, slug))
    } else {
      out.push(block)
    }
  }
  return out
}

export const needsStepsConversion = (layout: readonly unknown[] | null | undefined): boolean => (layout || []).some(isSteps)
