/**
 * Moves the inline quotes of all testimonials blocks into the central collection:
 *   NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload \
 *     ./node_modules/.bin/payload run scripts/convert-testimonials.ts
 * Safe to run again. Production runs the same step inside the testimonials migration.
 */
import { getPayload, type PayloadRequest } from 'payload'
import config from '@payload-config'

import { convertInlineTestimonials } from '../src/utilities/convertInlineTestimonials'

const payload = await getPayload({ config })
const result = await convertInlineTestimonials({ payload, req: { payload, context: {} } as unknown as PayloadRequest })
payload.logger.info(`[testimonials] created ${result.created}, reused ${result.reused}, converted ${result.blocks} blocks`)
process.exit(0)
