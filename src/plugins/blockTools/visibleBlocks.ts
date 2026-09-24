/** Blocks that render on the website: everything an editor has not switched to hidden. */
export const visibleBlocks = <T extends object>(blocks: T[] | null | undefined): T[] =>
  Array.isArray(blocks) ? blocks.filter((block) => (block as { hidden?: boolean | null })?.hidden !== true) : []
