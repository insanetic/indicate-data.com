type Params = Record<string, string | number | boolean | undefined>

export type TrackEvent =
  | { name: 'page_view'; params: { page_path: string; page_title: string; page_locale: string } }
  | { name: 'cta_click'; params: { label: string; location?: string; href?: string } }
  | { name: 'outbound_click'; params: { href: string; label?: string } }
  | { name: 'generate_lead'; params: { form_id: string; form_name: string } }
  | { name: string; params?: Params }

/**
 * Pushes an event to the dataLayer. The dataLayer exists only when an integration's bootstrap
 * created it, so without one this is a no-op. Data leaves the browser only through an integration,
 * which loads only after consent; pushing before a decision is harmless and lets the integration
 * process the queue once loaded.
 */
export function track(event: TrackEvent): void {
  if (typeof window === 'undefined' || !window.dataLayer) return
  const params: Params = {}
  for (const [key, value] of Object.entries(event.params || {})) if (value !== undefined) params[key] = value
  window.dataLayer.push({ event: event.name, ...params })
}

/**
 * One delegated capture-phase listener: any element with `data-track` (event name) pushes its label
 * (`data-track-label` or text), location (`data-track-location`) and href. `data-track` alone,
 * `data-track=""` or the JSX boolean form (which React renders as `data-track="true"`) all mean
 * cta_click.
 */
export function installClickTracking(): () => void {
  const onClick = (e: MouseEvent) => {
    const target = (e.target as Element | null)?.closest<HTMLElement>('[data-track]')
    if (!target) return
    const raw = target.dataset.track
    const name = raw && raw !== 'true' ? raw : 'cta_click'
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
  document.addEventListener('click', onClick, { capture: true })
  return () => document.removeEventListener('click', onClick, { capture: true })
}
