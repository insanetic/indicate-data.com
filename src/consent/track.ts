type Params = Record<string, string | number | boolean | undefined>

export type TrackEvent =
  | { name: 'page_view'; params: { page_path: string; page_title: string; page_locale: string } }
  | { name: 'cta_click'; params: { label: string; location?: string; href?: string } }
  | { name: 'outbound_click'; params: { href: string; label?: string } }
  | { name: 'generate_lead'; params: { form_id: string; form_name: string } }
  | { name: string; params?: Params }

let enabled = false

/** Set by ConsentProvider on mount. Off means track() never touches the dataLayer. */
export const setTrackingEnabled = (value: boolean): void => {
  enabled = value
}
export const isTrackingEnabled = (): boolean => enabled

/**
 * Pushes an event to the dataLayer. The dataLayer is a local array; data only leaves the browser
 * through GTM, which is loaded only after consent, so pushing before a decision is harmless and
 * lets GTM process the queue once loaded.
 */
export function track(event: TrackEvent): void {
  if (!enabled || typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  const params: Params = {}
  for (const [key, value] of Object.entries(event.params || {})) if (value !== undefined) params[key] = value
  window.dataLayer.push({ event: event.name, ...params })
}

/**
 * One delegated listener: any element with `data-track` (event name, default cta_click) pushes
 * its label (`data-track-label` or text), location (`data-track-location`) and href.
 */
export function installClickTracking(): () => void {
  const onClick = (e: MouseEvent) => {
    const target = (e.target as Element | null)?.closest<HTMLElement>('[data-track]')
    if (!target) return
    const name = target.dataset.track || 'cta_click'
    const href = target instanceof HTMLAnchorElement ? target.getAttribute('href') || undefined : undefined
    track({
      name,
      params: {
        label: target.dataset.trackLabel || target.textContent?.trim() || '',
        location: target.dataset.trackLocation,
        href,
      },
    })
  }
  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}
