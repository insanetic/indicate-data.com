'use client'

import { Button, useConfig, useField, useForm, useFormFields, useLocale } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import { newSeed } from '../block'
import { useL } from './i18n'

type Item = { id: number | string; title: string; reason: 'manual' | 'pinned' | 'auto' }
type Row = Record<string, unknown> & { blockType?: string }

/**
 * Where the block sits: `layout.3.preview` → the layout at `layout`, index 3. A block outside an
 * array (no numeric segment) has no page context and is previewed on its own.
 */
const locate = (path: string) => {
  const segments = path.split('.').slice(0, -1)
  const index = Number(segments.at(-1))
  return Number.isInteger(index) && segments.length > 1 ? { layoutPath: segments.slice(0, -1).join('.'), blockIndex: index } : null
}

/**
 * Shows what the block currently picks, with a button to draw a new selection. It sends the
 * unsaved form state of the page up to this block, so earlier blocks on the page are taken into
 * account exactly as on the site.
 */
export const SelectionPreview: React.FC<{ path: string; apiSlug?: string }> = ({ path, apiSlug = 'testimonials' }) => {
  const t = useL()
  const parent = path.split('.').slice(0, -1).join('.')
  const at = (name: string) => (parent ? `${parent}.${name}` : name)
  const place = locate(path)
  const { config } = useConfig()
  const locale = useLocale()
  const { getDataByPath } = useForm()
  const { value: seed, setValue: setSeed } = useField<string>({ path: at('seed') })
  const block = useFormFields(([fields]) => ({
    blockType: fields[at('blockType')]?.value,
    mode: fields[at('mode')]?.value,
    tags: fields[at('tags')]?.value,
    tagMatch: fields[at('tagMatch')]?.value,
    count: fields[at('count')]?.value,
    pinned: fields[at('pinned')]?.value,
    exclude: fields[at('exclude')]?.value,
    id: fields[at('id')]?.value,
  }))
  // A string key of the earlier blocks of the same type: re-render (and re-fetch) only when one
  // of them changes, not on every keystroke elsewhere in the page.
  const earlier = useFormFields(([fields]) => {
    if (!place) return ''
    const prefix = `${place.layoutPath}.`
    const own = fields[at('blockType')]?.value
    const rows = new Set<string>()
    for (let i = 0; i < place.blockIndex; i++) if (fields[`${prefix}${i}.blockType`]?.value === own) rows.add(String(i))
    return Object.keys(fields)
      .filter((key) => key.startsWith(prefix) && rows.has(key.slice(prefix.length).split('.')[0]))
      .sort()
      .map((key) => `${key}=${JSON.stringify(fields[key]?.value ?? null)}`)
      .join('|')
  })
  const [state, setState] = useState<{ items: Item[]; matching: number } | null>(null)
  const key = JSON.stringify({ ...block, seed, locale: locale?.code, earlier })

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      const current = { ...block, seed }
      const data = place ? getDataByPath<Row[]>(place.layoutPath) : undefined
      // Other block types only hold their place; their content does not affect the selection.
      const layout =
        place && Array.isArray(data) && data[place.blockIndex]
          ? data.slice(0, place.blockIndex + 1).map((row, i) =>
              i === place.blockIndex ? { ...row, ...current } : row?.blockType === current.blockType ? row : { blockType: row?.blockType },
            )
          : null
      const body = layout && place ? { block: current, layout, blockIndex: place.blockIndex, locale: locale?.code } : { block: current, locale: locale?.code }
      try {
        const res = await fetch(`${config.serverURL}${config.routes.api}/${apiSlug}/preview`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
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
