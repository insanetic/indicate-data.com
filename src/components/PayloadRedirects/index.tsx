import type React from 'react'
import type { Page, Post } from '@/payload-types'

import { getCachedDocument } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'
import { localizeHref } from '@/i18n/href'
import { type Locale } from '@/i18n/config'
import { notFound, redirect } from 'next/navigation'

interface Props {
  disableNotFound?: boolean
  locale: Locale
  /** Path without locale prefix, e.g. `/kontakt` or `/posts/hallo`. */
  url: string
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, locale, url }) => {
  const redirects = await getCachedRedirects()()

  const redirectItem = redirects.find(
    (redirect) => redirect.from === url || redirect.from === `/${locale}${url}`,
  )

  if (redirectItem) {
    if (redirectItem.to?.url) {
      redirect(localizeHref(redirectItem.to.url, locale))
    }

    let redirectUrl: string

    if (typeof redirectItem.to?.reference?.value === 'string') {
      const collection = redirectItem.to?.reference?.relationTo
      const id = redirectItem.to?.reference?.value

      const document = (await getCachedDocument(collection, id)()) as Page | Post
      redirectUrl = `${redirectItem.to?.reference?.relationTo !== 'pages' ? `/${redirectItem.to?.reference?.relationTo}` : ''}/${
        document?.slug
      }`
    } else {
      redirectUrl = `${redirectItem.to?.reference?.relationTo !== 'pages' ? `/${redirectItem.to?.reference?.relationTo}` : ''}/${
        typeof redirectItem.to?.reference?.value === 'object'
          ? redirectItem.to?.reference?.value?.slug
          : ''
      }`
    }

    if (redirectUrl) redirect(localizeHref(redirectUrl, locale))
  }

  if (disableNotFound) return null

  notFound()
}
