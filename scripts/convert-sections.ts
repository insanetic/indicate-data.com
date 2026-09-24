/**
 * Converts the legacy structural blocks (and old widget spacing) on every page into section blocks:
 *   NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload \
 *     ./node_modules/.bin/payload run scripts/convert-sections.ts
 * Safe to run again. One transaction: any error rolls everything back and exits non-zero.
 * Production runs the same step inside the section_blocks migration.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

import { runSectionConversion } from '../src/sections/convertPages'

const payload = await getPayload({ config })
try {
  const result = await runSectionConversion(payload)
  payload.logger.info(`[sections] converted ${result.publishedPages} published pages and ${result.draftPages} drafts`)
  process.exit(0)
} catch (error) {
  payload.logger.error({ err: error, msg: '[sections] conversion failed, rolled back' })
  process.exit(1)
}
