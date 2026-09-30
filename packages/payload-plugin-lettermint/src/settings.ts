import type { Payload } from 'payload'

import { splitAddressList } from './message'
import { PLUGIN_KEY, type EmailSettings, type ResolvedLettermintOptions } from './types'

const filled = (value: unknown): string | undefined => (typeof value === 'string' && value.trim() ? value.trim() : undefined)

/** The resolved plugin options stored in the config; throws when the plugin is not installed. */
export const optionsOf = (payload: Payload): ResolvedLettermintOptions => {
  const options = payload.config.custom?.[PLUGIN_KEY] as ResolvedLettermintOptions | undefined
  if (!options) throw new Error('[lettermint] lettermintPlugin is not in the Payload config')
  return options
}

/** Reads the global (bypassing access) and fills gaps with the plugin defaults. Never throws for a missing global. */
export const readEmailSettings = async (payload: Payload, o: ResolvedLettermintOptions): Promise<EmailSettings> => {
  let doc: Record<string, unknown> = {}
  try {
    doc = (await payload.findGlobal({ slug: o.globalSlug as never, depth: 0, overrideAccess: true })) as Record<string, unknown>
  } catch (err) {
    payload.logger.error({ err, msg: '[lettermint] could not read the email settings, using the defaults' })
  }
  const notifyTo = splitAddressList(filled(doc.notifyTo) ?? '')
  return {
    fromAddress: filled(doc.fromAddress) ?? o.defaultFrom.address,
    fromName: filled(doc.fromName) ?? o.defaultFrom.name,
    notifyTo: notifyTo.length ? notifyTo : splitAddressList(o.defaultNotifyTo),
    route: filled(doc.route),
  }
}

/** Email settings for site code (form hooks): sender, team recipients, route. */
export const getEmailSettings = async (payload: Payload): Promise<EmailSettings> => readEmailSettings(payload, optionsOf(payload))
