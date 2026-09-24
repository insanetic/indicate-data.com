/**
 * Vertical rhythm of a page built from flat blocks. Consecutive blocks that belong together form
 * a group: the group gets the full section gap at its outer edges and a tight gap between its
 * blocks. An explicit gap on a block always wins for that side, which is how an editor marks a
 * block as the first or last of a group.
 */
export type Gap = 'auto' | 'none' | 'tight' | 'normal' | 'large'
export type ResolvedGap = Exclude<Gap, 'auto'>
export type Background = 'default' | 'tinted' | 'dark' | 'accent'

export type RhythmBlock = {
  blockType: string
  header?: { heading?: string | null } | null
  /** Widgets like Spotlight keep their heading at the top level instead of in a header group. */
  heading?: string | null
  settings?: { background?: Background | null; gapTop?: Gap | null; gapBottom?: Gap | null } | null
}

export type Rhythm = { top: ResolvedGap; bottom: ResolvedGap; groupStart: boolean; groupEnd: boolean }

/** Blocks that never open a group: they continue the block above them. */
export const partSlugs = ['media', 'items', 'actions', 'integrationTree'] as const
/** Blocks that always open a group. */
export const leaderSlugs = ['heading', 'split'] as const

const isPart = (b: RhythmBlock) => (partSlugs as readonly string[]).includes(b.blockType)
const isLeader = (b: RhythmBlock) => (leaderSlugs as readonly string[]).includes(b.blockType)
const background = (b: RhythmBlock): Background => b.settings?.background || 'default'

/**
 * A block opens a group when it is the first, changes the background, is a heading or split, or
 * is a widget with its own heading (in its header group or at the top level). A widget without a
 * heading continues a group that a heading, split or part started (a Heading block above an FAQ);
 * after another widget it opens its own.
 */
export const startsGroup = (block: RhythmBlock, prev: RhythmBlock | undefined): boolean => {
  if (!prev) return true
  if (background(block) !== background(prev)) return true
  if (isLeader(block)) return true
  if (isPart(block)) return false
  if (block.header?.heading || block.heading) return true
  return !(isLeader(prev) || isPart(prev))
}

/** Gaps for the visible blocks of a page, in order. Hidden blocks must be filtered out first. */
export const resolveSpacing = (blocks: RhythmBlock[]): Rhythm[] => {
  const starts = blocks.map((b, i) => startsGroup(b, blocks[i - 1]))
  return blocks.map((b, i) => {
    const groupStart = starts[i]
    const groupEnd = i === blocks.length - 1 || starts[i + 1]
    const top = b.settings?.gapTop
    const bottom = b.settings?.gapBottom
    return {
      top: top && top !== 'auto' ? top : groupStart ? 'normal' : 'tight',
      bottom: bottom && bottom !== 'auto' ? bottom : groupEnd ? 'normal' : 'none',
      groupStart,
      groupEnd,
    }
  })
}
