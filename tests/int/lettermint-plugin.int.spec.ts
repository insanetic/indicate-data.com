// @vitest-environment node
import type { Config, Endpoint, Field, GlobalConfig } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LettermintError, lettermintPlugin, PLUGIN_KEY, validateAddressList } from '@subneo/payload-lettermint'

const plugin = lettermintPlugin({
  defaultFrom: { address: 'noreply@indicate-data.io', name: 'Indicate Data' },
  defaultNotifyTo: 'hello@indicate-data.io',
  env: { apiToken: 'LM_PLUGIN_TEST' },
})
const base = { collections: [], globals: [], endpoints: [] } as unknown as Config

const flatten = (fields: Field[]): Field[] =>
  fields.flatMap((f) => (!('name' in f) && 'fields' in f ? flatten(f.fields as Field[]) : [f]))
const names = (fields: Field[]) => flatten(fields).map((f) => ('name' in f ? f.name : f.type))

const setup = async () => {
  const config = await plugin(base)
  const endpoint = (path: string) => (config.endpoints as Endpoint[]).find((e) => e.path === path)!
  const custom = config.custom as Record<string, unknown>
  const req = (over: Record<string, unknown> = {}) => ({
    user: { email: 'me@indicate-data.io', collection: 'users' },
    i18n: { language: 'de' },
    searchParams: new URLSearchParams(),
    payload: {
      config: { custom, admin: { user: 'users' } },
      findGlobal: vi.fn(async () => ({})),
      logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      sendEmail: vi.fn(async (_message?: unknown) => ({ message_id: 'm1', status: 'pending' })),
    },
    ...over,
  })
  return { config, endpoint, req }
}

afterEach(() => {
  delete process.env.LM_PLUGIN_TEST
  vi.unstubAllGlobals()
})

describe('lettermintPlugin', () => {
  it('installs the adapter, the global, both endpoints and its options', async () => {
    const { config } = await setup()
    expect(typeof config.email).toBe('function')
    const global = (config.globals as GlobalConfig[]).find((g) => g.slug === 'email-settings')!
    expect(names(global.fields)).toEqual(['status', 'fromAddress', 'fromName', 'notifyTo', 'route'])
    expect((config.endpoints as Endpoint[]).map((e) => `${e.method} ${e.path}`)).toEqual(['get /lettermint/status', 'post /lettermint/test'])
    expect((config.custom as Record<string, unknown>)[PLUGIN_KEY]).toMatchObject({ globalSlug: 'email-settings' })
  })

  it('opens the global to admin users only', async () => {
    const { config } = await setup()
    const global = (config.globals as GlobalConfig[]).find((g) => g.slug === 'email-settings')!
    const payload = { config: { admin: { user: 'users' } } }
    for (const op of ['read', 'update'] as const) {
      const access = global.access![op] as (args: { req: { user?: unknown; payload: unknown } }) => boolean
      expect(access({ req: { payload } })).toBe(false)
      expect(access({ req: { user: { id: 1, collection: 'payload-mcp-api-keys' }, payload } })).toBe(false)
      expect(access({ req: { user: { id: 1, collection: 'users' }, payload } })).toBe(true)
    }
  })

  it('leaves the config alone when disabled', async () => {
    const config = await lettermintPlugin({ enabled: false, defaultFrom: { address: 'a@x.io', name: 'A' } })(base)
    expect(config).toBe(base)
  })

  it('validates the team recipients', () => {
    expect(validateAddressList('a@x.io, "B" <b@x.io>')).toBe(true)
    expect(validateAddressList('a@x.io, nope')).toContain('nope')
    expect(typeof validateAddressList('')).toBe('string')
  })
})

describe('GET /api/lettermint/status', () => {
  it('needs a logged-in user', async () => {
    const { endpoint, req } = await setup()
    expect((await endpoint('/lettermint/status').handler(req({ user: null }) as never)).status).toBe(401)
  })

  it('refuses an MCP API key', async () => {
    const { endpoint, req } = await setup()
    expect((await endpoint('/lettermint/status').handler(req({ user: { id: 1, collection: 'payload-mcp-api-keys', email: 'me@indicate-data.io' } }) as never)).status).toBe(401)
  })

  it('reports a missing token', async () => {
    const { endpoint, req } = await setup()
    const data = await (await endpoint('/lettermint/status').handler(req() as never)).json()
    expect(data).toMatchObject({
      token: { configured: false, envName: 'LM_PLUGIN_TEST', hint: null },
      sender: { address: 'noreply@indicate-data.io', name: 'Indicate Data' },
      notifyTo: ['hello@indicate-data.io'],
      route: null,
    })
  })

  it('never returns more than the last four characters of the token', async () => {
    process.env.LM_PLUGIN_TEST = 'lm_live_supersecret_9f3a'
    const { endpoint, req } = await setup()
    const text = await (await endpoint('/lettermint/status').handler(req() as never)).text()
    expect(text).toContain('…9f3a')
    expect(text).not.toContain('supersecret')
  })

  it('checks the token with Lettermint on request', async () => {
    process.env.LM_PLUGIN_TEST = 'lm_live_supersecret_9f3a'
    vi.stubGlobal('fetch', vi.fn(async () => new Response('401', { status: 401 })))
    const { endpoint, req } = await setup()
    const data = await (await endpoint('/lettermint/status').handler(req({ searchParams: new URLSearchParams('check=1') }) as never)).json()
    expect(data.token.valid).toBe(false)
  })
})

describe('POST /api/lettermint/test', () => {
  it('needs a logged-in user', async () => {
    const { endpoint, req } = await setup()
    expect((await endpoint('/lettermint/test').handler(req({ user: null }) as never)).status).toBe(401)
  })

  it('refuses an MCP API key', async () => {
    process.env.LM_PLUGIN_TEST = 'lm_live_supersecret_9f3a'
    const { endpoint, req } = await setup()
    const r = req({ user: { id: 1, collection: 'payload-mcp-api-keys', email: 'me@indicate-data.io' } })
    expect((await endpoint('/lettermint/test').handler(r as never)).status).toBe(401)
    expect(r.payload.sendEmail).not.toHaveBeenCalled()
  })

  it('refuses without a token', async () => {
    const { endpoint, req } = await setup()
    const res = await endpoint('/lettermint/test').handler(req() as never)
    expect(res.status).toBe(409)
    expect(await res.json()).toMatchObject({ ok: false, message: 'LM_PLUGIN_TEST is not set' })
  })

  it('sends only to the logged-in user', async () => {
    process.env.LM_PLUGIN_TEST = 'lm_live_supersecret_9f3a'
    const { endpoint, req } = await setup()
    const r = req({ data: { to: 'victim@example.org' } })
    const data = await (await endpoint('/lettermint/test').handler(r as never)).json()
    expect(data).toEqual({ ok: true, to: 'me@indicate-data.io', messageId: 'm1' })
    expect(r.payload.sendEmail).toHaveBeenCalledTimes(1)
    expect(r.payload.sendEmail.mock.calls[0][0]).toMatchObject({ to: 'me@indicate-data.io' })
  })

  it("returns Lettermint's message", async () => {
    process.env.LM_PLUGIN_TEST = 'lm_live_supersecret_9f3a'
    const { endpoint, req } = await setup()
    const r = req()
    r.payload.sendEmail.mockRejectedValueOnce(new LettermintError('The from field is invalid.', 422, { from: ['Domain not verified'] }))
    const res = await endpoint('/lettermint/test').handler(r as never)
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ ok: false, status: 422, message: 'The from field is invalid.', errors: { from: ['Domain not verified'] } })
  })
})
