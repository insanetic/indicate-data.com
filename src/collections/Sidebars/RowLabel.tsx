'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const GroupRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()
  return <span>{data?.title || `Gruppe ${(rowNumber ?? 0) + 1}`}</span>
}

export const LinkRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ link?: { label?: string } }>()
  return <span>{data?.link?.label || `Link ${(rowNumber ?? 0) + 1}`}</span>
}
