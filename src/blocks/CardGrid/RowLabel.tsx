'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const CardRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()
  return <div>{data?.title || `Karte ${rowNumber !== undefined ? rowNumber + 1 : ''}`}</div>
}
