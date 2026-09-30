import { l } from './labels'

/** Key of the resolved options in `config.custom`. */
export const PLUGIN_KEY = '@subneo/payload-lettermint'
export const DEFAULT_GLOBAL_SLUG = 'email-settings'
export const DEFAULT_BASE_URL = 'https://api.lettermint.co/v1'
export const DEFAULT_TIMEOUT_MS = 10_000
export const DEFAULT_TOKEN_ENV = 'LETTERMINT_API_TOKEN'

export interface LettermintPluginOptions {
  /** Set to `false` to leave the config untouched. */
  enabled?: boolean
  /** Sender Payload uses as its default (password resets); the global starts with it. */
  defaultFrom: { address: string; name: string }
  /** Comma-separated team address(es) the global starts with; default `defaultFrom.address`. */
  defaultNotifyTo?: string
  /** Environment variable holding the Lettermint project token; default `LETTERMINT_API_TOKEN`. */
  env?: { apiToken?: string }
  /** Slug of the settings global; default `email-settings`. */
  globalSlug?: string
  /** Admin sidebar group of the global; default "Einstellungen" / "Settings". */
  adminGroup?: string | Record<string, string>
  /** Default `https://api.lettermint.co/v1`. */
  baseUrl?: string
  /** Request timeout; default 10 000 ms. */
  timeoutMs?: number
}

export interface ResolvedLettermintOptions {
  defaultFrom: { address: string; name: string }
  defaultNotifyTo: string
  env: { apiToken: string }
  globalSlug: string
  adminGroup: string | Record<string, string>
  baseUrl: string
  timeoutMs: number
}

/** The global as the adapter and site code use it, with plugin defaults filled in. */
export interface EmailSettings {
  fromAddress: string
  fromName: string
  notifyTo: string[]
  route?: string
}

export const resolveOptions = (options: LettermintPluginOptions): ResolvedLettermintOptions => ({
  defaultFrom: { address: options.defaultFrom.address.trim(), name: options.defaultFrom.name.trim() },
  defaultNotifyTo: options.defaultNotifyTo?.trim() || options.defaultFrom.address.trim(),
  env: { apiToken: options.env?.apiToken || DEFAULT_TOKEN_ENV },
  globalSlug: options.globalSlug || DEFAULT_GLOBAL_SLUG,
  adminGroup: options.adminGroup || l('Einstellungen', 'Settings'),
  baseUrl: (options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, ''),
  timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
})
