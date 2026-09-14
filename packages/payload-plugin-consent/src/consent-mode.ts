import type { Choices, ConsentModeSignal, ConsentModeSignals, ResolvedSetup } from './setup'

type GtagFn = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: GtagFn
  }
}

export const ALL_SIGNALS: readonly ConsentModeSignal[] = [
  'ad_storage',
  'ad_user_data',
  'ad_personalization',
  'analytics_storage',
]

/**
 * Inline script for <head>, before any other script: creates the dataLayer and gtag, sets every
 * Consent Mode signal to denied. Only storage the site itself needs is granted.
 */
export function consentModeBootstrap(): string {
  const denied = [...ALL_SIGNALS, 'personalization_storage'].map((s) => `${s}:'denied'`).join(',')
  return [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments)}',
    'window.gtag=gtag;',
    `gtag('consent','default',{${denied},functionality_storage:'granted',security_storage:'granted',wait_for_update:0});`,
    "gtag('set','ads_data_redaction',true);",
  ].join('')
}

export function signalsFor(setup: ResolvedSetup, choices: Choices): ConsentModeSignals {
  const out = Object.fromEntries(ALL_SIGNALS.map((s) => [s, 'denied'])) as ConsentModeSignals
  for (const category of setup.categories) {
    if (category.required || !choices[category.key]) continue
    for (const signal of category.signals || []) out[signal] = 'granted'
  }
  return out
}

/** Calls window.gtag, creating the dataLayer-backed fallback when the head script did not run. */
export function gtag(...args: unknown[]): void {
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
