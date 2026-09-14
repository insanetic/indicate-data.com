import type { Config } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import {
  consentPlugin,
  createConsentGlobal,
  createLogEndpoint,
  defineConsent,
  missingServiceRows,
  parseLogBody,
  resolvePluginOptions,
  validateCategoryRows,
} from '@subneo/payload-consent'
import { gtm } from '@subneo/payload-consent/integrations/gtm'

const setup = defineConsent({
  categories: [
    { key: 'necessary', required: true, texts: { en: { label: 'Necessary', description: '' } } },
    { key: 'analytics', texts: { en: { label: 'Statistics', description: '' } } },
    { key: 'marketing', texts: { en: { label: 'Marketing', description: '' } } },
  ],
  integrations: [gtm({ containerId: 'GTM-TEST' })],
  logging: true,
})

const options = resolvePluginOptions({})

describe('validateCategoryRows', () => {
  const validate = validateCategoryRows(setup)
  it('accepts known unique keys', () => {
    expect(validate([{ key: 'necessary' }, { key: 'analytics' }])).toBe(true)
    expect(validate(null)).toBe(true)
  })
  it('rejects duplicates and unknown keys', () => {
    expect(validate([{ key: 'analytics' }, { key: 'analytics' }])).toMatch(/twice/)
    expect(validate([{ key: 'nope' }])).toMatch(/unknown/)
  })
})

describe('missingServiceRows', () => {
  it('lists active integrations without a service row in their category', () => {
    expect(missingServiceRows(setup, { categories: [] })).toEqual(['gtm'])
    expect(missingServiceRows(setup, { categories: [{ key: 'marketing', services: [{ name: 'x', integration: 'gtm' }] }] })).toEqual(['gtm'])
    expect(missingServiceRows(setup, { categories: [{ key: 'analytics', services: [{ name: 'GA4', integration: 'gtm' }] }] })).toEqual([])
  })
  it('ignores disabled integrations', () => {
    const staging = defineConsent({ ...setup, integrations: [gtm({ containerId: '' })] })
    expect(missingServiceRows(staging, { categories: [] })).toEqual([])
  })
})

describe('createConsentGlobal', () => {
  it('exposes trigger, integration select and the validation hook', () => {
    const global = createConsentGlobal(setup, options)
    expect(global.slug).toBe('consent')
    const names = global.fields.map((f) => ('name' in f ? f.name : f.type))
    expect(names).toContain('trigger')
    expect(names).toContain('categories')
    const json = JSON.stringify(global.fields)
    expect(json).toContain('"name":"integration"')
    expect(json).toContain('"value":"gtm"')
    expect(json).toContain('"value":"none"')
    expect(global.hooks?.beforeValidate).toHaveLength(1)
    expect(global.hooks?.afterChange).toHaveLength(1)
  })

  it('beforeValidate throws when an active integration has no service row', async () => {
    const global = createConsentGlobal(setup, options)
    const hook = global.hooks!.beforeValidate![0]
    await expect(hook({ data: { categories: [] } } as never)).rejects.toThrow(/gtm/)
    const data = { categories: [{ key: 'analytics', services: [{ name: 'GA4', integration: 'gtm' }] }] }
    await expect(hook({ data } as never)).resolves.toEqual(data)
  })
})

describe('parseLogBody', () => {
  const body = { id: 'abc-123', v: 2, t: '2026-09-14T10:00:00.000Z', c: { analytics: true, marketing: false }, h: 'deadbeef', l: 'de' }
  it('accepts a well-formed body', () => {
    expect(parseLogBody(setup, body)).toEqual({
      consentId: 'abc-123',
      revision: 2,
      choices: { analytics: true, marketing: false },
      decidedAt: '2026-09-14T10:00:00.000Z',
      textsHash: 'deadbeef',
      locale: 'de',
    })
  })
  it('rejects bad ids, revisions, timestamps and unknown categories', () => {
    expect(parseLogBody(setup, { ...body, id: 'no spaces!' })).toBeNull()
    expect(parseLogBody(setup, { ...body, v: 0 })).toBeNull()
    expect(parseLogBody(setup, { ...body, t: 'yesterday' })).toBeNull()
    expect(parseLogBody(setup, { ...body, c: { analytics: true, bogus: true } })).toBeNull()
    expect(parseLogBody(setup, { ...body, c: { analytics: 'yes' } })).toBeNull()
    expect(parseLogBody(setup, null)).toBeNull()
  })
})

describe('createLogEndpoint', () => {
  const endpoint = createLogEndpoint(setup, options)
  const request = (body: unknown, length = 200) =>
    ({
      json: async () => body,
      headers: new Headers({ 'content-length': String(length) }),
      payload: { create: vi.fn(async () => ({})), logger: { error: vi.fn() } },
    }) as never

  it('stores a row and answers 204', async () => {
    const req = request({ id: 'abc', v: 1, t: '2026-09-14T10:00:00.000Z', c: { analytics: true, marketing: false }, h: 'h', l: 'de' })
    const res = await endpoint.handler(req)
    expect(res.status).toBe(204)
    const create = (req as unknown as { payload: { create: ReturnType<typeof vi.fn> } }).payload.create
    expect(create).toHaveBeenCalledWith({
      collection: 'consent-logs',
      data: { consentId: 'abc', revision: 1, choices: { analytics: true, marketing: false }, decidedAt: '2026-09-14T10:00:00.000Z', textsHash: 'h', locale: 'de' },
    })
  })

  it('rejects oversized and malformed bodies', async () => {
    expect((await endpoint.handler(request({}, 5000))).status).toBe(413)
    expect((await endpoint.handler(request({ nope: true }))).status).toBe(400)
  })
})

describe('consentPlugin', () => {
  it('adds the global, the log collection and the endpoint', () => {
    const config = consentPlugin(setup)({ collections: [], globals: [], endpoints: [], localization: { locales: ['de', 'en'], defaultLocale: 'de' } } as never) as Config
    expect(config.globals?.map((g) => g.slug)).toEqual(['consent'])
    expect(config.collections?.map((c) => c.slug)).toEqual(['consent-logs'])
    expect(config.endpoints?.map((e) => e.path)).toEqual(['/consent/log'])
  })
  it('adds nothing for logging when the setup turns it off', () => {
    const quiet = defineConsent({ ...setup, logging: false })
    const config = consentPlugin(quiet)({ collections: [], globals: [] } as never) as Config
    expect(config.collections).toEqual([])
    expect(config.endpoints || []).toEqual([])
  })
})
