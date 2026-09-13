import { SubneoError } from './errors'
import type { Plan, PlanList, Problem } from './types'

export const SUBNEO_API_URL = 'https://api.subneo.io/v1'

/** The dated release of the public API this SDK was written against. */
export const SUBNEO_API_VERSION = '2026-09-03'

export const SUBNEO_VERSION_HEADER = 'Subneo-Version'

export interface SubneoClientOptions {
  /** Environment-bound API key (`sneo_…`). Never expose it to a browser. */
  apiKey: string
  /** Defaults to the production API. Trailing slashes are ignored. */
  baseUrl?: string
  /** Pins the dated API release; defaults to `SUBNEO_API_VERSION`. */
  apiVersion?: string
  /** Injectable for tests and for frameworks that decorate `fetch` (Next.js). */
  fetch?: typeof fetch
  /** Aborts requests that take longer; default 10 s. */
  timeoutMs?: number
}

export interface ListPlansParams {
  /** Plan family code. Required by the API. */
  family: string
}

export interface RequestOptions {
  signal?: AbortSignal
  /** Passed through to `fetch`, e.g. Next.js `{ next: { revalidate } }`. */
  init?: Omit<RequestInit, 'method' | 'headers' | 'body' | 'signal'>
}

export interface SubneoClient {
  /** Published plans in force now, in the API's deterministic order (by plan code). */
  listPlans(params: ListPlansParams, options?: RequestOptions): Promise<Plan[]>
}

export const createSubneoClient = (options: SubneoClientOptions): SubneoClient => {
  if (!options.apiKey) throw new SubneoError('Subneo API key is missing', { status: 0, code: 'missing_api_key' })
  const baseUrl = (options.baseUrl || SUBNEO_API_URL).replace(/\/+$/, '')
  const apiVersion = options.apiVersion || SUBNEO_API_VERSION
  const doFetch = options.fetch || globalThis.fetch
  const timeoutMs = options.timeoutMs ?? 10_000

  const request = async <T>(path: string, query: Record<string, string>, opts: RequestOptions = {}): Promise<T> => {
    const url = new URL(`${baseUrl}${path}`)
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    opts.signal?.addEventListener('abort', () => controller.abort(), { once: true })

    let response: Response
    try {
      response = await doFetch(url, {
        ...opts.init,
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${options.apiKey}`,
          [SUBNEO_VERSION_HEADER]: apiVersion,
        },
        signal: controller.signal,
      })
    } catch (cause) {
      throw new SubneoError(`Subneo request failed: ${String(cause)}`, { status: 0, code: 'network_error', cause })
    } finally {
      clearTimeout(timer)
    }

    if (!response.ok) throw await toError(response)

    try {
      return (await response.json()) as T
    } catch (cause) {
      throw new SubneoError('Subneo returned a body that is not JSON', { status: response.status, code: 'invalid_response', cause })
    }
  }

  return {
    async listPlans({ family }, opts) {
      if (!family) throw new SubneoError('family is required', { status: 0, code: 'missing_family' })
      const body = await request<PlanList>('/plans', { family }, opts)
      return parsePlanList(body)
    },
  }
}

const toError = async (response: Response): Promise<SubneoError> => {
  let problem: Problem | undefined
  try {
    const body = (await response.json()) as Partial<Problem>
    if (body && typeof body === 'object' && typeof body.status === 'number') problem = body as Problem
  } catch {
    // Not a problem document; the status alone has to do.
  }
  const title = problem?.title || response.statusText || 'request failed'
  const detail = problem?.detail ? `: ${problem.detail}` : ''
  return new SubneoError(`Subneo ${response.status} ${title}${detail}`, {
    status: response.status,
    code: problem?.code,
    problem,
  })
}

/** Checks the outer shape so a wrong endpoint or proxy page fails loudly instead of rendering nothing. */
export const parsePlanList = (body: unknown): Plan[] => {
  const data = (body as Partial<PlanList> | null)?.data
  if (!Array.isArray(data)) {
    throw new SubneoError('Subneo plan list has no `data` array', { status: 0, code: 'invalid_response' })
  }
  for (const plan of data) {
    if (
      typeof plan?.code !== 'string' ||
      typeof plan?.name !== 'string' ||
      !Array.isArray(plan?.rates) ||
      !Array.isArray(plan?.entitlements)
    ) {
      throw new SubneoError('Subneo plan is missing code, name, rates or entitlements', { status: 0, code: 'invalid_response' })
    }
  }
  return data
}
