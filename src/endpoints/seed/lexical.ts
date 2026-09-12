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
