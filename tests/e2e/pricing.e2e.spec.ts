import { expect, test } from '@playwright/test'

import { presetConsent } from '../helpers/consent'

const base = 'http://localhost:3000'

test.beforeEach(async ({ context }) => {
  await presetConsent(context)
})

test.describe('Pricing page', () => {
  test('renders plans from the configured source and switches billing period', async ({ page }) => {
    await page.goto(`${base}/de/pricing`)
    await expect(page).toHaveTitle(/Preise/)
    await expect(page.locator('[data-pricing-status]')).toHaveAttribute('data-pricing-status', 'ok')
    const cards = page.locator('[data-family="indicate-app"] > li')
    await expect(cards).toHaveCount(3)
    await expect(cards.nth(1)).toContainText('Beliebt')
    await expect(cards.nth(2)).toContainText('Individuell')

    await page.getByRole('radio', { name: /Jährlich/ }).click()
    await expect(cards.nth(0)).toContainText(/90\s€/)
    await expect(cards.nth(0)).toContainText(/1\.080\s€/)
    await expect(cards.nth(0).getByRole('link')).toHaveAttribute('href', /rate=yearly_eur/)
  })

  test('shows add-ons and the grouped comparison', async ({ page }) => {
    await page.goto(`${base}/de/pricing`)
    await expect(page.locator('[data-family="indicate-agent"] > li')).toHaveCount(4)
    const table = page.locator('table')
    await expect(table.locator('th[scope="colgroup"]')).toHaveCount(5)
    await expect(table.locator('tr[data-feature="resi_credits"]')).toContainText(/500 pro Monat/)
    await expect(table.locator('tfoot').getByRole('link')).toHaveCount(3)
    await expect(table.locator('tfoot').getByRole('link', { name: 'Kontakt aufnehmen' })).toBeVisible()
    await page.getByRole('link', { name: /Alle Leistungen vergleichen/ }).click()
    await expect(page).toHaveURL(/#comparison$/)
  })

  test.describe('Mobile', () => {
    test.use({ viewport: { width: 390, height: 844 } })
    test('offers one plan at a time in the comparison', async ({ page }) => {
      await page.goto(`${base}/de/pricing`)
      const tabs = page.getByRole('tablist', { name: 'Paket wählen' })
      await expect(tabs.getByRole('tab', { name: 'Pro' })).toHaveAttribute('aria-selected', 'true')
      await tabs.getByRole('tab', { name: 'Core' }).click()
      await expect(page.locator('[role="tabpanel"] li[data-feature="pipelines"]')).toContainText('3')
      await expect(page.locator('[data-comparison-cta="core"]').getByRole('link', { name: 'Core wählen' })).toBeVisible()
    })
  })

  test('links from the navigation', async ({ page }) => {
    await page.goto(`${base}/en`)
    await page.getByRole('navigation', { name: 'Main navigation' }).first().getByRole('link', { name: 'Pricing' }).click()
    await expect(page).toHaveURL(/\/en\/pricing$/)
  })
})
