import type { Plugin } from 'payload'

import { createConsentGlobal } from './global'
import { createConsentLogsCollection, createLogEndpoint } from './logs'
import type { ResolvedSetup } from './setup'

export type ConsentPluginOptions = {
  /** Set to `false` to leave the config untouched. */
  enabled?: boolean
  /** Slug of the global; default `consent`. */
  globalSlug?: string
  /** Slug of the log collection; default `consent-logs`. */
  logsSlug?: string
  /** Endpoint path under `/api`; default `/consent/log`. */
  logPath?: string
  /** Admin sidebar group; default Website / Site. */
  adminGroup?: string | Record<string, string>
  /** Next cache tag revalidated after a save; default `global_<globalSlug>`. */
  cacheTag?: string
  /** Import-map paths of the admin row labels. */
  componentPaths?: { categoryRowLabel?: string; serviceRowLabel?: string }
}

export type ResolvedPluginOptions = {
  globalSlug: string
  logsSlug: string
  logPath: string
  adminGroup: string | Record<string, string>
  cacheTag: string
  componentPaths: { categoryRowLabel: string; serviceRowLabel: string }
  localized: boolean
}

export const resolvePluginOptions = (options: ConsentPluginOptions, localized = false): ResolvedPluginOptions => {
  const globalSlug = options.globalSlug || 'consent'
  return {
    globalSlug,
    logsSlug: options.logsSlug || 'consent-logs',
    logPath: options.logPath || '/consent/log',
    adminGroup: options.adminGroup || { de: 'Website', en: 'Site' },
    cacheTag: options.cacheTag || `global_${globalSlug}`,
    componentPaths: {
      categoryRowLabel: options.componentPaths?.categoryRowLabel || '@subneo/payload-consent/admin#CategoryRowLabel',
      serviceRowLabel: options.componentPaths?.serviceRowLabel || '@subneo/payload-consent/admin#ServiceRowLabel',
    },
    localized,
  }
}

/** Adds the `consent` global and, when `setup.logging` is on, the log collection and endpoint. */
export const consentPlugin =
  (setup: ResolvedSetup, options: ConsentPluginOptions = {}): Plugin =>
  (config) => {
    if (options.enabled === false) return config
    const resolved = resolvePluginOptions(options, Boolean(config.localization))
    const next = { ...config, globals: [...(config.globals || []), createConsentGlobal(setup, resolved)] }
    if (!setup.logging) return next
    return {
      ...next,
      collections: [...(config.collections || []), createConsentLogsCollection(resolved)],
      endpoints: [...(config.endpoints || []), createLogEndpoint(setup, resolved)],
    }
  }
