'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const ColumnRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()
  return <div>{data?.title || `Spalte ${rowNumber !== undefined ? rowNumber + 1 : ''}`}</div>
}

export const LinkRowLabel: React.FC<RowLabelProps> = () => {
  const { data } = useRowLabel<{ link?: { label?: string } }>()
  return <div>{data?.link?.label || 'Link'}</div>
}
