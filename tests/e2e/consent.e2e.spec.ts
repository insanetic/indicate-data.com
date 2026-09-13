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
    await banner.getByRole('button', { name: 'Nur notwendige' }).click()
    await expect(banner).toBeHidden()
    await page.waitForTimeout(500)
    expect(gtmRequests).toHaveLength(0)
    const cookies = await page.context().cookies()
    expect(cookies.find((c) => c.name === 'consent')).toBeTruthy()
    expect(cookies.find((c) => c.name.startsWith('_ga'))).toBeUndefined()
  })

  test('accept loads GTM', async ({ page }) => {
    skipWithoutGtm()
    const gtm = page.waitForRequest((req) => req.url().includes('googletagmanager.com/gtm.js'))
    await page.goto(`${base}/de`)
    await page.getByRole('button', { name: 'Alle akzeptieren' }).click()
    await gtm
  })

  test('footer link reopens the settings', async ({ page }) => {
    skipWithoutGtm()
    await page.goto(`${base}/de`)
    await page.getByRole('button', { name: 'Nur notwendige' }).click()
    await page.getByRole('button', { name: 'Cookie-Einstellungen' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('switch').first()).toHaveAttribute('aria-disabled', 'true')
  })
})
