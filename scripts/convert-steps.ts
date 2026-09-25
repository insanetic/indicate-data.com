/**
 * Converts every "heading + Items steps" pair into a Split block in steps mode:
 *   NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload \
 *     ./node_modules/.bin/payload run scripts/convert-steps.ts
 * Safe to run again. One transaction. Production runs the same step in the split_steps migration.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

import { runStepsConversion } from '../src/sections/convertPages'

const payload = await getPayload({ config })
try {
  const result = await runStepsConversion(payload)
  payload.logger.info(`[steps] converted ${result.publishedPages} published pages and ${result.draftPages} drafts`)
  process.exit(0)
} catch (error) {
  payload.logger.error({ err: error, msg: '[steps] conversion failed, rolled back' })
  process.exit(1)
}
