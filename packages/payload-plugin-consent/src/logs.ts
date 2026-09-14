import type { CollectionConfig, Endpoint } from 'payload'

import type { ResolvedPluginOptions } from './plugin'
import type { Choices, ResolvedSetup } from './setup'

export type LogRow = {
  consentId: string
  revision: number
  choices: Choices
  decidedAt: string
  textsHash: string
  locale: string
}

/** Opaque client id: word characters and dashes only, capped so a body cannot carry a payload. */
const ID = /^[A-Za-z0-9-]{1,64}$/

/** Validates `{ id, v, t, c, h, l }` from the browser. Unknown category keys make the body invalid. */
export function parseLogBody(setup: ResolvedSetup, body: unknown): LogRow | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (typeof b.id !== 'string' || !ID.test(b.id)) return null
  if (typeof b.v !== 'number' || !Number.isInteger(b.v) || b.v < 1) return null
  if (typeof b.t !== 'string' || Number.isNaN(Date.parse(b.t))) return null
  if (!b.c || typeof b.c !== 'object') return null
  const choices: Choices = {}
  for (const [key, value] of Object.entries(b.c as Record<string, unknown>)) {
    if (!setup.optionalKeys.includes(key) || typeof value !== 'boolean') return null
    choices[key] = value
  }
  for (const key of setup.optionalKeys) if (!(key in choices)) choices[key] = false
  const textsHash = typeof b.h === 'string' ? b.h.slice(0, 16) : ''
  const locale = typeof b.l === 'string' ? b.l.slice(0, 10) : ''
  return { consentId: b.id, revision: b.v, choices, decidedAt: new Date(b.t).toISOString(), textsHash, locale }
}

/** Proof of consent (GDPR Art. 7(1)): what was chosen, when, under which texts. No IP, no user agent. */
export const createConsentLogsCollection = ({ logsSlug, adminGroup }: ResolvedPluginOptions): CollectionConfig => ({
  slug: logsSlug,
  labels: { singular: { de: 'Einwilligung', en: 'Consent log' }, plural: { de: 'Einwilligungen', en: 'Consent logs' } },
  admin: { group: adminGroup, useAsTitle: 'consentId', defaultColumns: ['decidedAt', 'consentId', 'revision', 'locale'] },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'consentId', type: 'text', required: true, index: true, admin: { readOnly: true } },
    { name: 'revision', type: 'number', required: true, admin: { readOnly: true } },
    { name: 'choices', type: 'json', required: true, admin: { readOnly: true } },
    { name: 'decidedAt', type: 'date', required: true, admin: { readOnly: true } },
    { name: 'textsHash', type: 'text', admin: { readOnly: true } },
    { name: 'locale', type: 'text', admin: { readOnly: true } },
  ],
  timestamps: true,
})

const MAX_BODY = 1024

/** `POST /api/consent/log`: one row per decision. Written with the local API; the collection itself denies create. */
export const createLogEndpoint = (setup: ResolvedSetup, { logsSlug, logPath }: ResolvedPluginOptions): Endpoint => ({
  path: logPath,
  method: 'post',
  handler: async (req) => {
    const length = Number(req.headers.get('content-length') || 0)
    if (length > MAX_BODY) return new Response(null, { status: 413 })
    let body: unknown = null
    try {
      body = await req.json?.()
    } catch {
      return new Response(null, { status: 400 })
    }
    const row = parseLogBody(setup, body)
    if (!row) return new Response(null, { status: 400 })
    try {
      await req.payload.create({ collection: logsSlug as never, data: row as never })
    } catch (error) {
      req.payload.logger.error({ err: error, msg: '[consent] could not store consent log' })
      return new Response(null, { status: 500 })
    }
    return new Response(null, { status: 204 })
  },
})
