import { expect, test } from '@playwright/test'

const base = 'http://localhost:3000'
const skipWithoutGtm = () => test.skip(!process.env.NEXT_PUBLIC_GTM_ID, 'NEXT_PUBLIC_GTM_ID not set')

test.describe('Cookie consent', () => {
  test('first visit shows the banner and reject loads nothing', async ({ page }) => {
    skipWithoutGtm()
    const gtmRequests: string[] = []
    page.on('request', (req) => {
      if (req.url().includes('googletagmanager.com')) gtmRequests.push(req.url())
    })
    await page.goto(`${base}/de`)
    const banner = page.getByRole('region', { name: /Cookies/ })
    await expect(banner).toBeVisible()
    await expect(banner).toContainText('widerrufen')
    await banner.getByRole('button', { name: 'Nur notwendige' }).click()
    await expect(banner).toBeHidden()
    await page.waitForLoadState('networkidle')
    expect(gtmRequests).toHaveLength(0)
    const cookies = await page.context().cookies()
    const consent = cookies.find((c) => c.name === 'consent')
    expect(consent).toBeTruthy()
    expect(JSON.parse(decodeURIComponent(consent!.value)).id).toMatch(/^[A-Za-z0-9-]+$/)
    expect(cookies.find((c) => c.name.startsWith('_ga'))).toBeUndefined()
  })

  test('accept loads GTM and logs the decision', async ({ page }) => {
    skipWithoutGtm()
    const gtm = page.waitForRequest((req) => req.url().includes('googletagmanager.com/gtm.js'))
    const log = page.waitForResponse((res) => res.url().endsWith('/api/consent/log'))
    await page.goto(`${base}/de`)
    await page.getByRole('button', { name: 'Alle akzeptieren' }).click()
    await gtm
    expect((await log).status()).toBe(204)
  })

  test('floating button and footer link reopen the settings', async ({ page }) => {
    skipWithoutGtm()
    await page.goto(`${base}/de`)
    await page.getByRole('button', { name: 'Nur notwendige' }).click()
    const floating = page.locator('[data-consent="floatingTrigger"]')
    await expect(floating).toBeVisible()
    await floating.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(page.getByRole('switch').first()).toHaveAttribute('aria-disabled', 'true')
    await expect(page.getByRole('switch').nth(1)).toHaveAttribute('aria-checked', 'false')
    await dialog.getByRole('button', { name: 'Schließen' }).click()
    await expect(dialog).toBeHidden()
    await page.locator('footer').getByRole('button', { name: 'Cookie-Einstellungen' }).click()
    await expect(dialog).toBeVisible()
  })

  test('#cookie-settings opens the dialog on any page', async ({ page }) => {
    skipWithoutGtm()
    await page.goto(`${base}/de`)
    await page.getByRole('button', { name: 'Nur notwendige' }).click()
    await page.goto(`${base}/de/privacy-policy#cookie-settings`)
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    expect(new URL(page.url()).hash).toBe('')
  })
})
