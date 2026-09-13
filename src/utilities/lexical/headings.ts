export type LexicalNode = {
  type?: string
  tag?: string
  text?: string
  children?: LexicalNode[]
}

export type DocHeading = { id: string; text: string; level: 2 | 3 }

/** URL-safe id from heading text: lowercase ASCII, hyphens, never empty. */
export const slugify = (text: string): string => {
  const slug = text
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'abschnitt'
}

/** Hands out unique ids for one document: `kontakt`, `kontakt-2`, `kontakt-3`. */
export class HeadingIds {
  private seen = new Map<string, number>()

  next(text: string): string {
    const base = slugify(text)
    const count = (this.seen.get(base) || 0) + 1
    this.seen.set(base, count)
    return count === 1 ? base : `${base}-${count}`
  }
}

/** Concatenated text of a node and its descendants. */
export const nodeText = (node: LexicalNode): string =>
  typeof node.text === 'string' ? node.text : (node.children || []).map(nodeText).join('')

const LEVELS: Record<string, 2 | 3> = { h2: 2, h3: 3 }

/**
 * h2/h3 headings of a Lexical document with the same ids `RichText` renders
 * (both use `HeadingIds`, so the TOC and the anchors always match).
 */
export const extractHeadings = (doc?: { root?: LexicalNode } | null): DocHeading[] => {
  if (!doc?.root) return []
  const ids = new HeadingIds()
  const out: DocHeading[] = []
  const walk = (node: LexicalNode) => {
    if (node.type === 'heading' && node.tag) {
      const text = nodeText(node).trim()
      const level = LEVELS[node.tag]
      // Every heading consumes an id so numbering matches RichText, which ids h4 too.
      const id = ids.next(text)
      if (level) out.push({ id, text, level })
      return
    }
    for (const child of node.children || []) walk(child)
  }
  walk(doc.root)
  return out
}
