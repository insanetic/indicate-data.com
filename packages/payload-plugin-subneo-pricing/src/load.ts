import type { Payload } from 'payload'

import { unstable_cache } from 'next/cache'

import { SUBNEO_API_URL, SUBNEO_API_VERSION, createSubneoClient, isSubneoError, type Plan } from '@subneo/sdk'

import { manualToPlans } from './manual'
import { buildPricingModel } from './model'
import { resolveOptions, type PricingModel, type SubneoPricingPluginOptions, type SubneoPricingSettings } from './types'

export interface GetPricingArgs extends SubneoPricingPluginOptions {
  payload: Payload
  /** Locale to read the global's localised texts in. */
  locale?: string
  /** Restrict to these family codes (block setting). Empty: all configured families. */
  familyCodes?: string[]
}

/**
 * Reads the settings global, loads every configured family (from Subneo, cached by tag and TTL,
 * from the plans typed into the global, or from the fixtures in preview mode) and returns the
 * view model. Failures are logged and surface as `status: 'partial' | 'unavailable'`; live mode
 * never falls back to example data.
 */
export const getPricing = async (args: GetPricingArgs): Promise<PricingModel> => {
  const { payload, locale, familyCodes = [] } = args
  const options = resolveOptions(args)

  // Read through a tagged cache, so a statically rendered page carries the tag and saving the
  // global (afterChange hook) re-renders it in every mode, not only when plans come from the API.
  // The API key stays out of the cache entry and is read separately below.
  const readSettings = unstable_cache(
    async (slug: string, loc: string | undefined) => {
      const doc = (await payload.findGlobal({
        // The slug is configurable, so it cannot be typed against the site's generated globals.
        slug: slug as Parameters<Payload['findGlobal']>[0]['slug'],
        depth: 0,
        overrideAccess: true,
        ...(loc ? { locale: loc as 'all' } : {}),
      })) as unknown as SubneoPricingSettings
      return { ...doc, apiKey: null }
    },
    ['subneo-pricing-settings', 'v1'],
    { tags: [options.cacheTag] },
  )
  const settings = await readSettings(options.globalSlug, locale)

  const source = settings.source === 'subneo' || settings.source === 'manual' ? settings.source : 'fixture'
  const families = (settings.families || []).map((f) => f.code).filter((code) => familyCodes.length === 0 || familyCodes.includes(code))

  const plansByFamily: Record<string, Plan[] | undefined> = {}
  if (source === 'fixture') {
    for (const code of families) plansByFamily[code] = options.fixtures[code] || []
    return buildPricingModel({ settings, plansByFamily, familyCodes, source })
  }
  if (source === 'manual') {
    const manual = manualToPlans(settings)
    for (const code of families) plansByFamily[code] = manual[code] || []
    return buildPricingModel({ settings, plansByFamily, familyCodes, source })
  }

  const apiKey = (await readApiKey(payload, options.globalSlug)) || process.env[options.env.apiKey] || ''
  const baseUrl = settings.baseUrl?.trim() || process.env[options.env.baseUrl] || SUBNEO_API_URL
  const apiVersion = settings.apiVersion?.trim() || SUBNEO_API_VERSION
  const revalidate = Math.max(0, Number(settings.cacheSeconds ?? 300)) || false

  if (!apiKey) {
    payload.logger.warn(`[subneo-pricing] live mode without an API key (global "${options.globalSlug}" or ${options.env.apiKey})`)
    for (const code of families) plansByFamily[code] = undefined
    return buildPricingModel({ settings, plansByFamily, familyCodes, source })
  }

  const fetchFamily = unstable_cache(
    async (url: string, version: string, family: string, _keyId: string) => {
      const client = createSubneoClient({ apiKey, baseUrl: url, apiVersion: version })
      return client.listPlans({ family })
    },
    ['subneo-plans', 'v1'],
    { tags: [options.cacheTag], revalidate },
  )

  await Promise.all(
    families.map(async (code) => {
      try {
        plansByFamily[code] = await fetchFamily(baseUrl, apiVersion, code, fingerprint(apiKey))
      } catch (error) {
        const detail = isSubneoError(error) ? `${error.status} ${error.code || ''} ${error.message}` : String(error)
        payload.logger.error(`[subneo-pricing] family "${code}" failed: ${detail}`)
        plansByFamily[code] = undefined
      }
    }),
  )

  return buildPricingModel({ settings, plansByFamily, familyCodes, source })
}

/** Non-secret cache-key discriminator so a rotated key never serves the old key's cache entry. */
const fingerprint = (value: string): string => {
  let hash = 5381
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0
  return (hash >>> 0).toString(16)
}

/** The key typed into the global, read uncached so it never lands in Next's data cache. */
const readApiKey = async (payload: Payload, slug: string): Promise<string> => {
  const doc = (await payload.findGlobal({
    slug: slug as Parameters<Payload['findGlobal']>[0]['slug'],
    depth: 0,
    overrideAccess: true,
    select: { apiKey: true } as never,
  })) as unknown as SubneoPricingSettings
  return doc.apiKey?.trim() || ''
}
