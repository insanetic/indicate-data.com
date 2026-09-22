import { test, expect } from '@playwright/test'
import { presetConsent } from '../helpers/consent'

const base = 'http://localhost:3000'

/**
 * The drawer used to live inside the sticky header. Once the page is scrolled the header bar
 * switches to `backdrop-blur`, and an element with a backdrop-filter becomes the containing block
 * for its `position: fixed` descendants: the drawer collapsed into the 4rem header box and the page
 * showed through it. These tests open the menu from a scrolled page, which is the only state where
 * that regression is visible.
 */
// A phone viewport, on the project's Chromium (a full device descriptor would pull in WebKit).
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

test.beforeEach(async ({ context }) => {
  await presetConsent(context)
})

type Page = import('@playwright/test').Page

/**
 * Scrolls down and waits until the offset stops moving. Lazily loaded media and the reveal
 * observer keep changing the document height for a moment after a scroll, and Chrome's scroll
 * anchoring moves the offset with it; measuring before that settles compares two different pages.
 */
const scrollAndSettle = async (page: Page, to: number) => {
  await page.evaluate((y) => window.scrollTo(0, y), to)
  await expect
    .poll(
      async () => {
        const first = await page.evaluate(() => window.scrollY)
        await page.waitForTimeout(250)
        const second = await page.evaluate(() => window.scrollY)
        return first === second
      },
      { timeout: 10_000 },
    )
    .toBe(true)
}

/**
 * Taps the trigger with a dispatched click. Playwright's own `click()` runs an actionability check
 * that scrolls the page first, which is exactly the movement these tests measure.
 */
const openMenu = async (page: Page) => {
  await page.getByRole('button', { name: /Menü öffnen/i }).dispatchEvent('click')
  await expect(page.getByRole('dialog')).toBeVisible()
  // Let the 300ms slide-in settle before measuring.
  await page.waitForTimeout(400)
}

test.describe('Mobile menu', () => {
  test('fills the viewport height when opened from a scrolled page', async ({ page }) => {
    await page.goto(`${base}/de`)
    await scrollAndSettle(page, 1500)
    await expect.poll(() => page.evaluate(() => document.querySelector('header')?.getAttribute('data-scrolled'))).toBe('true')

    await openMenu(page)

    const viewport = page.viewportSize()!
    const box = (await page.getByRole('dialog').boundingBox())!
    expect(box.height).toBeCloseTo(viewport.height, -1)
    expect(box.y).toBe(0)
    // Flush against the right edge, not pushed off screen.
    expect(Math.round(box.x + box.width)).toBeCloseTo(viewport.width, -1)
  })

  test('keeps the page behind it in place', async ({ page }) => {
    await page.goto(`${base}/de`)
    await scrollAndSettle(page, 1500)

    // Read the offset and open the drawer in one step: media still loading above the fold keeps
    // nudging the page, and a reading taken a moment earlier would not describe the same page.
    const before = await page.evaluate(() => {
      const trigger = [...document.querySelectorAll<HTMLButtonElement>('header button[aria-controls]')].find(
        (b) => b.offsetParent !== null,
      )!
      const top = document.querySelector('h1')!.getBoundingClientRect().top
      trigger.click()
      return { top, scrollY: window.scrollY }
    })
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.waitForTimeout(400)

    const during = await page.evaluate(() => ({
      top: document.querySelector('h1')!.getBoundingClientRect().top,
      locked: -parseInt(document.body.style.top || '0', 10),
    }))
    // The page behind sits where it did, held at the offset it had when the drawer opened.
    expect(during.locked).toBe(before.scrollY)
    expect(Math.abs(during.top - before.top)).toBeLessThan(2)

    // Close and read on the very next frame. The page keeps drifting by a few pixels on its own as
    // lazily loaded media arrives, so a reading taken later would measure that instead.
    const after = await page.evaluate(async () => {
      const close = document.querySelector<HTMLButtonElement>('[role="dialog"] button[aria-label]')!
      close.click()
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
      return { scrollY: window.scrollY, bodyPosition: document.body.style.position }
    })
    // Closing puts the offset back at once: no animated scroll, no clamp against the document
    // height the lock imposed.
    expect(after.bodyPosition).toBe('')
    expect(after.scrollY).toBe(before.scrollY)
  })

  test('is rendered above the page, outside the header', async ({ page }) => {
    await page.goto(`${base}/de`)
    await openMenu(page)
    const inHeader = await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')?.closest('header')))
    expect(inHeader).toBe(false)

    // A tap on the first navigation entry reaches the drawer, not the page underneath.
    const link = page.getByRole('dialog').getByRole('link').first()
    await expect(link).toBeVisible()
  })
})
