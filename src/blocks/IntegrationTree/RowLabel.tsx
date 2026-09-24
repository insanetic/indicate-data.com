'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const GroupRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()
  return <div>{data?.title || `Gruppe ${rowNumber !== undefined ? rowNumber + 1 : ''}`}</div>
}

export const ItemRowLabel: React.FC<RowLabelProps> = () => {
  const { data } = useRowLabel<{ name?: string }>()
  return <div>{data?.name || 'System'}</div>
}
