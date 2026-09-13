import React from 'react'

import { findMcpClient } from '@/integrations/clients'
import { cn } from '@/utilities/ui'

/**
 * A small chip naming an AI assistant, with its official mark when we have one.
 * Marks are drawn for light backgrounds, so they sit on a white disc.
 */
export const ClientMark: React.FC<{ name: string; className?: string; size?: number }> = ({ name, className, size = 14 }) => {
  const client = findMcpClient(name)
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap', className)}>
      {client?.logo && (
        <span
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-white"
          style={{ width: size + 6, height: size + 6 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static vendor mark */}
          <img alt="" height={size} src={client.logo} style={{ width: size, height: size }} width={size} />
        </span>
      )}
      {name}
    </span>
  )
}
