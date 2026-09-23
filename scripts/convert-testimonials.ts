/**
 * Moves the inline quotes of all testimonials blocks into the central collection:
 *   NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload \
 *     ./node_modules/.bin/payload run scripts/convert-testimonials.ts
 * Safe to run again. Runs in one transaction: any error rolls everything back and exits non-zero.
 * Production runs the same step inside the testimonials migration.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

import { runInlineTestimonialConversion } from '../src/utilities/convertInlineTestimonials'

const payload = await getPayload({ config })
try {
  const result = await runInlineTestimonialConversion(payload)
  payload.logger.info(
    `[testimonials] created ${result.created}, reused ${result.reused}, converted ${result.blocks} blocks, ${result.draftBlocks} draft blocks, kept ${result.emptyBlocks} published and ${result.emptyDraftBlocks} draft blocks without quotes empty, ${result.needsReview.length} need review`,
  )
  for (const r of result.needsReview) payload.logger.warn(`[testimonials] needs review: page ${r.pageId}, block ${r.blockId}: ${r.reason}`)
  process.exit(0)
} catch (error) {
  payload.logger.error({ err: error, msg: '[testimonials] conversion failed, rolled back' })
  process.exit(1)
}
