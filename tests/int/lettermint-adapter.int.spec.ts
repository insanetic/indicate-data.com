// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createLettermintAdapter, getEmailSettings, LettermintError, PLUGIN_KEY, resolveOptions } from '@subneo/payload-lettermint'

const options = resolveOptions({
  defaultFrom: { address: 'noreply@indicate-data.io', name: 'Indicate Data' },
  defaultNotifyTo: 'hello@indicate-data.io',
  env: { apiToken: 'LM_ADAPTER_TEST' },
})

const fakePayload = (global: Record<string, unknown> | Error = {}) => {
  const findGlobal = vi.fn(async () => {
    if (global instanceof Error) throw global
    return global
  })
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
  return { payload: { findGlobal, logger, config: { custom: { [PLUGIN_KEY]: options } } } as never, findGlobal, logger }
}

const accepted = () => vi.fn(async (_url: string, _init: RequestInit) => new Response(JSON.stringify({ message_id: 'm1', status: 'pending' }), { status: 202 }))
const sentBody = (fetch: ReturnType<typeof accepted>, call = 0) => JSON.parse(String(fetch.mock.calls[call][1].body))

afterEach(() => {
  delete process.env.LM_ADAPTER_TEST
})

describe('createLettermintAdapter', () => {
  it('exposes the static defaults Payload reads at init', () => {
    const adapter = createLettermintAdapter(options)(fakePayload())
    expect(adapter).toMatchObject({ name: 'lettermint', defaultFromAddress: 'noreply@indicate-data.io', defaultFromName: 'Indicate Data' })
  })

  it('logs instead of sending when no token is set, and warns once', async () => {
    const fetch = accepted()
    const { payload, logger } = fakePayload()
    const adapter = createLettermintAdapter(options, { fetch: fetch as never })({ payload })
    expect(await adapter.sendEmail({ to: 'a@x.io', subject: 'Hi', html: '<p>x</p>' })).toEqual({ logged: true })
    await adapter.sendEmail({ to: 'b@x.io', subject: 'Hi again', html: '<p>x</p>' })
    expect(fetch).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledTimes(1)
    expect(logger.warn.mock.calls[0][0]).toContain('LM_ADAPTER_TEST is not set')
    expect(logger.info).toHaveBeenCalledTimes(2)
  })

  it('uses the saved sender for messages without from and for Payload\'s default from', async () => {
    process.env.LM_ADAPTER_TEST = 'lm_adapter_0123456789'
    const fetch = accepted()
    const { payload } = fakePayload({ fromAddress: 'team@indicate-data.io', fromName: 'Indicate Team', route: 'transactional' })
    const adapter = createLettermintAdapter(options, { fetch: fetch as never })({ payload })

    await adapter.sendEmail({ to: 'a@x.io', subject: 's', html: '<p>x</p>' })
    expect(sentBody(fetch, 0)).toMatchObject({ from: '"Indicate Team" <team@indicate-data.io>', route: 'transactional' })

    await adapter.sendEmail({ from: '"Indicate Data" <noreply@indicate-data.io>', to: 'a@x.io', subject: 's', html: '<p>x</p>' })
    expect(sentBody(fetch, 1).from).toBe('"Indicate Team" <team@indicate-data.io>')

    await adapter.sendEmail({ from: 'forms@indicate-data.io', to: 'a@x.io', subject: 's', html: '<p>x</p>' })
    expect(sentBody(fetch, 2).from).toBe('forms@indicate-data.io')

    expect((fetch.mock.calls[0][1].headers as Record<string, string>)['x-lettermint-token']).toBe('lm_adapter_0123456789')
  })

  it('falls back to the plugin defaults when the global is empty or unreadable', async () => {
    process.env.LM_ADAPTER_TEST = 'lm_adapter_0123456789'
    for (const global of [{}, new Error('relation "email_settings" does not exist')]) {
      const fetch = accepted()
      const { payload, logger } = fakePayload(global)
      await createLettermintAdapter(options, { fetch: fetch as never })({ payload }).sendEmail({ to: 'a@x.io', subject: 's', html: '<p>x</p>' })
      expect(sentBody(fetch)).toMatchObject({ from: '"Indicate Data" <noreply@indicate-data.io>' })
      expect(sentBody(fetch)).not.toHaveProperty('route')
      expect(logger.error).toHaveBeenCalledTimes(global instanceof Error ? 1 : 0)
    }
  })

  it('passes Lettermint errors through', async () => {
    process.env.LM_ADAPTER_TEST = 'lm_adapter_0123456789'
    const fetch = vi.fn(async () => new Response(JSON.stringify({ message: 'The from field is invalid.', errors: {} }), { status: 422 }))
    const adapter = createLettermintAdapter(options, { fetch: fetch as never })(fakePayload())
    await expect(adapter.sendEmail({ to: 'a@x.io', subject: 's', html: '<p>x</p>' })).rejects.toBeInstanceOf(LettermintError)
  })

  it('reports options it drops', async () => {
    const { payload, logger } = fakePayload()
    await createLettermintAdapter(options)({ payload }).sendEmail({ to: 'a@x.io', subject: 's', html: '<p>x</p>', attachments: [] })
    expect(logger.warn.mock.calls.some(([m]) => String(m).includes('ignoring attachments'))).toBe(true)
  })
})

describe('getEmailSettings', () => {
  it('splits the team recipients and falls back to the default', async () => {
    expect((await getEmailSettings(fakePayload({ notifyTo: 'a@x.io, "B" <b@x.io>' }).payload)).notifyTo).toEqual(['a@x.io', '"B" <b@x.io>'])
    expect((await getEmailSettings(fakePayload({ notifyTo: '' }).payload)).notifyTo).toEqual(['hello@indicate-data.io'])
  })

  it('says so when the plugin is missing', async () => {
    await expect(getEmailSettings({ config: { custom: {} } } as never)).rejects.toThrow(/lettermintPlugin/)
  })
})
