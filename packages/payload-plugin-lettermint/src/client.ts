import type { LettermintSendBody } from './message'

/** What `POST /send` answers on success (202). */
export interface LettermintSendResponse {
  message_id: string | null
  status: string
}

export interface ClientOptions {
  token: string
  baseUrl: string
  timeoutMs: number
  /** Defaults to the global `fetch`; tests pass their own. */
  fetch?: typeof fetch
}

/** A send or check that Lettermint refused, or that never reached it (`status` 0). Never carries the token. */
export class LettermintError extends Error {
  readonly status: number
  readonly errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'LettermintError'
    this.status = status
    this.errors = errors
  }
}

const call = async (path: string, init: RequestInit, o: ClientOptions): Promise<Response> => {
  const doFetch = o.fetch ?? globalThis.fetch
  try {
    return await doFetch(`${o.baseUrl}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...(init.headers as Record<string, string>), 'x-lettermint-token': o.token },
      // Never forward the token header to wherever a redirect points.
      redirect: 'error',
      signal: AbortSignal.timeout(o.timeoutMs),
    })
  } catch (error) {
    const name = (error as { name?: unknown } | null)?.name
    const timedOut = name === 'TimeoutError' || name === 'AbortError'
    throw new LettermintError(timedOut ? `Lettermint did not answer within ${o.timeoutMs} ms` : 'Lettermint could not be reached', 0)
  }
}

const failure = async (res: Response): Promise<LettermintError> => {
  let message = `Lettermint answered ${res.status}`
  let errors: Record<string, string[]> | undefined
  try {
    const data = (await res.json()) as { message?: unknown; errors?: unknown }
    if (typeof data.message === 'string' && data.message) message = data.message
    if (data.errors && typeof data.errors === 'object') errors = data.errors as Record<string, string[]>
  } catch {
    // Not JSON (a proxy's error page): keep the status line.
  }
  return new LettermintError(message, res.status, errors)
}

export const sendMail = async (body: LettermintSendBody, o: ClientOptions): Promise<LettermintSendResponse> => {
  const res = await call('/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, o)
  if (!res.ok) throw await failure(res)
  try {
    return (await res.json()) as LettermintSendResponse
  } catch {
    // Accepted, but the body is not JSON: the mail is on its way, only the id is unknown.
    return { message_id: null, status: 'accepted' }
  }
}

/** True when Lettermint accepts the token, false when it refuses it; any other failure throws. */
export const pingToken = async (o: ClientOptions): Promise<boolean> => {
  const res = await call('/ping', { method: 'GET' }, o)
  if (res.ok) return true
  if (res.status === 401 || res.status === 403) return false
  throw await failure(res)
}
