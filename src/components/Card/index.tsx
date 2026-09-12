'use client'
import { cn } from '@/utilities/ui'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { LocaleLink } from '@/components/LocaleLink'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

/** Post card. The title link is stretched over the whole card, so text stays selectable. */
export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { className, doc, relationTo = 'posts', showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'card-surface relative flex flex-col overflow-hidden transition-colors duration-150 hover:border-line-strong',
        className,
      )}
    >
      <div className="relative w-full">
        {!metaImage && <div className="aspect-[16/9] bg-surface-2" />}
        {metaImage && typeof metaImage !== 'string' && <Media resource={metaImage} size="33vw" />}
      </div>
      <div className="flex flex-col gap-2 p-5">
        {showCategories && hasCategories && (
          <div className="type-caption text-ink-3">
            {categories?.map((category, index) => {
              if (typeof category === 'object') {
                const { title: titleFromCategory } = category
                const categoryTitle = titleFromCategory || 'Untitled category'
                const isLast = index === categories.length - 1
                return (
                  <Fragment key={index}>
                    {categoryTitle}
                    {!isLast && <Fragment>, &nbsp;</Fragment>}
                  </Fragment>
                )
              }
              return null
            })}
          </div>
        )}
        {titleToUse && (
          <h3 className="type-h4 text-ink">
            <LocaleLink className="after:absolute after:inset-0 after:content-['']" href={href}>
              {titleToUse}
            </LocaleLink>
          </h3>
        )}
        {description && <p className="type-small text-ink-2">{sanitizedDescription}</p>}
      </div>
    </article>
  )
}
