import { notFound } from 'next/navigation'

import { isLocale } from '@/i18n/config'
import { llmsTxtResponse } from '@/utilities/llmsTxt'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return llmsTxtResponse(locale)
}
