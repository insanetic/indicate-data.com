/**
 * Copies the example plans into the pricing global so they can be edited in the admin:
 *   NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload \
 *     ./node_modules/.bin/payload run scripts/pricing-manual.ts
 * Safe to run again: plans already typed in are left alone. Production runs the same step in the
 * pricing_manual migration.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

import { startManualPricing } from '../src/pricing/startManual'

const payload = await getPayload({ config })
try {
  const result = await startManualPricing(payload)
  payload.logger.info(result.copied ? `[pricing] example plans copied, source is now "${result.source}"` : '[pricing] manual plans exist already, nothing changed')
  process.exit(0)
} catch (error) {
  payload.logger.error({ err: error, msg: '[pricing] copying the example plans failed' })
  process.exit(1)
}
