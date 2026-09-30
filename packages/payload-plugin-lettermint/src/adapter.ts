import type { Payload, PayloadEmailAdapter, SendEmailOptions } from 'payload'

import { sendMail, type LettermintSendResponse } from './client'
import { formatAddress, toLettermintBody } from './message'
import { readEmailSettings } from './settings'
import { readToken } from './token'
import type { ResolvedLettermintOptions } from './types'

/** What `sendEmail` resolves to: Lettermint's answer, or `logged` when no token is set. */
export type LettermintResult = LettermintSendResponse | { logged: true }

/**
 * Payload email adapter. Token and settings are read per send, so nothing fails at startup and a
 * restarted container picks up a new token.
 */
export const createLettermintAdapter =
  (o: ResolvedLettermintOptions, deps: { fetch?: typeof fetch } = {}): PayloadEmailAdapter<LettermintResult> =>
  ({ payload }) => {
    // Payload's own mails (forgot password) carry its static default sender; those get the saved one.
    const payloadDefaults = new Set([formatAddress(o.defaultFrom), o.defaultFrom.address])
    let warnedNoToken = false

    return {
      name: 'lettermint',
      defaultFromAddress: o.defaultFrom.address,
      defaultFromName: o.defaultFrom.name,
      sendEmail: async (message: SendEmailOptions): Promise<LettermintResult> => {
        const { body, dropped } = toLettermintBody(message)
        if (dropped.length) payload.logger.warn(`[lettermint] ignoring ${dropped.join(', ')}`)

        const token = readToken(o.env.apiToken)
        if (!token) {
          if (!warnedNoToken) {
            warnedNoToken = true
            payload.logger.warn(`[lettermint] ${o.env.apiToken} is not set: email is logged, not sent`)
          }
          payload.logger.info(`[lettermint] not sent: to ${body.to.join(', ')}, subject "${body.subject}"`)
          return { logged: true }
        }

        const settings = await readEmailSettings(payload as Payload, o)
        const from =
          body.from && !payloadDefaults.has(body.from) ? body.from : formatAddress({ name: settings.fromName, address: settings.fromAddress })
        return sendMail(
          { ...body, from, ...(settings.route ? { route: settings.route } : {}) },
          { token, baseUrl: o.baseUrl, timeoutMs: o.timeoutMs, fetch: deps.fetch },
        )
      },
    }
  }
