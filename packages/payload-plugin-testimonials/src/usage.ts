import type { Id, Reason } from './types'

export interface Usage {
  docId: Id
  docTitle: string
  blockIndex: number
  heading: string | null
  reason: Reason
  /** False when the block references it but it is not rendered (expired, draft, deduped). */
  shown: boolean
}
