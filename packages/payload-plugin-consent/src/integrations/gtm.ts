import { consentModeBootstrap, gtag } from '../consent-mode'
import { createIntegration, type ConsentIntegration } from '../setup'

export type GtmOptions = {
  /**
   * Container id such as `GTM-XXXXXXX`. Omit it to read the id at runtime from the environment
   * variable `envKey` (server side, per request). An empty string keeps the integration registered
   * but disabled.
   */
  containerId?: string | null
  /** Environment variable holding the container id when `containerId` is omitted. Default `GTM_ID`. */
  envKey?: string
  /** Category that loads the container. Default `analytics`. */
  category?: string
}

export const isGtmLoaded = (): boolean =>
  typeof document !== 'undefined' && !!document.querySelector('script[data-gtm]')

/** Appends gtm.js once. Call only after a decision that grants the container's category. */
export function loadGtm(id: string): void {
  if (typeof document === 'undefined' || isGtmLoaded()) return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`
  script.setAttribute('data-gtm', id)
  document.head.appendChild(script)
}

/**
 * Google Tag Manager under basic Consent Mode: defaults denied in <head>, the container loads
 * only after its category is granted, every decision is forwarded as a consent update.
 */
export function gtm({ containerId, envKey = 'GTM_ID', category = 'analytics' }: GtmOptions = {}): ConsentIntegration {
  const fromEnv = containerId === undefined
  const fixedId = containerId || ''
  return createIntegration({
    key: 'gtm',
    category,
    enabled: fromEnv || fixedId.length > 0,
    resolve: (env) => {
      const id = (fromEnv ? env[envKey] : fixedId) || ''
      return { enabled: id.length > 0, options: { id } }
    },
    cookies: [/^_ga($|_)/, /^_gid$/, /^_gat($|_)/, /^_gac_/, /^_gcl_/],
    bootstrap: consentModeBootstrap(),
    load: ({ options }) => loadGtm(options.id || fixedId),
    update: ({ signals }) => gtag('consent', 'update', signals),
    service: {
      name: 'Google Tag Manager',
      provider: 'Google Ireland Limited',
      privacyUrl: 'https://policies.google.com/privacy',
    },
  })
}
