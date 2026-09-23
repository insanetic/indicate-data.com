'use client'

import { Button, useConfig, useField, useFormFields, useLocale } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import { newSeed } from '../block'
import { useL } from './i18n'

type Item = { id: number | string; title: string; reason: 'manual' | 'pinned' | 'auto' }

/** Shows what an automatic block currently picks, with a button to draw a new selection. */
export const SelectionPreview: React.FC<{ path: string; apiSlug?: string }> = ({ path, apiSlug = 'testimonials' }) => {
  const t = useL()
  const parent = path.split('.').slice(0, -1).join('.')
  const at = (name: string) => (parent ? `${parent}.${name}` : name)
  const { config } = useConfig()
  const locale = useLocale()
  const { value: seed, setValue: setSeed } = useField<string>({ path: at('seed') })
  const block = useFormFields(([fields]) => ({
    mode: fields[at('mode')]?.value,
    tags: fields[at('tags')]?.value,
    tagMatch: fields[at('tagMatch')]?.value,
    count: fields[at('count')]?.value,
    pinned: fields[at('pinned')]?.value,
    exclude: fields[at('exclude')]?.value,
    id: fields[at('id')]?.value,
  }))
  const [state, setState] = useState<{ items: Item[]; matching: number } | null>(null)
  const key = JSON.stringify({ ...block, seed, locale: locale?.code })

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${config.serverURL}${config.routes.api}/${apiSlug}/preview`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ block: { ...block, seed }, locale: locale?.code }),
          signal: controller.signal,
        })
        if (res.ok) setState(await res.json())
      } catch {
        /* aborted or offline: keep the last preview */
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const count = Number(block.count) || 3
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', margin: '0.5rem 0 1.5rem' }}>
      <div style={{ flex: 1, minWidth: '16rem' }}>
        <strong>{t('Aktuell angezeigt: ', 'Currently shown: ')}</strong>
        {state ? (state.items.length ? state.items.map((i) => i.title).join(', ') : '—') : '…'}
        {state && (
          <span style={{ color: 'var(--theme-elevation-500)' }}>
            {' · '}
            {state.matching} {t('passend', 'matching')}
          </span>
        )}
        {state && state.matching < count && (
          <div style={{ color: 'var(--theme-warning-500)' }}>
            {t(
              `Nur ${state.matching} Kundenstimmen passen zum Filter – Tags prüfen oder Anzahl senken.`,
              `Only ${state.matching} testimonials match the filter – check the tags or lower the count.`,
            )}
          </div>
        )}
      </div>
      <Button buttonStyle="secondary" onClick={() => setSeed(newSeed())} size="small">
        {t('Neu mischen', 'Reshuffle')}
      </Button>
    </div>
  )
}
