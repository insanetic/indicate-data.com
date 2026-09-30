// @vitest-environment node
import type { Config, GlobalConfig } from 'payload'
import { describe, expect, it } from 'vitest'

import { lettermintPlugin } from '@subneo/payload-lettermint'

import { emailPluginOptions } from '@/email/config'

describe('site email settings', () => {
  it('puts the E-Mail global under Website with the site defaults', async () => {
    const config = await lettermintPlugin(emailPluginOptions)({ globals: [], endpoints: [] } as unknown as Config)
    const global = (config.globals as GlobalConfig[]).find((g) => g.slug === 'email-settings')!
    expect(global.admin?.group).toEqual({ de: 'Website', en: 'Site' })
    expect(emailPluginOptions.defaultFrom).toEqual({ address: 'noreply@indicate-data.io', name: 'Indicate Data' })
    expect(emailPluginOptions.defaultNotifyTo).toBe('hello@indicate-data.io')
  })
})
