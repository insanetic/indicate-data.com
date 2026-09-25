export const itemStyles = ['points', 'cards', 'steps', 'stats'] as const
export type ItemStyle = (typeof itemStyles)[number]
export type Columns = 2 | 3 | 4 | 5
export const statWidths = ['fifth', 'quarter', 'third', 'half', 'full'] as const
export type StatWidth = (typeof statWidths)[number]

/** `auto` repeats what each style looked like as a block of its own; two entries sit side by side. */
export const resolveColumns = (style: ItemStyle, setting: string | null | undefined, count: number): Columns => {
  if (setting && setting !== 'auto') return Number(setting) as Columns
  if (count === 2) return 2
  if (style === 'points') return count >= 4 ? 4 : 3
  if (style === 'stats') return count >= 5 ? 5 : count === 4 ? 4 : 3
  return 3
}

// Literal class names so Tailwind finds them.

/** One column, then all N from md (old Steps). */
const fromMd: Record<Columns, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
}

/** Separate cards, as the old CardGrid `grid-3` and `grid-4` layouts. */
const cardColumns: Record<Columns, string> = {
  2: 'sm:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-5',
}

/** Two on small screens, all N from lg (old FeatureStory points and Pillars tiles). */
const twoThenLg: Record<Columns, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-5',
}

/**
 * Numbers sit on a 60-track grid from lg so every entry can take 1/5, 1/4, 1/3, 1/2 or the
 * full row; `auto` takes one of the block's columns. Two per row on small screens, a full-width
 * entry spans both.
 */
const statSpans: Record<StatWidth, string> = {
  fifth: 'lg:col-span-12',
  quarter: 'lg:col-span-15',
  third: 'lg:col-span-20',
  half: 'lg:col-span-30',
  full: 'sm:col-span-2 lg:col-span-60',
}
const autoSpans: Record<Columns, StatWidth> = { 2: 'half', 3: 'third', 4: 'quarter', 5: 'fifth' }

export const statSpan = (width: string | null | undefined, columns: Columns): string =>
  statSpans[statWidths.includes(width as StatWidth) ? (width as StatWidth) : autoSpans[columns]]

/** Grid columns per style, so each style keeps the breakpoints of the block it replaces. */
export const gridClasses = (style: ItemStyle, columns: Columns): string => {
  if (style === 'stats') return 'sm:grid-cols-2 lg:grid-cols-60'
  if (style === 'steps') return fromMd[columns]
  if (style === 'cards') return cardColumns[columns]
  return twoThenLg[columns]
}
