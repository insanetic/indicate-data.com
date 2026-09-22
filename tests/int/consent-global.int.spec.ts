import type { Config } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { defineConsent } from '@subneo/payload-consent'
import { gtm } from '@subneo/payload-consent/integrations/gtm'
import {
  consentPlugin,
  createConsentGlobal,
  createLogEndpoint,
  missingServiceRows,
  parseLogBody,
  resetLogThrottle,
  resolvePluginOptions,
  validateCategoryRows,
} from '@subneo/payload-consent/server'

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
  it('counts an integration the editor switched on in the admin', () => {
    const runtime = defineConsent({ ...setup, integrations: [gtm()] })
    // No id anywhere: nothing runs, so nothing has to be declared.
    expect(missingServiceRows(runtime, { categories: [] }, {})).toEqual([])
    // An id entered in the admin makes the container run, and the service row becomes due.
    expect(missingServiceRows(runtime, { categories: [], integrations: { gtm: { containerId: 'GTM-CMS' } } }, {})).toEqual(['gtm'])
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

  it('accepts only http(s) in a service privacy link', () => {
    type AnyField = { name?: unknown; fields?: unknown[]; validate?: unknown }
    const find = (fields: unknown[], name: string): AnyField | undefined => {
      for (const field of fields as AnyField[]) {
        if (field.name === name) return field
        const hit = field.fields ? find(field.fields, name) : undefined
        if (hit) return hit
      }
      return undefined
    }
    const field = find(createConsentGlobal(setup, options).fields, 'privacyUrl')
    const validate = field?.validate as (value: unknown) => true | string
    expect(typeof validate).toBe('function')
    expect(validate('https://x')).toBe(true)
    expect(validate('')).toBe(true)
    expect(validate(undefined)).toBe(true)
    expect(validate('javascript:alert(1)')).toMatch(/http/)
  })

  it('beforeValidate validates the merged document on a partial update', async () => {
    const global = createConsentGlobal(setup, options)
    const hook = global.hooks!.beforeValidate![0]
    const originalDoc = { categories: [{ key: 'analytics', services: [{ name: 'GA4', integration: 'gtm' }] }] }
    const data = { enabled: false }
    await expect(hook({ data, originalDoc } as never)).resolves.toEqual(data)
    await expect(hook({ data: { categories: [] }, originalDoc } as never)).rejects.toThrow(/gtm/)
  })
})

describe('parseLogBody', () => {
  // A literal date would fall outside the clock-skew window once it is a day old.
  const t = new Date(Date.now() - 60_000).toISOString()
  const body = { id: 'abc-123', v: 2, t, c: { analytics: true, marketing: false }, h: 'deadbeef', l: 'de' }
  it('accepts a well-formed body', () => {
    expect(parseLogBody(setup, body)).toEqual({
      consentId: 'abc-123',
      revision: 2,
      choices: { analytics: true, marketing: false },
      decidedAt: t,
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
  const request = (body: unknown, length = 200, headers: Record<string, string> = {}) =>
    ({
      json: async () => body,
      text: async () => JSON.stringify(body),
      headers: new Headers({ 'content-length': String(length), ...headers }),
      payload: { create: vi.fn(async () => ({})), logger: { error: vi.fn() } },
    }) as never

  /** A request whose body is only readable as a stream, in two chunks, and declares no length. */
  const streamRequest = (raw: string) =>
    ({
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          const bytes = new TextEncoder().encode(raw)
          const half = Math.ceil(bytes.byteLength / 2)
          controller.enqueue(bytes.slice(0, half))
          controller.enqueue(bytes.slice(half))
          controller.close()
        },
      }),
      headers: new Headers(),
      payload: { create: vi.fn(async () => ({})), logger: { error: vi.fn() } },
    }) as never

  const created = (req: never) => (req as unknown as { payload: { create: ReturnType<typeof vi.fn> } }).payload.create

  beforeEach(resetLogThrottle)

  it('stores a row and answers 204', async () => {
    // A literal date would fall outside the clock-skew window once it is a day old.
    const t = new Date(Date.now() - 60_000).toISOString()
    const req = request({ id: 'abc', v: 1, t, c: { analytics: true, marketing: false }, h: 'h', l: 'de' })
    const res = await endpoint.handler(req)
    expect(res.status).toBe(204)
    expect(created(req)).toHaveBeenCalledWith({
      collection: 'consent-logs',
      data: { consentId: 'abc', revision: 1, choices: { analytics: true, marketing: false }, decidedAt: t, textsHash: 'h', locale: 'de' },
    })
  })

  it('rejects oversized and malformed bodies', async () => {
    expect((await endpoint.handler(request({}, 5000))).status).toBe(413)
    expect((await endpoint.handler(request({ nope: true }))).status).toBe(400)
  })

  it('measures the body it reads, not the declared length', async () => {
    expect((await endpoint.handler(request({ id: 'a'.repeat(2000) }, 10))).status).toBe(413)
  })

  it('counts bytes, not characters, in the text fallback', async () => {
    // 600 euro signs are 600 UTF-16 units but 1800 bytes on the wire.
    expect((await endpoint.handler(request({ id: '€'.repeat(600) }, 10))).status).toBe(413)
  })

  it('caps a streamed body that declares no length', async () => {
    const res = await endpoint.handler(streamRequest('a'.repeat(2000)))
    expect(res.status).toBe(413)
  })

  it('reads a streamed body within the cap', async () => {
    const raw = JSON.stringify({ id: 'abc', v: 1, t: new Date().toISOString(), c: { analytics: true, marketing: false }, h: 'h', l: 'de' })
    const req = streamRequest(raw)
    expect((await endpoint.handler(req)).status).toBe(204)
    expect(created(req)).toHaveBeenCalledTimes(1)
  })

  it('answers 400 when the body stream was already consumed', async () => {
    const req = streamRequest('{}')
    ;(req as unknown as { body: ReadableStream<Uint8Array> }).body.getReader()
    expect((await endpoint.handler(req)).status).toBe(400)
  })

  it('replaces a decidedAt from a wildly wrong client clock with the server time', async () => {
    const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    const req = request({ id: 'abc', v: 1, t: lastYear, c: { analytics: true, marketing: false }, h: 'h', l: 'de' })
    expect((await endpoint.handler(req)).status).toBe(204)
    const { decidedAt } = created(req).mock.calls[0][0].data as { decidedAt: string }
    expect(Math.abs(Date.now() - Date.parse(decidedAt))).toBeLessThan(60_000)
  })

  it('throttles one address after 20 requests a minute and leaves others alone', async () => {
    const body = { id: 'abc', v: 1, t: new Date().toISOString(), c: { analytics: true, marketing: false }, h: 'h', l: 'de' }
    const from = (address: string) => endpoint.handler(request(body, 200, { 'x-forwarded-for': `${address}, 10.0.0.1` }))
    for (let i = 0; i < 20; i++) expect((await from('203.0.113.7')).status).toBe(204)
    expect((await from('203.0.113.7')).status).toBe(429)
    expect((await from('203.0.113.8')).status).toBe(204)
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
