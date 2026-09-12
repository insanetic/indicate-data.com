import React from 'react'

import type { LogoWallBlock as Props } from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

export const LogoWallBlock: React.FC<Props> = ({ header, display, logos }) => {
  const items = (logos || []).filter((l) => l.name)
  if (items.length === 0) return null
  const marquee = display !== 'grid' && items.length >= 5

  const renderLogo = (logo: (typeof items)[number], i: number, clone = false) => {
    const content =
      logo.image && typeof logo.image === 'object' ? (
        <Media htmlElement={null} imgClassName="h-7 w-auto md:h-8" resource={logo.image} />
      ) : (
        <span className="whitespace-nowrap font-display text-xl font-medium text-ink-3 md:text-2xl">
          {logo.name}
        </span>
      )
    const cls = 'flex h-12 items-center px-6 md:px-8 opacity-80 transition-opacity duration-150 hover:opacity-100'
    return (
      <li aria-hidden={clone || undefined} className={cls} data-clone={clone || undefined} key={`${logo.id || i}-${clone ? 'c' : 'o'}`}>
        {logo.url ? (
          <a className="rounded-md" href={logo.url} rel="noopener noreferrer" target="_blank" tabIndex={clone ? -1 : undefined}>
            {content}
          </a>
        ) : (
          content
        )}
      </li>
    )
  }

  return (
    <div className="container">
      {header?.heading && (
        <p className="mb-8 text-center type-small font-medium text-ink-3">{header.heading}</p>
      )}
      {marquee ? (
        <div
          className="marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
          style={{ '--marquee-duration': `${Math.max(30, items.length * 5)}s` } as React.CSSProperties}
        >
          <ul className="marquee-track items-center">
            {items.map((l, i) => renderLogo(l, i))}
            {items.map((l, i) => renderLogo(l, i, true))}
          </ul>
        </div>
      ) : (
        <ul className={cn('flex flex-wrap items-center justify-center gap-y-4')}>
          {items.map((l, i) => renderLogo(l, i))}
        </ul>
      )}
    </div>
  )
}
