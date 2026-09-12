'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const PlanRowLabel: React.FC<RowLabelProps> = () => {
  const { data } = useRowLabel<{ name?: string; price?: string }>()
  return <div>{data?.name ? `${data.name} ${data.price ? `· ${data.price}` : ''}` : 'Paket'}</div>
}
