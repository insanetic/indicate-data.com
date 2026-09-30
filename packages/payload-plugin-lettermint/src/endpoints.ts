import type { Endpoint } from 'payload'

import { isAdminUser } from './access'
import { LettermintError, pingToken } from './client'
import { readEmailSettings } from './settings'
import { readToken, tokenHint } from './token'
import type { ResolvedLettermintOptions } from './types'

export const ENDPOINT_BASE = '/lettermint'

const unauthorized = () => Response.json({ error: 'Unauthorized' }, { status: 401 })

/** GET /api/lettermint/status — token state (never the token), settings; `?check=1` also asks Lettermint. */
export const createStatusEndpoint = (o: ResolvedLettermintOptions, deps: { fetch?: typeof fetch } = {}): Endpoint => ({
  path: `${ENDPOINT_BASE}/status`,
  method: 'get',
  handler: async (req) => {
    if (!isAdminUser(req)) return unauthorized()
    const token = readToken(o.env.apiToken)
    const settings = await readEmailSettings(req.payload, o)
    let valid: boolean | undefined
    let checkError: string | undefined
    if (token && req.searchParams?.get('check') === '1') {
      try {
        valid = await pingToken({ token, baseUrl: o.baseUrl, timeoutMs: o.timeoutMs, fetch: deps.fetch })
      } catch (err) {
        checkError = err instanceof LettermintError ? err.message : 'Check failed'
      }
    }
    return Response.json({
      token: {
        configured: Boolean(token),
        envName: o.env.apiToken,
        hint: tokenHint(token),
        ...(valid !== undefined ? { valid } : {}),
        ...(checkError ? { checkError } : {}),
      },
      sender: { address: settings.fromAddress, name: settings.fromName },
      notifyTo: settings.notifyTo,
      route: settings.route ?? null,
    })
  },
})

/** POST /api/lettermint/test — a short mail to the admin user's own address, never anyone else. */
export const createTestEndpoint = (o: ResolvedLettermintOptions): Endpoint => ({
  path: `${ENDPOINT_BASE}/test`,
  method: 'post',
  handler: async (req) => {
    if (!isAdminUser(req)) return unauthorized()
    const to = (req.user as { email?: unknown }).email
    if (typeof to !== 'string' || !to) {
      return Response.json({ ok: false, status: 400, message: 'Your account has no email address', errors: null }, { status: 400 })
    }
    if (!readToken(o.env.apiToken)) {
      return Response.json({ ok: false, status: 0, message: `${o.env.apiToken} is not set`, errors: null }, { status: 409 })
    }
    const de = req.i18n?.language !== 'en'
    try {
      const result = (await req.payload.sendEmail({
        to,
        subject: de ? 'Testmail aus dem CMS' : 'Test mail from the CMS',
        html: de
          ? '<p>Diese Testmail bestätigt, dass der Versand über Lettermint funktioniert.</p>'
          : '<p>This test mail confirms that sending through Lettermint works.</p>',
      })) as { message_id?: string | null } | undefined
      return Response.json({ ok: true, to, messageId: result?.message_id ?? null })
    } catch (err) {
      if (err instanceof LettermintError) {
        return Response.json({ ok: false, status: err.status, message: err.message, errors: err.errors ?? null }, { status: 502 })
      }
      req.payload.logger.error({ err, msg: '[lettermint] test mail failed' })
      return Response.json({ ok: false, status: 0, message: 'Sending failed; see the server log', errors: null }, { status: 500 })
    }
  },
})
