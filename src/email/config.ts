import type { LettermintPluginOptions } from '@subneo/payload-lettermint'

/**
 * Starting values for the admin's Website -> E-Mail page. The Lettermint token is never here:
 * it comes from LETTERMINT_API_TOKEN only.
 */
export const emailPluginOptions: LettermintPluginOptions = {
  defaultFrom: { address: 'noreply@indicate-data.io', name: 'Indicate Data' },
  defaultNotifyTo: 'hello@indicate-data.io',
  adminGroup: { de: 'Website', en: 'Site' },
}
