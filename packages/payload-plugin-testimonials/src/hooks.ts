import type { CollectionBeforeChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

/**
 * Drops the cached pool so every page that renders testimonials is rebuilt. Skipped for seeds,
 * scripts and migrations (`context.disableRevalidate`); outside a Next request (tests, CLI)
 * `revalidateTag` throws, which must not fail the write.
 */
export const createRevalidateHook =
  (tag: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ doc, req: { payload, context } }: { doc: any; req: { payload: any; context: Record<string, unknown> } }) => {
    if (!context?.disableRevalidate) {
      try {
        revalidateTag(tag, { expire: 0 })
      } catch (err) {
        payload.logger.debug({ err }, `[testimonials] revalidateTag('${tag}') skipped outside Next`)
      }
    }
    return doc
  }

/** Stored admin title "Name – Company"; partial updates (one locale) fall back to the saved values. */
export const setTitle: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const name = data?.name ?? originalDoc?.name
  const company = data?.company ?? originalDoc?.company
  return { ...data, title: [name, company].filter(Boolean).join(' – ') }
}
