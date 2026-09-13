import { Languages } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { isLocale, localeLabels, localeTags, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'

export type BindingLanguage = 'none' | Locale | null | undefined

/** True when the reader's language is not the legally binding one. */
export const shouldShowTranslationNotice = (locale: Locale, binding: BindingLanguage): binding is Locale =>
  isLocale(binding) && binding !== locale

type Props = { locale: Locale; binding: BindingLanguage; slug: string }

/** Calm bordered note above a translated document, linking to the binding version. */
export const TranslationNotice: React.FC<Props> = ({ locale, binding, slug }) => {
  if (!shouldShowTranslationNotice(locale, binding)) return null
  const dict = getDictionary(locale)
  // The sentence names the binding language in the reader's language ("German"), the link
  // label keeps the endonym so readers recognise the version they are about to open.
  const languageName = dict.languageNames[binding]
  const endonym = localeLabels[binding]
  return (
    <aside
      className="flex flex-col gap-3 rounded-md border border-line bg-surface-2 px-5 py-4 type-small text-ink-2 sm:flex-row sm:items-center sm:justify-between print:bg-transparent"
      role="note"
    >
      <p className="flex items-start gap-3">
        <Languages aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.75} />
        {/* A function replacer keeps `$&` and friends in a language name from being expanded. */}
        <span>{dict.translationNotice.replace('{language}', () => languageName)}</span>
      </p>
      <Link
        className="shrink-0 font-medium text-ink underline-offset-4 hover:underline print:hidden"
        href={`/${binding}/${slug}`}
        hrefLang={localeTags[binding]}
      >
        {dict.readBindingVersion} ({endonym})
      </Link>
    </aside>
  )
}
