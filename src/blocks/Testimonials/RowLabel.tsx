'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const QuoteRowLabel: React.FC<RowLabelProps> = () => {
  const { data } = useRowLabel<{ name?: string; company?: string }>()
  return <div>{data?.name ? `${data.name}${data.company ? `, ${data.company}` : ''}` : 'Zitat'}</div>
}
