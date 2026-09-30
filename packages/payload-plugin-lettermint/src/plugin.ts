import type { Plugin } from 'payload'

import { createLettermintAdapter } from './adapter'
import { createStatusEndpoint, createTestEndpoint } from './endpoints'
import { createEmailSettingsGlobal } from './global'
import { PLUGIN_KEY, resolveOptions, type LettermintPluginOptions } from './types'

/**
 * Sends every `payload.sendEmail` through Lettermint (replacing any `email` adapter already set),
 * and adds the `email-settings` global plus the status and test endpoints.
 */
export const lettermintPlugin =
  (options: LettermintPluginOptions): Plugin =>
  (config) => {
    if (options.enabled === false) return config
    const o = resolveOptions(options)
    return {
      ...config,
      email: createLettermintAdapter(o),
      globals: [...(config.globals || []), createEmailSettingsGlobal(o)],
      endpoints: [...(config.endpoints || []), createStatusEndpoint(o), createTestEndpoint(o)],
      custom: { ...(config.custom || {}), [PLUGIN_KEY]: o },
    }
  }
