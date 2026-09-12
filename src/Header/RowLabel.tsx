'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ label?: string; type?: string }>()
  const n = rowNumber !== undefined ? rowNumber + 1 : ''
  return <div>{data?.label ? `${n}. ${data.label}${data.type === 'menu' ? ' ▾' : ''}` : `Navigationspunkt ${n}`}</div>
}

export const ColumnRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()
  return <div>{data?.title || `Spalte ${rowNumber !== undefined ? rowNumber + 1 : ''}`}</div>
}

export const MenuLinkRowLabel: React.FC<RowLabelProps> = () => {
  const { data } = useRowLabel<{ link?: { label?: string } }>()
  return <div>{data?.link?.label || 'Eintrag'}</div>
}
