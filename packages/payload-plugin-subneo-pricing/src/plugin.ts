import type { Plugin } from 'payload'

import { createRefreshEndpoint } from './endpoint'
import { createSubneoPricingGlobal } from './global'
import { resolveOptions, type SubneoPricingPluginOptions } from './types'

/**
 * Adds the `subneo-pricing` settings global and the refresh endpoint. Add the block from
 * `createPricingBlock()` to the collections that should render plans, and call `getPricing()` in
 * the block's server component.
 */
export const subneoPricingPlugin =
  (options: SubneoPricingPluginOptions = {}): Plugin =>
  (config) => {
    if (options.enabled === false) return config
    const resolved = resolveOptions(options)
    return {
      ...config,
      globals: [...(config.globals || []), createSubneoPricingGlobal({ ...resolved, localized: Boolean(config.localization) })],
      endpoints: [...(config.endpoints || []), createRefreshEndpoint(resolved)],
    }
  }
