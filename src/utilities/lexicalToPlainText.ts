type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] }

/** Flattens a Lexical rich-text document to plain text (for JSON-LD, previews, search). */
export const lexicalToPlainText = (doc?: { root?: LexicalNode } | null): string => {
  if (!doc?.root) return ''
  const walk = (node: LexicalNode): string => {
    if (typeof node.text === 'string') return node.text
    const inner = (node.children || []).map(walk).join('')
    return node.type === 'paragraph' || node.type === 'listitem' || node.type?.startsWith('heading')
      ? `${inner}\n`
      : inner
  }
  return walk(doc.root).replace(/\n+/g, ' ').trim()
}
