import { Check } from 'lucide-react'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { Icon } from '@/components/Icon'
import { findMcpClient } from '@/integrations/clients'
import { withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

export type FeatureData = {
  icon?: string | null
  title: string
  text?: string | null
  points?: { text: string; id?: string | null }[] | null
  link?: React.ComponentProps<typeof CMSLink> | null
}

/**
 * The one shape for an entry that describes or links something: icon on top, title, text,
 * optional bullet points and link. No border, no surface of its own.
 */
export const Feature: React.FC<FeatureData & { className?: string; style?: React.CSSProperties }> = ({
  icon,
  title,
  text,
  points,
  link,
  className,
  style,
}) => {
  // An entry named after an AI assistant shows the vendor's mark instead of an icon.
  const client = findMcpClient(title)
  return (
    <li className={cn('flex flex-col gap-4', className)} style={style}>
      {client?.logo ? (
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-btn bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element -- static vendor mark */}
          <img alt="" className="size-5" height={20} src={client.logo} width={20} />
        </span>
      ) : (
        <Icon className="text-accent" name={icon} size={26} />
      )}
      <div className="flex flex-col gap-2">
        <h3 className="type-h4 text-ink">{withResi(title)}</h3>
        {text && <p className="type-small text-ink-2 pretty max-w-[44ch]">{withResi(text)}</p>}
      </div>
      {(points || []).length > 0 && (
        <ul className="flex flex-col gap-2">
          {points!.map((p, i) => (
            <li className="flex items-start gap-2 type-small text-ink-2" key={p.id || i}>
              <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent" strokeWidth={2} />
              <span>{withResi(p.text)}</span>
            </li>
          ))}
        </ul>
      )}
      {link && <CMSLink {...link} appearance="inline" className="link-arrow mt-auto type-small" />}
    </li>
  )
}
