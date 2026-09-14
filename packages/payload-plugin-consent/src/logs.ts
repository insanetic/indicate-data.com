import { createHash } from 'node:crypto'
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

/**
 * Tolerance for the client clock. `decidedAt` is the browser's own time and can be years off (a
 * fresh machine, a deliberately shifted clock); beyond this the server time is stored instead, so a
 * log row can never claim a decision from outside the plausible window.
 */
const MAX_CLOCK_SKEW = 24 * 60 * 60 * 1000

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
  const now = Date.now()
  const claimed = Date.parse(b.t)
  const decidedAt = new Date(Math.abs(now - claimed) > MAX_CLOCK_SKEW ? now : claimed).toISOString()
  return { consentId: b.id, revision: b.v, choices, decidedAt, textsHash, locale }
}

/** Proof of consent (GDPR Art. 7(1)): what was chosen, when, under which texts. No IP, no user agent. */
export const createConsentLogsCollection = ({ logsSlug, adminGroup }: ResolvedPluginOptions): CollectionConfig => ({
  slug: logsSlug,
  labels: { singular: { de: 'Einwilligung', en: 'Consent log' }, plural: { de: 'Einwilligungen', en: 'Consent logs' } },
  admin: {
    group: adminGroup,
    useAsTitle: 'consentId',
    defaultColumns: ['decidedAt', 'consentId', 'revision', 'locale'],
    description: {
      de: '„Erstellt am“ ist der maßgebliche Serverzeitstempel. „Entschieden am“ kommt von der Uhr des Besuchers und wird nur übernommen, wenn es höchstens 24 Stunden von der Serverzeit abweicht.',
      en: '"Created at" is the authoritative server timestamp. "Decided at" comes from the visitor\'s own clock and is only kept when it is within 24 hours of the server time.',
    },
  },
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

const byteLength = (value: string): number =>
  typeof Buffer !== 'undefined' ? Buffer.byteLength(value, 'utf8') : new TextEncoder().encode(value).length

type BodySource = { body?: unknown; text?: () => Promise<string> }

/**
 * Reads at most `MAX_BODY` bytes. A stream is read chunk by chunk and abandoned the moment the
 * accumulated byte length passes the cap, so an endless body is never buffered; without a stream the
 * whole text is read and measured in bytes, not UTF-16 units. `null` means "too large".
 */
async function readCappedBody(req: BodySource): Promise<string | null> {
  const stream = req.body as ReadableStream<Uint8Array> | null | undefined
  if (stream && typeof stream.getReader === 'function') {
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let size = 0
    let raw = ''
    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > MAX_BODY) return null
        raw += decoder.decode(value, { stream: true })
      }
      return raw + decoder.decode()
    } finally {
      reader.cancel().catch(() => {})
    }
  }
  const raw = (await req.text?.()) ?? ''
  return byteLength(raw) > MAX_BODY ? null : raw
}

/** Requests per address per window. Generous for a human, useless as a way to fill the collection. */
const THROTTLE_WINDOW_MS = 60_000
const THROTTLE_MAX = 20

/** Hashed address → timestamps in the current window. In-process only; a restart forgets it. */
const throttle = new Map<string, number[]>()

/** Test seam: drops the in-process throttle state. */
export function resetLogThrottle(): void {
  throttle.clear()
}

/**
 * Hash of the caller's address, never the address itself: enough to count requests, nothing that
 * could be stored or logged. Nothing about the address leaves this function.
 */
function throttleKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const address = forwarded || headers.get('x-real-ip')?.trim() || 'unknown'
  return createHash('sha256').update(address).digest('hex')
}

function isThrottled(headers: Headers): boolean {
  const now = Date.now()
  for (const [key, stamps] of throttle) {
    const fresh = stamps.filter((stamp) => now - stamp < THROTTLE_WINDOW_MS)
    if (fresh.length === 0) throttle.delete(key)
    else throttle.set(key, fresh)
  }
  const key = throttleKey(headers)
  const stamps = throttle.get(key) || []
  if (stamps.length >= THROTTLE_MAX) return true
  throttle.set(key, [...stamps, now])
  return false
}

/** `POST /api/consent/log`: one row per decision. Written with the local API; the collection itself denies create. */
export const createLogEndpoint = (setup: ResolvedSetup, { logsSlug, logPath }: ResolvedPluginOptions): Endpoint => ({
  path: logPath,
  method: 'post',
  handler: async (req) => {
    if (isThrottled(req.headers)) return new Response(null, { status: 429 })
    // The header is only a fast path: a public endpoint must measure the body it actually reads.
    const declared = Number(req.headers.get('content-length') || 0)
    if (declared > MAX_BODY) return new Response(null, { status: 413 })
    const raw = await readCappedBody(req)
    if (raw === null) return new Response(null, { status: 413 })
    let body: unknown = null
    try {
      body = JSON.parse(raw)
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
