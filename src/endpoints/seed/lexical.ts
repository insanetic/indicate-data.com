/** Minimal Lexical documents for seeding rich-text fields. */
export const paragraphs = (texts: string[]) => ({
  root: {
    type: 'root',
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: texts.map((text) => ({
      type: 'paragraph',
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      textFormat: 0,
      version: 1,
      children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }],
    })),
  },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SeedNode = Record<string, any> & { type: string; children?: SeedNode[] }

const base = { direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }

const text = (t: string, format = 0): SeedNode => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text: t,
  version: 1,
})

/** `**bold**` and `[label](url)` inside one line of text. */
export const inline = (line: string): SeedNode[] => {
  const out: SeedNode[] = []
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  for (const m of line.matchAll(re)) {
    if (m.index! > last) out.push(text(line.slice(last, m.index)))
    if (m[1] !== undefined) out.push(text(m[1], 1))
    else
      out.push({
        type: 'link',
        ...base,
        version: 3,
        fields: { linkType: 'custom', url: m[3], newTab: /^https?:/.test(m[3]) },
        children: [text(m[2])],
      })
    last = m.index! + m[0].length
  }
  if (last < line.length) out.push(text(line.slice(last)))
  return out
}

/** One paragraph; several lines become soft line breaks (rendered as `<br>`). */
const paragraph = (...lines: string[]): SeedNode => ({
  type: 'paragraph',
  ...base,
  textFormat: 0,
  children: lines.flatMap((line, i) => (i === 0 ? inline(line) : [{ type: 'linebreak', version: 1 }, ...inline(line)])),
})

const list = (items: string[], ordered: boolean): SeedNode => ({
  type: 'list',
  ...base,
  listType: ordered ? 'number' : 'bullet',
  tag: ordered ? 'ol' : 'ul',
  start: 1,
  children: items.map((item, i) => ({ type: 'listitem', ...base, value: i + 1, children: inline(item) })),
})

const cell = (content: string, header: boolean): SeedNode => ({
  type: 'tablecell',
  ...base,
  headerState: header ? 1 : 0,
  colSpan: 1,
  rowSpan: 1,
  backgroundColor: null,
  children: [paragraph(content)],
})

const table = (rows: string[]): SeedNode => {
  const cells = rows
    .filter((r) => !/^\|?\s*:?-{2,}/.test(r))
    .map((r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
  return {
    type: 'table',
    ...base,
    children: cells.map((row, ri) => ({ type: 'tablerow', ...base, children: row.map((c) => cell(c, ri === 0)) })),
  }
}

/**
 * Tiny markdown subset → Lexical, for seeding long documents. Blocks are separated by blank
 * lines: `##`/`###`/`####` headings, `- ` bullets, `1. ` numbers, `> ` quotes, `---` rules,
 * `|` tables, everything else a paragraph. Several lines inside one paragraph block become
 * soft line breaks (`<br>`); quote lines still join with a space. Inline: `**bold**`,
 * `[label](url)`.
 */
export const richText = (md: string): { root: SeedNode & { children: SeedNode[] } } => {
  const blocks = md
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)

  const children: SeedNode[] = blocks.map((block) => {
    const lines = block.split('\n').map((l) => l.trim())
    const first = lines[0]
    const heading = first.match(/^(#{2,4})\s+(.+)$/)
    if (heading && lines.length === 1) {
      return { type: 'heading', ...base, tag: `h${heading[1].length}`, children: inline(heading[2]) }
    }
    if (first === '---') return { type: 'horizontalrule', version: 1 }
    if (lines.every((l) => /^- /.test(l))) return list(lines.map((l) => l.slice(2)), false)
    if (lines.every((l) => /^\d+\. /.test(l))) return list(lines.map((l) => l.replace(/^\d+\. /, '')), true)
    if (lines.every((l) => l.startsWith('|'))) return table(lines)
    if (lines.every((l) => l.startsWith('> '))) {
      return { type: 'quote', ...base, children: inline(lines.map((l) => l.slice(2)).join(' ')) }
    }
    return paragraph(...lines)
  })

  return { root: { type: 'root', ...base, children } }
}
