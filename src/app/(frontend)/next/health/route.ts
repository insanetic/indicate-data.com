import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Used by the container healthcheck (and whatever rolls the image out can wait on it).
// Answers 200 only when Payload is initialised (migrations done) and Postgres replies.
export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.count({ collection: 'users', overrideAccess: true })

    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ status: 'unavailable' }, { status: 503 })
  }
}
