/**
 * Full-page screenshots of the seeded pages, desktop and mobile, for before/after comparisons:
 *   pnpm exec tsx scripts/screenshot-pages.ts <out-dir> [base-url]
 * Needs the site running (default http://localhost:3000). Reveal animations are forced visible.
 */
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

import { presetConsent } from '../tests/helpers/consent'

const [outDir, base = 'http://localhost:3000'] = process.argv.slice(2)
if (!outDir) throw new Error('usage: tsx scripts/screenshot-pages.ts <out-dir> [base-url]')

const slugs = ['', 'about', 'pricing', 'contact', 'agent', 'mcp', 'build-with-ai', 'integrations', 'kpi-studio', 'governance', 'dashboards', 'flying-kpis', 'hotels', 'hotel-groups', 'agencies']
const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } }

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()
for (const [name, viewport] of Object.entries(viewports)) {
  const context = await browser.newContext({ viewport })
  await presetConsent(context)
  const page = await context.newPage()
  for (const locale of ['de', 'en']) {
    for (const slug of slugs) {
      await page.goto(`${base}/${locale}/${slug}`, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.querySelectorAll('.reveal, .reveal-stagger > *').forEach((el) => el.setAttribute('data-in', '')))
      await page.waitForTimeout(300)
      await page.screenshot({ path: path.join(outDir, `${locale}-${slug || 'home'}-${name}.png`), fullPage: true })
    }
  }
  await context.close()
}
await browser.close()
