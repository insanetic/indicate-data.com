import type { ConsentClassNames } from '@subneo/payload-consent/react'

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]'
const link = 'underline underline-offset-4 hover:text-ink'

/** Site design system applied to the package slots. */
export const consentClassNames: ConsentClassNames = {
  banner:
    'consent-enter fixed inset-x-0 bottom-0 z-[60] bg-surface text-ink border-t border-line shadow-float p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-6 md:left-6 md:w-[26rem] md:rounded-card md:border md:p-6',
  bannerTitle: 'type-h4',
  bannerText: 'mt-2 type-small text-ink-2 pretty',
  bannerLinks: 'mt-3 flex flex-wrap gap-x-4 type-caption text-ink-3',
  bannerLink: link,
  bannerActions: 'mt-5 grid grid-cols-2 gap-3',
  bannerSettingsLink: `mt-3 type-small text-ink-2 ${link} ${focus}`,
  dialog:
    'consent-dialog fixed inset-x-0 bottom-0 m-0 w-full max-h-[85dvh] overflow-y-auto bg-surface text-ink border border-line shadow-float rounded-t-card p-0 md:inset-auto md:left-1/2 md:top-1/2 md:w-[min(34rem,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-card',
  dialogContent: 'relative p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:p-7',
  dialogTitle: 'type-h4 pr-10',
  dialogText: 'mt-2 type-small text-ink-2 pretty',
  dialogLinks: 'mt-3 flex flex-wrap gap-x-4 type-caption text-ink-3',
  dialogLink: link,
  closeButton: `absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-pill text-ink-2 hover:bg-surface-2 hover:text-ink md:right-6 md:top-6 ${focus}`,
  categoryList: 'mt-6 flex flex-col divide-y divide-line border-y border-line',
  categoryRow: 'flex flex-col gap-2 py-4',
  categoryHeader: 'flex items-center justify-between gap-4',
  categoryLabel: 'font-medium',
  categoryBadge: 'ml-2 type-caption text-ink-3',
  categoryDescription: 'type-small text-ink-2 pretty',
  services: 'type-small',
  servicesSummary: `cursor-pointer text-ink-2 ${link}`,
  serviceList: 'mt-2 flex flex-col gap-3',
  service: 'rounded-card-inner bg-surface-2 p-3',
  serviceName: 'font-medium',
  serviceProvider: 'font-normal text-ink-3',
  servicePurpose: 'mt-1 text-ink-2',
  serviceMeta: 'mt-1 type-caption text-ink-3',
  serviceLink: `mt-1 inline-block type-caption text-ink-3 ${link}`,
  switch: `relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill border border-line-strong bg-surface-2 transition-colors duration-150 motion-reduce:transition-none data-[state=checked]:bg-[var(--btn-primary-bg)] aria-disabled:cursor-not-allowed aria-disabled:opacity-60 ${focus}`,
  switchThumb:
    'block size-4 translate-x-1 rounded-pill bg-surface shadow-card transition-transform duration-150 motion-reduce:transition-none data-[state=checked]:translate-x-6',
  dialogActions: 'mt-6 flex flex-col gap-3 sm:flex-row-reverse sm:[&>*]:flex-1',
  trigger: `type-caption text-ink-3 transition-colors duration-150 hover:text-ink ${focus}`,
  floatingTrigger: `consent-enter inline-flex size-12 items-center justify-center rounded-pill border border-line bg-surface text-ink-2 shadow-float hover:text-ink ${focus}`,
  gate: 'flex flex-col gap-4 rounded-card border border-line bg-surface-2 p-6',
  gateText: 'type-small text-ink-2 pretty',
  gateActions: 'flex flex-wrap gap-3',
}
