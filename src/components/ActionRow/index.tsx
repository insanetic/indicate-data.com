import React from 'react'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

type CMSLinkProps = React.ComponentProps<typeof CMSLink>

export type ActionLink = {
  link: Pick<CMSLinkProps, 'type' | 'newTab' | 'reference' | 'url'> & {
    label?: string | null
    appearance?: 'default' | 'outline' | 'ghost' | 'link' | null
  }
  id?: string | null
}

const variant = (appearance: ActionLink['link']['appearance']) =>
  appearance === 'outline' ? 'secondary' : appearance === 'link' ? 'link' : appearance === 'ghost' ? 'ghost' : 'primary'

/** Up to two buttons or links in a row, shared by the Heading, Split and Actions blocks. */
export const ActionRow: React.FC<{
  links?: ActionLink[] | null
  align?: 'left' | 'center' | 'right'
  size?: 'lg'
  /** Click-tracking location (data-track contract of @subneo/payload-consent). */
  track?: string
  className?: string
}> = ({ links, align = 'left', size, track, className }) => {
  const buttons = (links || []).filter((l) => l.link?.label)
  if (buttons.length === 0) return null
  return (
    <div className={cn('flex flex-wrap items-center gap-3', align === 'center' && 'justify-center', align === 'right' && 'justify-end', className)}>
      {buttons.map(({ link, id }, i) => (
        <CMSLink key={id || i} {...link} appearance={variant(link.appearance)} size={size} track={track ? { location: track } : undefined} />
      ))}
    </div>
  )
}
