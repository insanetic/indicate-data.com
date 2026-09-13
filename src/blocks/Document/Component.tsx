import React from 'react'

import type { DocumentBlock as Props, Sidebar } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import RichText from '@/components/RichText'
import { SectionHeading } from '@/components/SectionHeading'
import { DocumentMeta, formatDate, isoDate } from '@/components/DocumentLayout/DocumentMeta'
import { PrintButton } from '@/components/DocumentLayout/PrintButton'
import { SidebarNav } from '@/components/DocumentLayout/SidebarNav'
import { Toc } from '@/components/DocumentLayout/Toc'
import { TranslationNotice } from '@/components/DocumentLayout/TranslationNotice'
import { sidebarGroupsFromDoc } from '@/components/DocumentLayout/sidebarData'
import { getDictionary } from '@/i18n/dictionaries'
import { extractHeadings } from '@/utilities/lexical/headings'

/** Long-form document: tinted header band, sidebar, article with anchored headings, TOC, history. */
export const DocumentBlock: React.FC<Props & { locale: Locale; slug?: string }> = ({
  header,
  sidebar,
  meta,
  bindingLanguage,
  showToc,
  body,
  history,
  locale,
  slug = '',
}) => {
  const dict = getDictionary(locale)
  const sidebarDoc = sidebar && typeof sidebar === 'object' ? (sidebar as Sidebar) : null
  const groups = sidebarDoc ? sidebarGroupsFromDoc(sidebarDoc) : []
  const hasSidebar = groups.length > 0
  const headings = showToc === false ? [] : extractHeadings(body)
  const hasToc = headings.length > 1
  const entries = (history || []).filter((h) => h.date && h.note)

  return (
    <article className="document">
      <header className="border-b border-line bg-surface-2">
        <div className="container py-12 md:py-16">
          <div className={hasSidebar ? 'lg:ml-[calc(16rem+4rem)]' : ''}>
            <SectionHeading as="h1" size="display" header={header} align="left" />
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <DocumentMeta
                binding={bindingLanguage}
                labels={{ lastUpdated: dict.lastUpdated, effectiveFrom: dict.effectiveFrom, version: dict.version, bindingVersion: dict.bindingVersion }}
                locale={locale}
                meta={meta}
              />
              <PrintButton label={dict.print} />
            </div>
          </div>
        </div>
      </header>

      <div className="container py-10 md:py-14">
        <div className={hasSidebar ? 'grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16' : ''}>
          {hasSidebar && (
            <div className="lg:sticky lg:top-24 lg:self-start print:hidden">
              <SidebarNav contact={sidebarDoc?.contact?.enabled ? sidebarDoc.contact : null} groups={groups} labels={{ more: dict.moreDocuments, questions: dict.contactQuestions }} />
            </div>
          )}
          <div className={hasToc ? 'grid gap-10 xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-16' : ''}>
            <div className="flex min-w-0 flex-col gap-8">
              <div className="print:hidden">
                <TranslationNotice binding={bindingLanguage} locale={locale} slug={slug} />
              </div>
              <RichText
                className="prose-document max-w-[70ch]"
                copyLinkLabel={dict.copyLink}
                data={body}
                enableGutter={false}
                headingIds
              />
              {entries.length > 0 && (
                <details className="max-w-[70ch] border-t border-line pt-6">
                  <summary className="cursor-pointer type-small font-medium text-ink">{dict.previousVersions}</summary>
                  <ol className="mt-4 flex flex-col gap-2 type-small text-ink-2">
                    {entries.map((h, i) => (
                      <li className="flex gap-4" key={h.id || i}>
                        <time className="shrink-0 tabular-nums text-ink-3" dateTime={isoDate(h.date)}>
                          {formatDate(h.date, locale)}
                        </time>
                        <span>{h.note}</span>
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </div>
            {hasToc && (
              <div className="-order-1 xl:sticky xl:top-24 xl:order-none xl:self-start print:hidden">
                <Toc headings={headings} label={dict.onThisPage} />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
