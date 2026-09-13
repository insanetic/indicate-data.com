import type { BrowserContext } from '@playwright/test'

/** Presets the consent cookie so the banner does not block other tests. */
export async function presetConsent(context: BrowserContext, granted = false): Promise<void> {
  const record = { v: 1, t: new Date().toISOString(), c: { analytics: granted, marketing: granted } }
  await context.addCookies([
    {
      name: 'consent',
      value: encodeURIComponent(JSON.stringify(record)),
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
    },
  ])
}
