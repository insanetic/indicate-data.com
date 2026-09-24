import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Outfit } from 'next/font/google'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { resolveConsent, runtimeIntegrations } from '@subneo/payload-consent'
import { ConsentBanner, ConsentDefaults, ConsentRunner, ConsentSettings, FloatingTrigger } from '@subneo/payload-consent/react'
import { consentSetup } from '@/consent/setup'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { isLocale, localeTags, locales, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { RevealObserver } from '@/components/Reveal/Observer'
import { Providers } from '@/providers'
import { buildWithoutDatabase } from '@/utilities/buildWithoutDatabase'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'
import { siteStructuredData } from '@/utilities/structuredData'

import '../globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
})

export async function generateStaticParams() {
  if (buildWithoutDatabase) return []

  return locales.map((locale) => ({ locale }))
}

type Args = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function RootLayout({ children, params }: Args) {
  const { locale: localeParam } = await params
  if (!isLocale(localeParam)) notFound()
  const locale: Locale = localeParam

  const { isEnabled } = await draftMode()
  const dict = getDictionary(locale)

  const [consentSettings, siteSettings] = await Promise.all([
    getCachedGlobal('consent', 1, locale)(),
    getCachedGlobal('site-settings', 1, locale)(),
  ])
  const consent = resolveConsent(consentSettings, locale, consentSetup)
  // This site gates no embeds, so an inactive tracker (staging without a container id) leaves
  // nothing that would need a decision: no banner at all.
  const consentDisabled = isEnabled || runtimeIntegrations(consentSetup, consent).length === 0
  const trackingEnabled = consent.enabled && !consentDisabled

  return (
    <html
      className={cn(outfit.variable, GeistSans.variable, GeistMono.variable)}
      lang={localeTags[locale]}
      suppressHydrationWarning
    >
      <head>
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/favicon-32.png" rel="icon" sizes="32x32" type="image/png" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
        {/*
         * Before first paint: marks that scripts run (so `.reveal` may hide until in view) and
         * decides whether the hero entrance plays (once per session).
         */}
        <Script id="intro-gate" strategy="beforeInteractive">
          {`document.documentElement.setAttribute('data-js','');try{if(sessionStorage.getItem('indicate:intro'))document.documentElement.setAttribute('data-intro-seen','')}catch(e){}`}
        </Script>
        <ConsentDefaults enabled={trackingEnabled} settings={consent} setup={consentSetup} />
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteStructuredData(siteSettings, locale)).replace(/</g, '\\u003c'),
          }}
          type="application/ld+json"
        />
      </head>
      <body>
        <Providers consent={{ settings: consent, disabled: consentDisabled }} locale={locale}>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <a className="skip-link" href="#content">
            {dict.skipToContent}
          </a>
          <ConsentBanner />
          <Header locale={locale} />
          <main id="content" className="flex-1">
            {children}
          </main>
          <Footer locale={locale} />
          <ConsentSettings />
          <FloatingTrigger />
          <ConsentRunner />
          <RevealObserver />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
