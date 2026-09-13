import { createPricingBlock } from '@subneo/payload-pricing'

import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

/** Plans from Subneo, wrapped in this site's section header and settings. */
export const Pricing = createPricingBlock({
  localized: true,
  before: [sectionHeader()],
  after: [sectionSettings()],
})
