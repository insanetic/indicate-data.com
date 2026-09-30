import type { SendEmailOptions } from 'payload'

/** Request body of Lettermint's `POST /send`. */
export interface LettermintSendBody {
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  reply_to?: string[]
  subject: string
  html?: string
  text?: string
  route?: string
}

/** A mapped message; `from` stays open until the adapter has picked the sender. */
export type MappedBody = Omit<LettermintSendBody, 'from'> & { from?: string }

type AddressObject = { name?: string; address: string }

/** Lettermint rejects html or text bodies shorter than this. */
const MIN_BODY_LENGTH = 3

const MAPPED_KEYS = new Set(['from', 'to', 'cc', 'bcc', 'replyTo', 'subject', 'html', 'text'])

/** Splits an address list on the commas between addresses, not the ones inside a quoted name. */
export const splitAddressList = (value: string): string[] => {
  const parts: string[] = []
  let current = ''
  let quoted = false
  let angled = false
  let escaped = false
  for (const ch of value) {
    // A backslash inside a quoted name escapes the next character (`"Say \"hi\""`).
    if (escaped) {
      current += ch
      escaped = false
      continue
    }
    if (quoted && ch === '\\') {
      current += ch
      escaped = true
      continue
    }
    if (ch === '"') quoted = !quoted
    else if (!quoted && ch === '<') angled = true
    else if (!quoted && ch === '>') angled = false
    if (ch === ',' && !quoted && !angled) {
      parts.push(current)
      current = ''
    } else current += ch
  }
  parts.push(current)
  return parts.map((p) => p.trim()).filter(Boolean)
}

/** `"Name" <address>`, or the bare address when there is no name. */
export const formatAddress = ({ name, address }: AddressObject): string => {
  const bare = address.trim()
  const display = name?.trim()
  return display ? `"${display.replace(/(["\\])/g, '\\$1')}" <${bare}>` : bare
}

/** The address inside `"Name" <address>`, or the trimmed input. */
export const bareAddress = (value: string): string => (value.match(/<([^<>]+)>\s*$/)?.[1] ?? value).trim()

const isAddressObject = (value: unknown): value is AddressObject =>
  typeof value === 'object' && value !== null && typeof (value as AddressObject).address === 'string'

/** Every address shape nodemailer allows, as a flat list of strings. */
export const toAddressList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(toAddressList)
  if (typeof value === 'string') return splitAddressList(value)
  if (isAddressObject(value)) {
    const formatted = formatAddress(value)
    return formatted ? [formatted] : []
  }
  return []
}

const asText = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value
  if (value instanceof Uint8Array) return Buffer.from(value).toString('utf8')
  return undefined
}

/**
 * Maps the nodemailer-shaped message Payload hands an adapter onto Lettermint's request body.
 * `dropped` names what Lettermint cannot express here (attachments, streams, nodemailer extras).
 */
export const toLettermintBody = (message: SendEmailOptions): { body: MappedBody; dropped: string[] } => {
  const record = message as Record<string, unknown>
  const dropped = Object.keys(record).filter((key) => !MAPPED_KEYS.has(key) && record[key] !== undefined)
  const body: MappedBody = {
    to: toAddressList(message.to),
    subject: typeof message.subject === 'string' ? message.subject : '',
  }
  const from = toAddressList(message.from)[0]
  if (from) body.from = from
  for (const [key, target] of [['cc', 'cc'], ['bcc', 'bcc'], ['replyTo', 'reply_to']] as const) {
    const list = toAddressList(record[key])
    if (list.length) body[target] = list
  }
  for (const key of ['html', 'text'] as const) {
    if (record[key] == null) continue
    const text = asText(record[key])
    if (text === undefined) dropped.push(key)
    else if (text.length >= MIN_BODY_LENGTH) body[key] = text
  }
  return { body, dropped }
}
