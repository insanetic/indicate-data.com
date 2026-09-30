import type { Payload, PayloadRequest } from 'payload'

import { plansToManual } from '@subneo/payload-pricing'

import { pricingFixtures } from './fixture'

export interface StartManualResult {
  copied: boolean
  source: string
}

/**
 * Copies the example plans into the global's manual fields and switches the data source from
 * "Example data" to "Maintained by hand", so the page stays the same and becomes editable.
 * Leaves plans already typed in alone, and never switches away from the live Subneo API.
 */
export const startManualPricing = async (payload: Payload, req?: Partial<PayloadRequest>): Promise<StartManualResult> => {
  const current = await payload.findGlobal({ slug: 'subneo-pricing', depth: 0, overrideAccess: true, req })
  if (current.manualPlans?.length) return { copied: false, source: current.source }

  const source = current.source === 'subneo' ? 'subneo' : 'manual'
  await payload.updateGlobal({
    slug: 'subneo-pricing',
    data: { ...plansToManual(pricingFixtures), source },
    depth: 0,
    overrideAccess: true,
    req,
    context: { disableRevalidate: true },
  })
  return { copied: true, source }
}
