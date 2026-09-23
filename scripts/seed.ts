/**
 * Seeds the Indicate site from the host (outside Docker):
 *   NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload \
 *     ./node_modules/.bin/payload run scripts/seed.ts
 *
 * The admin "Seed" button and /next/seed run the same function inside the app.
 */
import { getPayload, type PayloadRequest } from 'payload'
import config from '@payload-config'

import { seed } from '../src/endpoints/seed'

const payload = await getPayload({ config })
await seed({ payload, req: { payload, context: {} } as unknown as PayloadRequest })
process.exit(0)
