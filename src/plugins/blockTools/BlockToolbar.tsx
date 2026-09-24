'use client'

import { useDocumentInfo, useField } from '@payloadcms/ui'
import { EyeOff } from 'lucide-react'
import React from 'react'

import { CopyToPage } from './CopyToPage'
import { useL } from './useL'

import './index.scss'

/** Slim bar at the top of a block: website visibility switch and "copy to page". */
export const BlockToolbar: React.FC<{ path: string }> = ({ path }) => {
  const rowPath = path.slice(0, path.lastIndexOf('.'))
  const { value, setValue } = useField<boolean>({ path: `${rowPath}.hidden` })
  const { docPermissions } = useDocumentInfo()
  const l = useL()
  const hidden = value === true

  return (
    <div className="block-tools">
      <div className="block-tools__bar">
        <button
          aria-checked={!hidden}
          className="block-tools__switch"
          disabled={!docPermissions?.update}
          onClick={() => setValue(!hidden)}
          role="switch"
          type="button"
        >
          <span aria-hidden className="block-tools__track">
            <span className="block-tools__thumb" />
          </span>
          {hidden ? l('Ausgeblendet', 'Hidden') : l('Auf der Website sichtbar', 'Visible on website')}
        </button>
        <CopyToPage rowPath={rowPath} />
      </div>
      {hidden && (
        <p className="block-tools__notice">
          <EyeOff aria-hidden size={14} />
          {l(
            'Erscheint nicht auf der Website. Der Inhalt bleibt gespeichert und kann jederzeit wieder eingeblendet werden.',
            'Not shown on the website. The content stays saved and can be shown again at any time.',
          )}
        </p>
      )}
    </div>
  )
}
