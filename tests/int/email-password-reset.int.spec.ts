// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { passwordResetHTML, passwordResetSubject, resetURL } from '@/email/passwordReset'

const req = (language: string) =>
  ({ i18n: { language }, payload: { config: { routes: { admin: '/admin' }, admin: { routes: { reset: '/reset' } } } } }) as never

describe('password reset mail', () => {
  const saved = process.env.SITE_URL
  beforeEach(() => {
    process.env.SITE_URL = 'https://indicate-data.test/'
  })
  afterEach(() => {
    // Assigning undefined to process.env would store the string "undefined".
    if (saved === undefined) delete process.env.SITE_URL
    else process.env.SITE_URL = saved
  })

  it('links to the admin reset page on SITE_URL', () => {
    expect(resetURL(req('de'), 'tok/123')).toBe('https://indicate-data.test/admin/reset/tok%2F123')
  })

  it('speaks German by default and English for English admins', async () => {
    expect(await passwordResetSubject({ req: req('de') })).toBe('Passwort zurücksetzen – Indicate Data')
    expect(await passwordResetSubject({ req: req('en') })).toBe('Reset your password – Indicate Data')
    expect(await passwordResetSubject({})).toBe('Passwort zurücksetzen – Indicate Data')
    const en = await passwordResetHTML({ req: req('en'), token: 'abc', user: { name: 'Ada' } })
    expect(en).toContain('Set a new password')
    expect(en).toContain('valid for one hour')
    expect(en).toContain('href="https://indicate-data.test/admin/reset/abc"')
    expect(await passwordResetHTML({ req: req('de'), token: 'abc' })).toContain('Neues Passwort festlegen')
  })

  it('escapes the user name', async () => {
    const html = await passwordResetHTML({ req: req('de'), token: 'abc', user: { name: '<b>Ada</b>' } })
    expect(html).toContain('Hallo &lt;b&gt;Ada&lt;/b&gt;,')
    expect(html).not.toContain('<b>Ada</b>')
  })
})
