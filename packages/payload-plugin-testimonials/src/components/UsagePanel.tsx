'use client'

import { useConfig, useDocumentInfo } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import type { Usage } from '../usage'
import { useL } from './i18n'

/** Sidebar list of the pages that show or reference this testimonial. */
export const UsagePanel: React.FC<{ apiSlug?: string; usageCollection?: string }> = ({
  apiSlug = 'testimonials',
  usageCollection = 'pages',
}) => {
  const t = useL()
  const { id } = useDocumentInfo()
  const { config } = useConfig()
  const [usages, setUsages] = useState<Usage[] | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`${config.serverURL}${config.routes.api}/${apiSlug}/${id}/usage`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { usages: [] }))
      .then((d) => setUsages(d.usages ?? []))
      .catch(() => setUsages([]))
  }, [id, apiSlug, config.serverURL, config.routes.api])

  const reason = (u: Usage) =>
    u.reason === 'manual' ? t('von Hand', 'manual') : u.reason === 'pinned' ? t('fixiert', 'pinned') : t('automatisch', 'automatic')

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div className="field-label">{t('Verwendet auf', 'Shown on')}</div>
      {!id && <p>{t('Nach dem ersten Speichern sichtbar.', 'Visible after the first save.')}</p>}
      {id && usages === null && <p>…</p>}
      {usages && usages.length === 0 && <p>{t('Derzeit auf keiner Seite.', 'Not on any page right now.')}</p>}
      {usages && usages.length > 0 && (
        <>
          <ul style={{ paddingLeft: '1rem', margin: '0.25rem 0' }}>
            {usages.map((u) => (
              <li key={`${u.docId}-${u.blockIndex}`}>
                <a href={`${config.routes.admin}/collections/${usageCollection}/${u.docId}`}>{u.docTitle}</a>
                {u.heading ? ` · ${u.heading}` : ''} · {reason(u)}
                {!u.shown && ` (${t('derzeit ausgeblendet', 'currently hidden')})`}
              </li>
            ))}
          </ul>
          <p style={{ color: 'var(--theme-warning-500)' }}>
            {t('Löschen oder Umbenennen wirkt sich auf diese Seiten aus.', 'Deleting or renaming affects these pages.')}
          </p>
        </>
      )}
    </div>
  )
}
