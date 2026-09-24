'use client'

import { Pill, SectionTitle, useDocumentInfo, useFormFields, useRowLabel, useTranslation } from '@payloadcms/ui'
import type { StaticLabel } from 'payload'
import React from 'react'

import { useL } from './useL'

const baseClass = 'blocks-field'

const labelText = (label: StaticLabel | undefined, language: string): string => {
  if (!label) return ''
  if (typeof label === 'string') return label
  return label[language] ?? Object.values(label)[0] ?? ''
}

/** Default block row header (number, block type, editable block name) plus a pill when the block is hidden. */
export const BlockRowLabel: React.FC<{ label?: StaticLabel }> = ({ label }) => {
  const { path, rowNumber } = useRowLabel()
  const { i18n } = useTranslation()
  const { docPermissions } = useDocumentInfo()
  const hidden = useFormFields(([fields]) => fields[`${path}.hidden`]?.value === true)
  const l = useL()

  return (
    <>
      <span className={`${baseClass}__block-number`}>{String((rowNumber ?? 0) + 1).padStart(2, '0')}</span>
      <Pill className={`${baseClass}__block-pill`} pillStyle="white" size="small">
        {labelText(label, i18n.language)}
      </Pill>
      <SectionTitle path={`${path}.blockName`} readOnly={!docPermissions?.update} />
      {hidden && (
        <Pill pillStyle="warning" size="small">
          {l('Ausgeblendet', 'Hidden')}
        </Pill>
      )}
    </>
  )
}
