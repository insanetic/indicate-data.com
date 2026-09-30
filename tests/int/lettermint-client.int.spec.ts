// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LettermintError, pingToken, readToken, sendMail, tokenHint } from '@subneo/payload-lettermint'

const TOKEN = 'lm_test_0123456789abcd'
const body = { from: 'a@x.io', to: ['b@x.io'], subject: 's', html: '<p>x</p>' }
const opts = (fetch: unknown) => ({ token: TOKEN, baseUrl: 'https://api.test/v1', timeoutMs: 50, fetch: fetch as typeof globalThis.fetch })
const json = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })

describe('sendMail', () => {
  it('posts the body with the token header', async () => {
    const fetch = vi.fn(async () => json(202, { message_id: 'm1', status: 'pending' }))
    expect(await sendMail(body, opts(fetch))).toEqual({ message_id: 'm1', status: 'pending' })
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.test/v1/send')
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>)['x-lettermint-token']).toBe(TOKEN)
    expect(JSON.parse(String(init.body))).toEqual(body)
  })

  it('refuses redirects so the token header never follows one', async () => {
    const fetch = vi.fn(async () => json(202, { message_id: 'm1', status: 'pending' }))
    await sendMail(body, opts(fetch))
    await pingToken(opts(fetch))
    for (const call of fetch.mock.calls as unknown as [string, RequestInit][]) expect(call[1].redirect).toBe('error')
  })

  it('accepts a 2xx whose body is not JSON', async () => {
    const fetch = vi.fn(async () => new Response('Accepted', { status: 202 }))
    expect(await sendMail(body, opts(fetch))).toEqual({ message_id: null, status: 'accepted' })
  })

  it('keeps the per-field messages of a 422', async () => {
    const fetch = vi.fn(async () => json(422, { message: 'The from field is invalid.', errors: { from: ['Domain not verified'] } }))
    const err = await sendMail(body, opts(fetch)).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(LettermintError)
    expect(err).toMatchObject({ status: 422, message: 'The from field is invalid.', errors: { from: ['Domain not verified'] } })
  })

  it('survives an error page that is not JSON', async () => {
    const fetch = vi.fn(async () => new Response('<html>Bad gateway</html>', { status: 502 }))
    await expect(sendMail(body, opts(fetch))).rejects.toMatchObject({ status: 502, message: 'Lettermint answered 502' })
  })

  it('gives up after the timeout', async () => {
    const fetch = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => init.signal!.addEventListener('abort', () => reject(init.signal!.reason))),
    )
    await expect(sendMail(body, opts(fetch))).rejects.toMatchObject({ status: 0, message: 'Lettermint did not answer within 50 ms' })
  })

  it('never puts the token into an error', async () => {
    const failures = [
      vi.fn(async () => json(401, { message: 'Unauthenticated.' })),
      vi.fn(async () => {
        throw new TypeError('fetch failed')
      }),
    ]
    for (const fetch of failures) {
      const err = (await sendMail(body, opts(fetch)).catch((e: unknown) => e)) as LettermintError
      expect(JSON.stringify({ ...err, message: err.message, stack: err.stack })).not.toContain(TOKEN)
    }
  })
})

describe('pingToken', () => {
  it('says whether Lettermint accepts the token', async () => {
    expect(await pingToken(opts(vi.fn(async () => json(200, 200))))).toBe(true)
    expect(await pingToken(opts(vi.fn(async () => json(401, { message: 'Unauthenticated.' }))))).toBe(false)
    await expect(pingToken(opts(vi.fn(async () => json(500, {}))))).rejects.toMatchObject({ status: 500 })
  })
})

describe('token helpers', () => {
  afterEach(() => {
    delete process.env.LM_CLIENT_TEST
  })

  it('reads and trims the env value', () => {
    process.env.LM_CLIENT_TEST = '  lm_abc\n'
    expect(readToken('LM_CLIENT_TEST')).toBe('lm_abc')
    process.env.LM_CLIENT_TEST = '   '
    expect(readToken('LM_CLIENT_TEST')).toBeUndefined()
    delete process.env.LM_CLIENT_TEST
    expect(readToken('LM_CLIENT_TEST')).toBeUndefined()
  })

  it('shows at most the last four characters', () => {
    expect(tokenHint('lm_0123456789abcd')).toBe('…abcd')
    expect(tokenHint('lm_short')).toBeNull()
    expect(tokenHint(undefined)).toBeNull()
  })
})
