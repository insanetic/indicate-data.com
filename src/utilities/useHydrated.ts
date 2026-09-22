'use client'

import { useSyncExternalStore } from 'react'

/** Never fires: the value it reports flips once, when React hydrates. */
const noSubscribe = () => () => {}

/**
 * `false` while rendering on the server and through hydration, `true` afterwards. For the things
 * that only exist in the browser — a portal target, `window.location` — without the extra render
 * (and the lint error) that setting state from a mount effect costs.
 */
export const useHydrated = (): boolean => useSyncExternalStore(noSubscribe, () => true, () => false)
