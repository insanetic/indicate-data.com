export const itemStyles = ['points', 'cards', 'steps', 'stats'] as const
export type ItemStyle = (typeof itemStyles)[number]
export type Columns = 2 | 3 | 4 | 5

/** `auto` repeats what each style looked like as a block of its own. */
export const resolveColumns = (style: ItemStyle, setting: string | null | undefined, count: number): Columns => {
  if (setting && setting !== 'auto') return Number(setting) as Columns
  if (style === 'points') return count >= 4 ? 4 : 3
  if (style === 'stats') return count >= 5 ? 5 : count === 4 ? 4 : 3
  return 3
}

/** Literal class names so Tailwind finds them. Phones stack, small screens show two. */
export const gridColumns: Record<Columns, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-5',
}
