import { llmsTxtResponse } from '@/utilities/llmsTxt'

// Agents mostly work in English, so the unprefixed file is the English one; it links the others.
export const dynamic = 'force-dynamic'

export function GET(): Promise<Response> {
  return llmsTxtResponse('en')
}
