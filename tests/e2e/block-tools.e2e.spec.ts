import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import { paragraphs } from '../../src/endpoints/seed/lexical'
import config from '../../src/payload.config.js'
import { presetConsent } from '../helpers/consent'
import { login } from '../helpers/login'
import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'

const base = process.env.E2E_BASE_URL || 'http://localhost:3000'
const run = `${Date.now()}`
const context = { disableRevalidate: true }
const faq = (heading: string, hidden = false) => ({ blockType: 'faq', hidden, header: { heading }, items: [{ question: `${heading}?`, answer: paragraphs(['A']) }] })

test.describe('Block tools', () => {
  let payload: Payload
  let pageId: number
  let otherId: number

  test.beforeAll(async () => {
    await seedTestUser()
    payload = await getPayload({ config })
    const page = await payload.create({ collection: 'pages', locale: 'de', context, data: { title: `BT e2e ${run}`, slug: `bt-e2e-${run}`, _status: 'published', layout: [faq(`Versteckt ${run}`, true), faq(`Sichtbar ${run}`)] } as never })
    pageId = page.id
    const other = await payload.create({ collection: 'pages', locale: 'de', context, data: { title: `BT e2e Ziel ${run}`, slug: `bt-e2e-ziel-${run}`, _status: 'published', layout: [faq(`Ziel ${run}`)] } as never })
    otherId = other.id
  })

  test.afterAll(async () => {
    await payload.delete({ collection: 'pages', where: { slug: { in: [`bt-e2e-${run}`, `bt-e2e-ziel-${run}`] } }, context })
    await cleanupTestUser()
  })

  test('a hidden block does not render, the visible one does', async ({ page, context: browser }) => {
    await presetConsent(browser)
    await page.goto(`${base}/de/bt-e2e-${run}`)
    await expect(page.getByRole('heading', { name: `Sichtbar ${run}`, exact: true })).toBeVisible()
    await expect(page.getByText(`Versteckt ${run}`)).toHaveCount(0)
  })

  test('the admin marks the hidden block and can copy a block to another page', async ({ page }) => {
    await login({ page, serverURL: base, user: testUser })
    await page.goto(`${base}/admin/collections/pages/${pageId}`)
    await page.locator('.tabs-field__tab-button', { hasText: /Inhalt|Content/ }).click()
    await expect(page.locator('.blocks-field__block-header').first().getByText(/Ausgeblendet|Hidden/)).toBeVisible()
    await expect(page.locator('.blocks-field__block-header').nth(1).getByText(/Ausgeblendet|Hidden/)).toHaveCount(0)

    // Expand the second block and copy it.
    const second = page.locator('.blocks-field__row').nth(1)
    await second.locator('.collapsible__toggle').first().click()
    await second.getByRole('button', { name: /Auf andere Seite kopieren|Copy to another page/ }).click()
    await page.locator('.rs__control').last().click()
    await page.getByText(`BT e2e Ziel ${run}`, { exact: true }).click()
    await page.getByRole('button', { name: /^(Kopieren|Copy)$/ }).click()
    await expect(page.getByText(/Kopiert nach|Copied to/)).toBeVisible()

    const draft = (await payload.findByID({ collection: 'pages', id: otherId, draft: true, depth: 0, locale: 'de' })) as { layout: { header: { heading: string } }[] }
    expect(draft.layout.map((b) => b.header.heading)).toEqual([`Ziel ${run}`, `Sichtbar ${run}`])

    // Hide the expanded block with the switch: the header pill and the notice appear.
    const toggle = second.getByRole('switch')
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'false')
    await expect(second.locator('.blocks-field__block-header').getByText(/Ausgeblendet|Hidden/)).toBeVisible()
    await expect(second.getByText(/Erscheint nicht auf der Website|Not shown on the website/)).toBeVisible()
  })
})
