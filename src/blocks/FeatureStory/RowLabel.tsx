'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const PointRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()
  return <div>{data?.title || `Punkt ${rowNumber !== undefined ? rowNumber + 1 : ''}`}</div>
}
