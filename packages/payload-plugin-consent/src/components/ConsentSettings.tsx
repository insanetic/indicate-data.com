'use client'

import React, { useEffect, useId, useRef, useState } from 'react'

import type { Choices } from '../setup'
import { allChoices } from '../store'
import { useConsent } from './ConsentProvider'
import { Switch } from './Switch'

const CloseIcon = () => (
  <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

/**
 * Second layer: a native <dialog> (focus trap, Escape and top layer for free). One row per
 * category with a switch, description and a collapsible service list. Backdrop click and the
 * close button dismiss it without deciding.
 */
export const ConsentSettings: React.FC<{ className?: string }> = ({ className }) => {
  const consent = useConsent()
  const { setup, enabled, status, dialogOpen, texts, record, locale, privacyHref, imprintHref, Button, cx } = consent
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  const [draft, setDraft] = useState<Choices>(() => allChoices(setup, false))

  useEffect(() => {
    // Strict reading of "no pre-ticked boxes": the draft mirrors the record only while it is valid.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft each time the dialog opens.
    if (dialogOpen) setDraft(status === 'decided' && record ? record.c : allChoices(setup, false))
  }, [dialogOpen, record, status, setup])

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
      aria-describedby={`${id}-text`}
      aria-labelledby={`${id}-title`}
      className={cx('dialog', className)}
      data-consent="dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) consent.closeSettings()
      }}
      onClose={consent.closeSettings}
      ref={ref}
    >
      <div className={cx('dialogContent')} data-consent="dialogContent">
        <button aria-label={texts.close} className={cx('closeButton')} data-consent="closeButton" onClick={consent.closeSettings} type="button">
          <CloseIcon />
        </button>
        <h2 className={cx('dialogTitle')} data-consent="dialogTitle" id={`${id}-title`}>
          {texts.settingsTitle}
        </h2>
        <p className={cx('dialogText')} data-consent="dialogText" id={`${id}-text`}>
          {texts.settingsText}
        </p>
        <p className={cx('dialogLinks')} data-consent="dialogLinks">
          {privacyHref && (
            <a className={cx('dialogLink')} data-consent="dialogLink" href={privacyHref}>
              {texts.privacy}
            </a>
          )}
          {imprintHref && (
            <a className={cx('dialogLink')} data-consent="dialogLink" href={imprintHref}>
              {texts.imprint}
            </a>
          )}
          {lastChanged && (
            <span>
              {texts.lastChanged} {lastChanged}
            </span>
          )}
        </p>

        <ul className={cx('categoryList')} data-consent="categoryList">
          {texts.categories.map((category) => {
            const labelId = `${id}-${category.key}`
            const checked = category.required ? true : Boolean(draft[category.key])
            return (
              <li className={cx('categoryRow')} data-consent="categoryRow" key={category.key}>
                <div className={cx('categoryHeader')} data-consent="categoryHeader">
                  <span className={cx('categoryLabel')} data-consent="categoryLabel" id={labelId}>
                    {category.label}
                    {category.required && (
                      <span className={cx('categoryBadge')} data-consent="categoryBadge">
                        {texts.alwaysActive}
                      </span>
                    )}
                  </span>
                  <Switch
                    aria-labelledby={labelId}
                    checked={checked}
                    disabled={category.required}
                    onChange={(value) => setDraft((d) => ({ ...d, [category.key]: value }))}
                  />
                </div>
                <p className={cx('categoryDescription')} data-consent="categoryDescription">
                  {category.description}
                </p>
                {category.services.length > 0 && (
                  <details className={cx('services')} data-consent="services">
                    <summary className={cx('servicesSummary')} data-consent="servicesSummary">
                      {texts.showServices} ({category.services.length})
                    </summary>
                    <ul className={cx('serviceList')} data-consent="serviceList">
                      {category.services.map((service, index) => (
                        <li className={cx('service')} data-consent="service" key={service.id || `${service.name}-${index}`}>
                          <p className={cx('serviceName')} data-consent="serviceName">
                            {service.name}
                            {service.provider && (
                              <span className={cx('serviceProvider')} data-consent="serviceProvider">
                                {' '}
                                · {texts.provider}: {service.provider}
                              </span>
                            )}
                          </p>
                          {service.purpose && (
                            <p className={cx('servicePurpose')} data-consent="servicePurpose">
                              {service.purpose}
                            </p>
                          )}
                          {service.cookies && (
                            <p className={cx('serviceMeta')} data-consent="serviceMeta">
                              {texts.cookies}: {service.cookies}
                            </p>
                          )}
                          {service.privacyUrl && (
                            <a className={cx('serviceLink')} data-consent="serviceLink" href={service.privacyUrl} rel="noopener noreferrer" target="_blank">
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

        <div className={cx('dialogActions')} data-consent="dialogActions">
          <Button onClick={() => consent.save(draft)} variant="primary">
            {texts.saveSelection}
          </Button>
          <Button onClick={consent.acceptAll} variant="secondary">
            {texts.acceptAll}
          </Button>
          <Button onClick={consent.rejectAll} variant="secondary">
            {texts.rejectAll}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
