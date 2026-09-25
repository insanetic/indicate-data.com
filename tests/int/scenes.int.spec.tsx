import { render } from '@testing-library/react'
import fs from 'node:fs'
import path from 'node:path'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { illustrations } from '@/components/Illustrations'

/** The hero scenes rebuilt on the wired stage, with the stylesheet each one owns. */
const scenes = [
  { key: 'agentChat', file: 'AgentChat.tsx', css: 'team.css' },
  { key: 'mcp', file: 'Mcp.tsx', css: 'mcp.css' },
  { key: 'kpiStudio', file: 'KpiStudio.tsx', css: 'studio.css' },
  { key: 'governance', file: 'Governance.tsx', css: 'access.css' },
  { key: 'templates', file: 'Templates.tsx', css: 'rollout.css' },
  { key: 'stage', file: 'HotelStage.tsx', css: 'morning.css' },
] as const

const root = process.cwd()
const read = (...p: string[]) => fs.readFileSync(path.join(root, ...p), 'utf8')

describe.each(scenes)('$key scene', ({ key, file, css }) => {
  for (const locale of ['de', 'en'] as const) {
    it(`renders on the scene frame with three exchanges (${locale})`, () => {
      const Scene = illustrations[key]
      const { container } = render(<Scene locale={locale} />)
      const frame = container.querySelector('[role="img"]')
      expect(frame).not.toBeNull()
      expect(frame?.classList.contains('scene')).toBe(true)
      expect(frame?.getAttribute('aria-label')?.length).toBeGreaterThan(10)
      for (const slot of ['0', '1', '2']) {
        expect(container.querySelector(`[data-slot="${slot}"]`), `data-slot ${slot}`).not.toBeNull()
      }
    })

    it(`only shows marks that exist (${locale})`, () => {
      const Scene = illustrations[key]
      const { container } = render(<Scene locale={locale} />)
      for (const img of container.querySelectorAll('img')) {
        const src = img.getAttribute('src') || ''
        expect(src.startsWith('/'), src).toBe(true)
        expect(fs.existsSync(path.join(root, 'public', src)), src).toBe(true)
      }
    })

    it(`sets every mention of Resi in the gradient and has no letter avatars (${locale})`, () => {
      const Scene = illustrations[key]
      const { container } = render(<Scene locale={locale} />)
      const mentions = (container.textContent || '').match(/\bResi\b/g)?.length ?? 0
      expect(container.querySelectorAll('.resi-name').length).toBe(mentions)
      for (const el of container.querySelectorAll('span, div, p')) {
        if (el.children.length === 0) expect(el.textContent?.trim()).not.toBe('AI')
      }
    })
  }

  it('keeps colours on tokens and strokes unstretched', () => {
    const source = read('src/components/Illustrations', file)
    const styles = read('src/app/(frontend)/scenes', css)
    expect(source).not.toMatch(/oklch\(/)
    expect(styles).not.toMatch(/oklch\(/)
    expect(source).not.toMatch(/preserveAspectRatio="none"/)
    expect(source).not.toMatch(/vectorEffect/)
    // Draw tracks never use a bare `1` dash (the stray cap dot).
    expect(styles).not.toMatch(/stroke-dasharray:\s*1\s*;/)
  })
})
