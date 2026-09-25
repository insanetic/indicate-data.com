import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config.js'
import { presetConsent } from '../helpers/consent'

const base = process.env.E2E_BASE_URL || 'http://localhost:3000'
const run = `${Date.now()}`
const context = { disableRevalidate: true }
const link = (label: string, appearance: 'default' | 'outline' | 'link') => ({ link: { type: 'custom', url: '/contact', label, appearance } })

test.describe('Section blocks', () => {
  let payload: Payload

  test.beforeAll(async () => {
    payload = await getPayload({ config })
    await payload.create({
      collection: 'pages', locale: 'de', context,
      data: {
        title: `Sections e2e ${run}`, slug: `sections-e2e-${run}`, _status: 'published',
        layout: [
          { blockType: 'heading', header: { eyebrow: 'Für Hotels', heading: `Links ${run}`, lead: 'Einleitung rechts', align: 'left' }, links: [link('Demo', 'default')] },
          { blockType: 'media', visual: { type: 'illustration', illustration: 'dashboard' } },
          { blockType: 'items', style: 'points', divider: true, items: [1, 2, 3, 4].map((n) => ({ icon: 'chart', title: `Punkt ${n}`, text: 'Text' })) },
          { blockType: 'actions', links: [link('Mehr', 'link')] },
          { blockType: 'heading', header: { heading: `Rechts ${run}`, lead: 'Einleitung links', align: 'right' } },
        ],
      } as never,
    })
  })

  test.afterAll(async () => {
    await payload.delete({ collection: 'pages', where: { slug: { equals: `sections-e2e-${run}` } }, context })
  })

  test('renders the group with automatic gaps and both heading variants', async ({ page, context: browser }) => {
    await presetConsent(browser)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${base}/de/sections-e2e-${run}`)

    await expect(page.getByRole('heading', { level: 1, name: `Links ${run}` })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Demo', exact: true })).toBeVisible()
    await expect(page.getByText('Punkt 4')).toBeVisible()

    const pads = await page.locator('main section').evaluateAll((els) => els.map((el) => [getComputedStyle(el).paddingTop, getComputedStyle(el).paddingBottom]))
    // heading → media → items → actions form one group (md: normal 112px, tight 48px); the second heading opens a new one.
    expect(pads.slice(-5)).toEqual([['112px', '0px'], ['48px', '0px'], ['48px', '0px'], ['48px', '112px'], ['112px', '112px']])

    // Right variant: the lead sits left of the heading.
    const lead = await page.getByText('Einleitung links').boundingBox()
    const heading = await page.getByRole('heading', { name: `Rechts ${run}` }).boundingBox()
    expect(lead!.x).toBeLessThan(heading!.x)
  })

  test('on a phone the right variant stacks heading above lead', async ({ page, context: browser }) => {
    await presetConsent(browser)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${base}/de/sections-e2e-${run}`)
    const lead = await page.getByText('Einleitung links').boundingBox()
    const heading = await page.getByRole('heading', { name: `Rechts ${run}` }).boundingBox()
    expect(heading!.y).toBeLessThan(lead!.y)
  })

  test('steps: the pinned scene follows the step in view, and the scene comes first on phones', async ({ page, context: browser }) => {
    const slug = `steps-e2e-${run}`
    await payload.create({
      collection: 'pages', locale: 'de', context,
      data: {
        title: `Steps e2e ${run}`, slug, _status: 'published',
        layout: [{
          blockType: 'split', header: { heading: `Schritte ${run}` }, pointStyle: 'steps',
          visual: { type: 'illustration', illustration: 'semanticLayer' },
          points: [
            { title: 'Eins', text: 'A' },
            { title: 'Zwei', text: 'B', ownVisual: true, visual: { type: 'illustration', illustration: 'kpiStudio' } },
            { title: 'Drei', text: 'C', ownVisual: true, visual: { type: 'illustration', illustration: 'dimensions' } },
          ],
        }],
      } as never,
    })
    try {
      await presetConsent(browser)
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(`${base}/de/${slug}`)
      const layers = page.locator('[data-scene-layer]')
      await expect(layers).toHaveCount(3)
      await page.getByText('Drei', { exact: true }).scrollIntoViewIfNeeded()
      await page.getByText('Drei', { exact: true }).evaluate((el) => el.closest('li')!.scrollIntoView({ block: 'center' }))
      await expect(layers.nth(2)).toHaveAttribute('data-visible', 'true')
      await expect(page.locator('li[data-active="true"]')).toContainText('Drei')

      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(`${base}/de/${slug}`)
      const scene = await page.locator('[data-mobile-top-scene]').boundingBox()
      const heading = await page.getByRole('heading', { name: `Schritte ${run}` }).boundingBox()
      expect(scene!.y).toBeLessThan(heading!.y)
    } finally {
      await payload.delete({ collection: 'pages', where: { slug: { equals: slug } }, context })
    }
  })
})
