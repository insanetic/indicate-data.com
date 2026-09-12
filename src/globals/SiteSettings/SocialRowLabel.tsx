'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const SocialRowLabel: React.FC<RowLabelProps> = () => {
  const { data } = useRowLabel<{ platform?: string; url?: string }>()
  return <div>{data?.platform ? `${data.platform}: ${data.url || ''}` : 'Netzwerk / Network'}</div>
}
