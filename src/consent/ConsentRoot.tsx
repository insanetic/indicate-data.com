'use client'

import React from 'react'

import type { ResolvedConsent } from '@subneo/payload-consent'
import { ConsentProvider, type ConsentButtonProps } from '@subneo/payload-consent/react'

import { Button } from '@/components/ui/button'

import { consentClassNames } from './classNames'
import { consentSetup } from './setup'

const ConsentButton: React.FC<ConsentButtonProps> = ({ variant, ...props }) => <Button variant={variant} {...props} />

type Props = { settings: ResolvedConsent; locale: string; disabled?: boolean; children: React.ReactNode }

/** Binds the package provider to this site's setup, Button and Tailwind classes. */
export const ConsentRoot: React.FC<Props> = ({ settings, locale, disabled, children }) => (
  <ConsentProvider
    classNames={consentClassNames}
    components={{ Button: ConsentButton }}
    disabled={disabled}
    locale={locale}
    logEndpoint={consentSetup.logging ? '/api/consent/log' : null}
    settings={settings}
    setup={consentSetup}
  >
    {children}
  </ConsentProvider>
)
