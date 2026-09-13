'use client'

import { Search, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import React, { useDeferredValue, useEffect, useId, useMemo, useState } from 'react'

import { LocaleLink } from '@/components/LocaleLink'
import { Button } from '@/components/ui/button'
import { directoryLabels } from '@/integrations/labels'
import type { Locale } from '@/i18n/config'
import { normalise } from '@/integrations/getIntegrations'
import { integrationCategories, type Integration, type IntegrationCategory } from '@/integrations/types'
import { cn } from '@/utilities/ui'

export type DirectoryItem = Omit<Integration, 'description'> & { description: string }
type Props = {
  items: DirectoryItem[]
  locale: Locale
  request: { title: string | null; text: string | null; label: string | null; href: string | null }
}

type Filter = IntegrationCategory | 'all'

/**
 * Search box, category chips and the card grid. Filtering is instant and keyboard-friendly;
 * the query and category live in the URL (`?q=&category=`) so a filtered view can be shared.
 * The zero state turns the query into a request.
 */
export const DirectoryClient: React.FC<Props> = ({ items, locale, request }) => {
  const labels = directoryLabels[locale]
  // The page renders on request, so the URL state is already in the server HTML (shareable links).
  const params = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [category, setCategory] = useState<Filter>(toFilter(params.get('category')))
  const deferred = useDeferredValue(query)
  const inputId = useId()
  const statusId = useId()

  // Mirror changes back into the URL without a navigation.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (deferred) url.searchParams.set('q', deferred)
    else url.searchParams.delete('q')
    if (category !== 'all') url.searchParams.set('category', category)
    else url.searchParams.delete('category')
    window.history.replaceState(window.history.state, '', url)
  }, [deferred, category])

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: items.length, pms: 0, sales: 0, marketing: 0, web: 0, operations: 0, data: 0 }
    for (const i of items) c[i.category] += 1
    return c
  }, [items])

  const results = useMemo(() => {
    const key = normalise(deferred)
    return items.filter((i) => {
      if (category !== 'all' && i.category !== category) return false
      if (!key) return true
      const haystack = [i.name, ...(i.aliases || []), labels.categories[i.category], i.description].map(normalise).join(' ')
      return key.split(' ').every((part) => haystack.includes(part))
    })
  }, [items, deferred, category, labels])

  const requestHref = (term: string) =>
    request.href ? `${request.href}?message=${encodeURIComponent(labels.requestMessage(term))}` : null
  const empty = results.length === 0

  return (
    <div className="flex flex-col gap-8">
      {/* Search and filters */}
      <form
        className="reveal flex flex-col gap-4"
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <label className="sr-only" htmlFor={inputId}>
          {labels.search}
        </label>
        <div className="relative max-w-[36rem]">
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-3" strokeWidth={1.75} />
          <input
            aria-controls={statusId}
            autoComplete="off"
            className="h-13 w-full rounded-pill border border-line-strong bg-surface-2 pl-12 pr-12 text-base text-ink placeholder:text-ink-3 transition-[border-color,box-shadow] duration-150 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            data-1p-ignore
            id={inputId}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.placeholder}
            spellCheck={false}
            type="search"
            value={query}
          />
          {query && (
            <button
              aria-label={labels.clear}
              className="pressable absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-3 hover:bg-surface-3 hover:text-ink"
              onClick={(e) => {
                setQuery('')
                ;(e.currentTarget.previousElementSibling as HTMLInputElement | null)?.focus()
              }}
              type="button"
            >
              <X aria-hidden="true" className="size-4" strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={labels.all}>
          {(['all', ...integrationCategories] as Filter[]).map((c) => {
            const active = category === c
            return (
              <button
                aria-pressed={active}
                className={cn(
                  'pressable inline-flex h-9 items-center gap-2 rounded-pill border px-3.5 type-small font-medium transition-colors duration-150',
                  active
                    ? 'border-accent bg-accent text-accent-ink'
                    : 'border-line bg-surface-2 text-ink-2 hover:border-line-strong hover:text-ink',
                )}
                key={c}
                onClick={() => setCategory(c)}
                type="button"
              >
                {c === 'all' ? labels.all : labels.categories[c]}
                <span className={cn('tnum type-caption', active ? 'text-accent-ink/70' : 'text-ink-3')}>{counts[c]}</span>
              </button>
            )
          })}
        </div>
      </form>

      <p aria-live="polite" className="type-small tnum text-ink-3" id={statusId}>
        {labels.count(results.length, items.length)}
      </p>

      {/* Results */}
      {empty ? (
        <div className="card-surface flex flex-col items-start gap-4 p-8 md:p-10">
          <p className="type-h3 text-ink">{labels.noResultsTitle(query.trim())}</p>
          <p className="max-w-[52ch] type-body text-ink-2 pretty">{labels.noResultsText}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            {request.href && (
              <Button asChild>
                <LocaleLink href={requestHref(query.trim()) as string}>{labels.requestWithTerm(query.trim())}</LocaleLink>
              </Button>
            )}
            <Button
              onClick={() => {
                setQuery('')
                setCategory('all')
              }}
              type="button"
              variant="secondary"
            >
              {labels.reset}
            </Button>
          </div>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((i) => (
            <li className="card-surface flex gap-4 p-4" key={i.slug}>
              {/* Marks are drawn for light backgrounds, so the tile is white even on the dark page. */}
              <span
                className={cn(
                  'inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[0.75rem] border border-line p-2',
                  i.logo ? 'bg-white' : 'bg-surface',
                )}
              >
                {i.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static mark, sized by CSS
                  <img alt="" className="size-full object-contain" height={32} loading="lazy" src={i.logo} width={32} />
                ) : (
                  <span className="font-display text-base font-medium text-ink-2">{initials(i.name)}</span>
                )}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium leading-snug text-ink">{i.name}</span>
                  {i.status !== 'available' && (
                    <span className="shrink-0 rounded-pill border border-line px-1.5 text-[0.6875rem] font-medium leading-5 text-ink-3">
                      {labels.status[i.status]}
                    </span>
                  )}
                </span>
                <span className="type-caption text-ink-3">{labels.categories[i.category]}</span>
                <span className="type-small text-ink-2 pretty">{i.description}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Request card: always there, with the query carried into the message when one is set. */}
      {!empty && request.title && (
        <div className="card-surface flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex flex-col gap-1">
            <p className="type-h4 text-ink">{request.title}</p>
            {request.text && <p className="max-w-[60ch] type-small text-ink-2 pretty">{request.text}</p>}
          </div>
          {request.href && request.label && (
            <Button asChild className="shrink-0" variant="secondary">
              <LocaleLink href={requestHref(query.trim()) as string}>{request.label}</LocaleLink>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

const toFilter = (value: string | null): Filter =>
  value && (integrationCategories as readonly string[]).includes(value) ? (value as IntegrationCategory) : 'all'

function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean)
  return words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : name.slice(0, 2)
}
