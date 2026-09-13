import { optionalCategories, type ConsentSignal } from './config'
import type { Choices } from './store'

type GtagFn = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: GtagFn
  }
}

const allSignals: readonly ConsentSignal[] = ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage']

/**
 * Inline script for <head>, before any other script: creates the dataLayer and gtag, sets every
 * Consent Mode signal to denied. Storage the site itself needs (consent cookie, chrome) is granted.
 */
export const bootstrapSnippet = [
  'window.dataLayer=window.dataLayer||[];',
  'function gtag(){dataLayer.push(arguments)}',
  'window.gtag=gtag;',
  `gtag('consent','default',{${allSignals.map((s) => `${s}:'denied'`).join(',')},functionality_storage:'granted',personalization_storage:'granted',security_storage:'granted',wait_for_update:0});`,
  "gtag('set','ads_data_redaction',true);",
].join('')

export function signalsFor(choices: Choices): Record<ConsentSignal, 'granted' | 'denied'> {
  const out = Object.fromEntries(allSignals.map((s) => [s, 'denied'])) as Record<ConsentSignal, 'granted' | 'denied'>
  for (const category of optionalCategories) {
    if (!choices[category.key]) continue
    for (const signal of category.signals) out[signal] = 'granted'
  }
  return out
}

export const anyGranted = (choices: Choices): boolean => optionalCategories.some((c) => choices[c.key])

// Fallback gtag when head script did not run; intentionally mirrors the bootstrapSnippet.
function gtag(...args: unknown[]) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  if (!window.gtag) {
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments)
    }
  }
  window.gtag(...args)
}

export function applyConsent(choices: Choices): void {
  gtag('consent', 'update', signalsFor(choices))
}

export const isGtmLoaded = (): boolean =>
  typeof document !== 'undefined' && !!document.querySelector('script[data-gtm]')

/** Appends gtm.js once. Call only after a decision that grants at least one optional category. */
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
