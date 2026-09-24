import { randomBytes } from 'crypto'
import { APIError, type CollectionSlug, type PayloadRequest } from 'payload'

export type IdMap = Map<string, string>

export type CopyBody = { sourceId: number | string; targetId: number | string; blockId: string }

export type CopyBlockArgs = CopyBody & {
  collection: CollectionSlug
  /** Name of the blocks field, e.g. `layout`. */
  field: string
  req: PayloadRequest
  /** Id generator; tests pass a deterministic one. */
  newId?: () => string
}

export type CopyBlockResult = { targetId: number | string; title: string; blockId: string }

/** New ObjectId-shaped id (24 hex chars), the format Payload uses for block and array rows. */
export const newRowId = () => randomBytes(12).toString('hex')

/**
 * Deep copy of `value` with every string `id` replaced through `ids`. Unseen ids get a new one and are
 * added to the map, so passing the same map for each locale gives the same ids in every language.
 */
export const remapIds = <T>(value: T, ids: IdMap, next: () => string = newRowId): T => {
  if (Array.isArray(value)) return value.map((item) => remapIds(item, ids, next)) as T
  if (!value || typeof value !== 'object') return value
  const out: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value)) {
    if (key === 'id' && typeof child === 'string') {
      if (!ids.has(child)) ids.set(child, next())
      out[key] = ids.get(child)
    } else {
      out[key] = remapIds(child, ids, next)
    }
  }
  return out as T
}

const isDocId = (value: unknown): value is number | string =>
  (typeof value === 'number' && Number.isFinite(value)) || (typeof value === 'string' && value !== '')

export const parseCopyBody = (data: unknown): { ok: true; body: CopyBody } | { ok: false; error: string } => {
  const { sourceId, targetId, blockId } = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  if (!isDocId(sourceId) || !isDocId(targetId) || typeof blockId !== 'string' || blockId === '') {
    return { ok: false, error: 'Expected { sourceId, targetId, blockId }' }
  }
  return { ok: true, body: { sourceId, targetId, blockId } }
}

type Row = { id?: unknown }
const rowsOf = (doc: unknown, field: string): Row[] => {
  const value = (doc as Record<string, unknown> | null)?.[field]
  return Array.isArray(value) ? (value as Row[]) : []
}

/**
 * Appends a copy of one block of the source document to the end of the target document's draft,
 * one locale at a time (default first) so every language is copied without fallback text.
 * Run it inside a transaction: a failure in a later locale must undo the earlier ones.
 */
export const copyBlockToPage = async ({ collection, field, sourceId, targetId, blockId, req, newId = newRowId }: CopyBlockArgs): Promise<CopyBlockResult> => {
  if (String(sourceId) === String(targetId)) {
    throw new APIError('Source and target are the same page; use Duplicate on the block instead.', 400)
  }
  const { payload } = req
  const localization = payload.config.localization
  const locales: (string | undefined)[] = localization
    ? [localization.defaultLocale, ...localization.localeCodes.filter((code) => code !== localization.defaultLocale)]
    : [undefined]
  const useAsTitle = payload.collections[collection]?.config.admin?.useAsTitle || 'id'
  const common = { collection, depth: 0, draft: true, fallbackLocale: false as const, overrideAccess: false, user: req.user, req }

  const ids: IdMap = new Map()
  let title = ''
  for (const locale of locales) {
    const source = await payload.findByID({ ...common, id: sourceId, locale: locale as never })
    const block = rowsOf(source, field).find((row) => row.id === blockId)
    if (!block) throw new APIError('Block not found on the source page. Save the page first, then copy.', 404)
    const target = await payload.findByID({ ...common, id: targetId, locale: locale as never })
    const copied = remapIds(block, ids, newId)
    // After the first locale the copy already exists on the target (structure is shared); replace it in place.
    const others = rowsOf(target, field).filter((row) => row.id !== copied.id)
    await payload.update({ ...common, id: targetId, locale: locale as never, data: { [field]: [...others, copied] } as never })
    if (!title) title = String((target as unknown as Record<string, unknown>)[useAsTitle] ?? targetId)
  }
  return { targetId, title, blockId: String(ids.get(blockId)) }
}
