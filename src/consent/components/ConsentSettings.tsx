// src/consent/components/ConsentSettings.tsx
'use client'

import React, { useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'

import type { OptionalCategoryKey } from '../config'
import { allChoices, type Choices } from '../store'
import { useConsent } from './ConsentProvider'
import { Switch } from './Switch'

/**
 * Second layer: a native <dialog> (focus trap, Escape and top layer for free). One row per
 * category with a switch, description and a collapsible service list.
 */
export const ConsentSettings: React.FC = () => {
  const consent = useConsent()
  const { enabled, dialogOpen, texts, record, choices, locale, privacyHref, imprintHref } = consent
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [draft, setDraft] = useState<Choices>(choices)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the saved choices each time the dialog opens; no external system to subscribe to instead.
    if (dialogOpen) setDraft(record?.c || allChoices(false))
  }, [dialogOpen, record])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (dialogOpen && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
    } else if (!dialogOpen && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close()
      else dialog.removeAttribute('open')
    }
  }, [dialogOpen])

  if (!enabled) return null

  const lastChanged =
    record && !Number.isNaN(Date.parse(record.t))
      ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(record.t))
      : null

  return (
    <dialog
      aria-labelledby={titleId}
      className={cn(
        'consent-dialog fixed inset-x-0 bottom-0 m-0 w-full max-h-[85dvh] overflow-y-auto bg-surface text-ink border border-line shadow-float',
        'rounded-t-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]',
        'md:inset-auto md:left-1/2 md:top-1/2 md:w-[min(34rem,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-card md:p-7',
      )}
      onClose={consent.closeSettings}
      ref={ref}
    >
      <h2 className="type-h4" id={titleId}>
        {texts.settingsTitle}
      </h2>
      <p className="mt-2 type-small text-ink-2 pretty">{texts.settingsText}</p>
      <p className="mt-3 flex flex-wrap gap-x-4 type-caption text-ink-3">
        {privacyHref && (
          <a className="underline underline-offset-4 hover:text-ink" href={privacyHref}>
            {texts.privacy}
          </a>
        )}
        {imprintHref && (
          <a className="underline underline-offset-4 hover:text-ink" href={imprintHref}>
            {texts.imprint}
          </a>
        )}
        {lastChanged && (
          <span>
            {texts.lastChanged} {lastChanged}
          </span>
        )}
      </p>

      <ul className="mt-6 flex flex-col divide-y divide-line border-y border-line">
        {texts.categories.map((category) => {
          const labelId = `${titleId}-${category.key}`
          const checked = category.required ? true : draft[category.key as OptionalCategoryKey]
          return (
            <li className="flex flex-col gap-2 py-4" key={category.key}>
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium" id={labelId}>
                  {category.label}
                  {category.required && <span className="ml-2 type-caption text-ink-3">{texts.alwaysActive}</span>}
                </span>
                <Switch
                  aria-labelledby={labelId}
                  checked={checked}
                  disabled={category.required}
                  onChange={(value) => setDraft((d) => ({ ...d, [category.key]: value }))}
                />
              </div>
              <p className="type-small text-ink-2 pretty">{category.description}</p>
              {category.services.length > 0 && (
                <details className="type-small">
                  <summary className="cursor-pointer text-ink-2 underline underline-offset-4 hover:text-ink">
                    {texts.showServices} ({category.services.length})
                  </summary>
                  <ul className="mt-2 flex flex-col gap-3">
                    {category.services.map((service, index) => (
                      <li className="rounded-card-inner bg-surface-2 p-3" key={service.id || `${service.name}-${index}`}>
                        <p className="font-medium">
                          {service.name}
                          {service.provider && <span className="font-normal text-ink-3"> · {service.provider}</span>}
                        </p>
                        {service.purpose && <p className="mt-1 text-ink-2">{service.purpose}</p>}
                        {service.cookies && (
                          <p className="mt-1 type-caption text-ink-3">
                            {texts.cookies}: {service.cookies}
                          </p>
                        )}
                        {service.privacyUrl && (
                          <a
                            className="mt-1 inline-block type-caption underline underline-offset-4 text-ink-3 hover:text-ink"
                            href={service.privacyUrl}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {texts.privacyLink}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          )
        })}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
        <Button className="sm:flex-1" onClick={() => consent.save(draft)} variant="primary">
          {texts.saveSelection}
        </Button>
        <Button className="sm:flex-1" onClick={consent.acceptAll} variant="secondary">
          {texts.acceptAll}
        </Button>
        <Button className="sm:flex-1" onClick={consent.rejectAll} variant="secondary">
          {texts.rejectAll}
        </Button>
      </div>
    </dialog>
  )
}
