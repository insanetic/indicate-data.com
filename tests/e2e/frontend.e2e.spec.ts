import { test, expect } from '@playwright/test'

const base = 'http://localhost:3000'

test.describe('Locale redirect', () => {
  test('sends an English browser to /en', async ({ page }) => {
    await page.goto(base)
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test.describe('German browser', () => {
    test.use({ locale: 'de-DE' })
    test('sends a German browser to /de', async ({ page }) => {
      await page.goto(base)
      await expect(page).toHaveURL(/\/de$/)
      await expect(page.locator('html')).toHaveAttribute('lang', 'de-DE')
    })
  })

  test.describe('Unknown language', () => {
    test.use({ locale: 'fr-FR' })
    test('falls back to German', async ({ page }) => {
      await page.goto(base)
      await expect(page).toHaveURL(/\/de$/)
    })
  })
})

test.describe('Home page', () => {

  test('renders the hero, navigation and sections', async ({ page }) => {
    await page.goto(`${base}/de`)
    await expect(page).toHaveTitle(/Indicate Data/)
    await expect(page.locator('h1').first()).toContainText('Hotelzahlen')
    await expect(page.getByRole('navigation', { name: 'Hauptnavigation' }).first()).toBeVisible()
    await expect(page.locator('#agent')).toBeVisible()
    await expect(page.locator('#pricing')).toBeVisible()
    await expect(page.locator('#faq')).toBeVisible()
  })

  test('switches the language and keeps the page', async ({ page }) => {
    await page.goto(`${base}/de`)
    await page.getByRole('link', { name: 'English' }).first().click()
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('h1').first()).toContainText('hotel number')
  })

  test('product tabs switch panels with the keyboard', async ({ page }) => {
    await page.goto(`${base}/de`)
    const tabs = page.getByRole('tab')
    await expect(tabs).toHaveCount(4)
    await tabs.nth(0).focus()
    await page.keyboard.press('ArrowRight')
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('tabpanel').first()).toContainText('Vorjahr')
  })

  test('faq opens and closes', async ({ page }) => {
    await page.goto(`${base}/de#faq`)
    const second = page.locator('#faq button[aria-expanded]').nth(1)
    await second.click()
    await expect(second).toHaveAttribute('aria-expanded', 'true')
    await second.click()
    await expect(second).toHaveAttribute('aria-expanded', 'false')
  })

  test('renders without motion when reduced motion is preferred', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`${base}/de`)
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    const opacity = await h1.evaluate((el) => getComputedStyle(el).opacity)
    expect(Number(opacity)).toBe(1)
  })
})
