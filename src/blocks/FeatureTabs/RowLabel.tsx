'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const TabRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ label?: string }>()
  return <div>{data?.label || `Tab ${rowNumber !== undefined ? rowNumber + 1 : ''}`}</div>
}
