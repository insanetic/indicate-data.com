'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const FaqRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ question?: string }>()
  return <div>{data?.question || `Frage ${rowNumber !== undefined ? rowNumber + 1 : ''}`}</div>
}
