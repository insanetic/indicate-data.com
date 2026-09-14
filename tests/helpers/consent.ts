import type { BrowserContext } from '@playwright/test'

import { consentGlobal } from '../../src/endpoints/seed/consent'

/** Revision the seed installs; a record below it makes the banner reappear. */
const seededRevision = consentGlobal(() => '', { legal: {} } as never).revision || 1

/** Presets the consent cookie so the banner does not block other tests. */
export async function presetConsent(context: BrowserContext, granted = false): Promise<void> {
  const record = {
    id: 'e2e-preset-0000000000',
    v: seededRevision,
    t: new Date().toISOString(),
    c: { analytics: granted, marketing: granted },
  }
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
