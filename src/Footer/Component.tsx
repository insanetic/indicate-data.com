import React from 'react'

import type { Locale } from '@/i18n/config'

import { CMSLink } from '@/components/Link'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { LocaleLink } from '@/components/LocaleLink'
import { Logo } from '@/components/Logo/Logo'
import { getDictionary } from '@/i18n/dictionaries'
import { getCachedGlobal } from '@/utilities/getGlobals'

const socialLabels: Record<string, string> = {
  linkedin: 'LinkedIn',
  discord: 'Discord',
  instagram: 'Instagram',
  youtube: 'YouTube',
  facebook: 'Facebook',
  x: 'X',
}

export async function Footer({ locale }: { locale: Locale }) {
  const [footer, settings] = await Promise.all([
    getCachedGlobal('footer', 1, locale)(),
    getCachedGlobal('site-settings', 1, locale)(),
  ])
  const dict = getDictionary(locale)
  const columns = footer.columns || []
  const legal = footer.legalLinks || []
  const year = new Date().getFullYear()
  const address = settings.contact?.address?.split('\n').filter(Boolean) || []

  return (
    <footer className="mt-auto bg-night text-ink" data-theme="dark">
      <div className="container py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <LocaleLink aria-label={settings.siteName || 'Indicate Data'} className="inline-flex w-fit" href="/">
              <Logo className="h-7" title={settings.siteName || 'Indicate Data'} />
            </LocaleLink>
            {settings.tagline && <p className="max-w-[30ch] type-lead text-ink-2 pretty">{settings.tagline}</p>}
            {footer.showContact && (settings.contact?.email || address.length > 0) && (
              <address className="not-italic type-small text-ink-3 leading-relaxed">
                {address.map((line, i) => (
                  <span className="block" key={i}>
                    {line}
                  </span>
                ))}
                {settings.contact?.email && (
                  <a className="mt-2 block text-ink-2 hover:text-ink" href={`mailto:${settings.contact.email}`}>
                    {settings.contact.email}
                  </a>
                )}
                {settings.contact?.phone && (
                  <a className="block text-ink-2 hover:text-ink" href={`tel:${settings.contact.phone.replace(/\s/g, '')}`}>
                    {settings.contact.phone}
                  </a>
                )}
              </address>
            )}
          </div>

          {columns.length > 0 && (
            <nav aria-label={dict.footerNavigation} className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:col-span-8">
              {columns.map((col, ci) => (
                <div className="flex flex-col gap-3" key={col.id || ci}>
                  <p className="type-small font-medium text-ink">{col.title}</p>
                  <ul className="flex flex-col gap-2">
                    {(col.links || []).map((entry, li) => (
                      <li key={entry.id || li}>
                        <CMSLink
                          {...entry.link}
                          appearance="inline"
                          className="type-small text-ink-2 transition-colors duration-150 hover:text-ink"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          )}
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
          <p className="type-caption text-ink-3">
            © {year} {footer.bottomText || settings.siteName || 'Indicate Data'}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {legal.length > 0 && (
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {legal.map((entry, i) => (
                  <li key={entry.id || i}>
                    <CMSLink
                      {...entry.link}
                      appearance="inline"
                      className="type-caption text-ink-3 transition-colors duration-150 hover:text-ink"
                    />
                  </li>
                ))}
              </ul>
            )}
            {(settings.social?.length || 0) > 0 && (
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {settings.social!.map((s, i) => (
                  <li key={s.id || i}>
                    <a
                      className="type-caption text-ink-3 transition-colors duration-150 hover:text-ink"
                      href={s.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {socialLabels[s.platform] || s.platform}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {footer.showLanguageSwitch && <LanguageSwitch label={dict.language} variant="select" />}
          </div>
        </div>
      </div>
    </footer>
  )
}
