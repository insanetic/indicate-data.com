'use client'

import {
  Button,
  Drawer,
  ReactSelect,
  type ReactSelectOption,
  toast,
  useConfig,
  useDocumentInfo,
  useFormFields,
  useFormModified,
  useModal,
} from '@payloadcms/ui'
import { Copy } from 'lucide-react'
import React, { useState } from 'react'

import { useL } from './useL'

/** "Copy to page…": appends this block (as last saved) to another document's draft via the copy-block endpoint. */
export const CopyToPage: React.FC<{ rowPath: string }> = ({ rowPath }) => {
  const blockId = useFormFields(([fields]) => fields[`${rowPath}.id`]?.value as string | undefined)
  const { id, collectionSlug } = useDocumentInfo()
  const modified = useFormModified()
  const { config } = useConfig()
  const { openModal, closeModal } = useModal()
  const l = useL()
  const [options, setOptions] = useState<ReactSelectOption[]>([])
  const [target, setTarget] = useState<ReactSelectOption | null>(null)
  const [busy, setBusy] = useState(false)

  const drawerSlug = `copy-block-${blockId}`
  const api = `${config.serverURL}${config.routes.api}/${collectionSlug}`
  const useAsTitle = config.collections.find((c) => c.slug === collectionSlug)?.admin?.useAsTitle || 'id'

  const open = () => {
    setTarget(null)
    openModal(drawerSlug)
    const query = `depth=0&draft=true&pagination=false&sort=${useAsTitle}&select[${useAsTitle}]=true&where[id][not_equals]=${id}`
    fetch(`${api}?${query}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { docs: [] }))
      .then((d: { docs: Record<string, unknown>[] }) =>
        setOptions(d.docs.map((doc) => ({ label: String(doc[useAsTitle] || `#${doc.id}`), value: String(doc.id) }))),
      )
      .catch(() => setOptions([]))
  }

  const copy = async () => {
    if (!target) return
    setBusy(true)
    try {
      const res = await fetch(`${api}/copy-block`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId: id, targetId: target.value, blockId }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || res.statusText)
      closeModal(drawerSlug)
      toast.success(
        <span>
          {l('Kopiert nach', 'Copied to')}{' '}
          <a href={`${config.routes.admin}/collections/${collectionSlug}/${body.targetId}`}>{body.title}</a>
          {l(' (Entwurf)', ' (draft)')}
        </span>,
      )
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // The server copies the last saved version; with autosave that is at most a moment away.
  const disabled = !id || !blockId || modified

  return (
    <>
      <button
        className="block-tools__action"
        disabled={disabled}
        onClick={open}
        title={modified ? l('Wird gespeichert …', 'Saving …') : undefined}
        type="button"
      >
        <Copy aria-hidden size={14} />
        {l('Auf andere Seite kopieren', 'Copy to another page')}
      </button>
      <Drawer slug={drawerSlug} title={l('Block auf andere Seite kopieren', 'Copy block to another page')}>
        <p className="block-tools__drawer-hint">
          {l(
            'Der Block wird mit allen Sprachen ans Ende des Entwurfs der Zielseite angehängt. Live geht er erst mit der Veröffentlichung der Zielseite.',
            "The block is appended, in all languages, to the end of the target page's draft. It goes live when you publish that page.",
          )}
        </p>
        <ReactSelect
          onChange={(value) => setTarget(Array.isArray(value) ? (value[0] ?? null) : value)}
          options={options}
          placeholder={l('Zielseite wählen …', 'Choose a page …')}
          value={target ?? undefined}
        />
        <div className="block-tools__drawer-actions">
          <Button disabled={!target || busy} onClick={copy}>
            {busy ? l('Kopiert …', 'Copying …') : l('Kopieren', 'Copy')}
          </Button>
        </div>
      </Drawer>
    </>
  )
}
