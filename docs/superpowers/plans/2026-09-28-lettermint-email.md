# Email through Lettermint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Payload sends form notifications, visitor confirmations, password resets and a test mail through Lettermint, with the token read only from the environment.

**Architecture:** A new workspace package `@subneo/payload-lettermint` (`packages/payload-plugin-lettermint`) supplies a `fetch`-based Payload email adapter, an `email-settings` global (sender, team recipients, route, token status UI) and two endpoints (`/api/lettermint/status`, `/api/lettermint/test`). Site code in `src/email/` adds the form-builder rules (default recipient, language filter, confirmation cap, honeypot), the page language on submissions, and the password reset template.

**Tech Stack:** Payload 3.90.1, Next 16.3.5, React 19, `@payloadcms/plugin-form-builder`, Vitest 5 (`tests/int`), Postgres (Drizzle migrations), Lettermint Sending API v1.

**Spec:** `docs/superpowers/specs/2026-09-28-lettermint-email-design.md`

## Global Constraints

- The token comes only from `process.env.LETTERMINT_API_TOKEN` (name configurable in plugin options). It is never written to the database, never logged, never put into an error, and never returned by an API except as `…` plus its last 4 characters, and only when it is at least 12 characters long.
- Lettermint: base URL `https://api.lettermint.co/v1`, header `x-lettermint-token`, `POST /send` answers `202 { message_id, status }`, errors `{ message, errors }` (422 has per-field `errors`), `GET /ping` checks a token. Timeout 10 000 ms, no retries.
- Global slug `email-settings`; endpoints `GET /api/lettermint/status`, `POST /api/lettermint/test`; plugin options stored in `config.custom['@subneo/payload-lettermint']`.
- Site defaults: sender `noreply@indicate-data.io` / `Indicate Data`; team recipient `hello@indicate-data.io`; the global sits in the admin group `{ de: 'Website', en: 'Site' }`.
- Confirmation cap: 3 mails per visitor-supplied address per rolling hour, in memory. Honeypot field name `_hp`.
- No new npm dependencies. Package code never imports site code (`@/…`).
- Admin labels are de/en via `l(de, en)` (package) or `{ de, en }` objects (site); German first.
- Tests are Vitest int specs in `tests/int/*.int.spec.ts(x)`. Server-side specs start with `// @vitest-environment node`. Run one file with `pnpm exec vitest run --config ./vitest.config.mts <file>`.
- Work happens in a git worktree on branch `feat/lettermint-email`. Another session has uncommitted testimonials work in the main checkout: never switch branches there, never commit from there.
- Every command that loads the Payload config (`pnpm dev`, `payload …`, `generate:*`, `make migration`) runs with `DATABASE_URL=postgres://payload:payload@localhost:5433/lettermint_dev` (the scratch DB), never the shared `payload` DB.
- `.env` files cannot be read by the agent. Anything that needs `.env` content is a request to the user.
- Commit messages follow the repo style `Area: what changed` (e.g. `Lettermint: message mapping`), no attribution lines.

## Review Focus

1. A visitor types their address with different case or stray spaces on each submission (`Visitor@Example.org `): the cap must count them as one address. Pinned in Task 7 (`cap counts spellings of one address together`).
2. A submission arrives without `locale` (an old cached page, or a script posting the REST API directly): treat it as German, send `all` and `de` entries, never both confirmations. Pinned in Task 7 (`treats a submission without locale as German`).
3. The sender name contains a comma or quotes (`Indicate Data, Team`): it must stay one quoted address and not split into two recipients. Pinned in Task 1 (`formats objects and quotes display names`, `splits on separating commas only`).
4. Lettermint or a proxy in front of it answers with a non-JSON error page (502 HTML): the send fails with a `LettermintError` carrying the status, not a JSON parse crash. Pinned in Task 2 (`survives an error page that is not JSON`).
5. The global has never been saved (fresh database) or cannot be read: mail still goes out with the plugin defaults and the failure is logged. Pinned in Task 3 (`falls back to the plugin defaults when the global is empty or unreadable`).

---

## Before Task 1: workspace

- [ ] **Step 1: Create the worktree** with superpowers:using-git-worktrees: branch `feat/lettermint-email` from `main`, path `../indicate-data.com.demo-lettermint`. All later paths are relative to the worktree root.

- [ ] **Step 2: Install dependencies in the worktree**

Run: `pnpm install --frozen-lockfile`
Expected: completes without changing `pnpm-lock.yaml`.

- [ ] **Step 3: Start Postgres from the main checkout** (the compose project name comes from the main checkout's directory, so the volume is the shared one)

Run: `docker compose -f /Users/stan/Workspace/GitHub/indicateio/indicate-data.com.demo/docker-compose.yml up -d postgres`
Expected: `indicate-datacomdemo-postgres-1` is running (`docker ps`).

- [ ] **Step 4: Create the scratch DB as a copy of the dev DB**

```bash
docker exec indicate-datacomdemo-postgres-1 createdb -U payload lettermint_dev
docker exec indicate-datacomdemo-postgres-1 sh -c 'pg_dump -U payload -Fc payload | pg_restore -U payload -d lettermint_dev --no-owner'
```
Expected: no errors (warnings about existing `public` schema are fine).

- [ ] **Step 5: Ask the user to copy `.env` into the worktree** (the agent cannot read or copy it):
`! cp /Users/stan/Workspace/GitHub/indicateio/indicate-data.com.demo/.env ../indicate-data.com.demo-lettermint/.env`

---

### Task 1: Package scaffold and message mapping

**Files:**
- Create: `packages/payload-plugin-lettermint/package.json`
- Create: `packages/payload-plugin-lettermint/tsconfig.json`
- Create: `packages/payload-plugin-lettermint/LICENSE` (copy of `packages/payload-plugin-testimonials/LICENSE`)
- Create: `packages/payload-plugin-lettermint/src/labels.ts`
- Create: `packages/payload-plugin-lettermint/src/message.ts`
- Create: `packages/payload-plugin-lettermint/src/index.ts`
- Modify: `tsconfig.json` (paths)
- Test: `tests/int/lettermint-message.int.spec.ts`

**Interfaces:**
- Produces: `splitAddressList(value: string): string[]`, `formatAddress(a: { name?: string; address: string }): string`, `bareAddress(value: string): string`, `toAddressList(value: unknown): string[]`, `toLettermintBody(message: SendEmailOptions): { body: MappedBody; dropped: string[] }`, types `LettermintSendBody`, `MappedBody`; `l(de, en)`.

- [ ] **Step 1: Scaffold the package**

`packages/payload-plugin-lettermint/package.json`:

```json
{
  "name": "@subneo/payload-lettermint",
  "version": "0.1.0",
  "description": "Send Payload CMS email through Lettermint. The token comes from the environment only; sender, team recipients and route are edited in the admin, next to a token status and a test mail.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./admin": "./src/admin.ts"
  },
  "files": ["src", "README.md", "LICENSE"],
  "scripts": { "build": "tsc -p tsconfig.json" },
  "peerDependencies": {
    "@payloadcms/ui": "^3.0.0",
    "payload": "^3.0.0",
    "react": "^19.0.0"
  },
  "devDependencies": { "typescript": "^5.7.0" },
  "publishConfig": {
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
      "./admin": { "types": "./dist/admin.d.ts", "import": "./dist/admin.js" }
    }
  }
}
```

`packages/payload-plugin-lettermint/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": ["src"]
}
```

Run: `cp packages/payload-plugin-testimonials/LICENSE packages/payload-plugin-lettermint/LICENSE`

`packages/payload-plugin-lettermint/src/labels.ts`:

```ts
/** Admin labels in German and English; Payload falls back to the config's fallback language. */
export const l = (de: string, en: string): Record<string, string> => ({ de, en })
```

In the root `tsconfig.json` `compilerOptions.paths`, after the `@subneo/payload-testimonials/admin` entry, add:

```json
      "@subneo/payload-lettermint": [
        "./packages/payload-plugin-lettermint/src/index.ts"
      ],
      "@subneo/payload-lettermint/admin": [
        "./packages/payload-plugin-lettermint/src/admin.ts"
      ]
```

- [ ] **Step 2: Write the failing test** `tests/int/lettermint-message.int.spec.ts`

```ts
// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { bareAddress, formatAddress, splitAddressList, toAddressList, toLettermintBody } from '@subneo/payload-lettermint'

describe('addresses', () => {
  it('splits on separating commas only', () => {
    expect(splitAddressList('a@x.io, "Doe, Jane" <j@y.io>,b@z.io')).toEqual(['a@x.io', '"Doe, Jane" <j@y.io>', 'b@z.io'])
    expect(splitAddressList(' , ')).toEqual([])
    expect(splitAddressList('"Say \\"hi, there\\"" <a@x.io>, b@x.io')).toEqual(['"Say \\"hi, there\\"" <a@x.io>', 'b@x.io'])
  })

  it('formats objects and quotes display names', () => {
    expect(formatAddress({ name: 'Indicate Data, Team', address: 'hi@x.io' })).toBe('"Indicate Data, Team" <hi@x.io>')
    expect(formatAddress({ name: 'Say "hi"', address: 'hi@x.io' })).toBe('"Say \\"hi\\"" <hi@x.io>')
    expect(formatAddress({ address: ' hi@x.io ' })).toBe('hi@x.io')
    expect(splitAddressList(formatAddress({ name: 'Indicate Data, Team', address: 'hi@x.io' }))).toHaveLength(1)
  })

  it('accepts every shape Payload may hand over', () => {
    expect(toAddressList(undefined)).toEqual([])
    expect(toAddressList('')).toEqual([])
    expect(toAddressList(['a@x.io', { name: 'B', address: 'b@x.io' }])).toEqual(['a@x.io', '"B" <b@x.io>'])
    expect(toAddressList('a@x.io, b@x.io')).toEqual(['a@x.io', 'b@x.io'])
  })

  it('reads the bare address', () => {
    expect(bareAddress('"Doe, Jane" <J@Y.io>')).toBe('J@Y.io')
    expect(bareAddress(' a@x.io ')).toBe('a@x.io')
  })
})

describe('toLettermintBody', () => {
  it('maps a form-builder message', () => {
    const { body, dropped } = toLettermintBody({
      from: '"Indicate Data" <noreply@x.io>',
      to: 'team@x.io, other@x.io',
      cc: '',
      bcc: '',
      replyTo: 'visitor@y.io',
      subject: 'Neue Anfrage',
      html: '<div>Hallo</div>',
    })
    expect(body).toEqual({
      from: '"Indicate Data" <noreply@x.io>',
      to: ['team@x.io', 'other@x.io'],
      reply_to: ['visitor@y.io'],
      subject: 'Neue Anfrage',
      html: '<div>Hallo</div>',
    })
    expect(dropped).toEqual([])
  })

  it('leaves from out when the message has none', () => {
    expect(toLettermintBody({ to: 'a@x.io', subject: 's', html: '<p>x</p>' }).body.from).toBeUndefined()
  })

  it('omits bodies Lettermint would reject and reads buffers', () => {
    const { body } = toLettermintBody({ to: 'a@x.io', subject: 's', html: 'ab', text: Buffer.from('plain text') })
    expect(body.html).toBeUndefined()
    expect(body.text).toBe('plain text')
  })

  it('reports options it cannot send', () => {
    const { body, dropped } = toLettermintBody({
      to: 'a@x.io',
      subject: 's',
      html: '<p>x</p>',
      attachments: [{ filename: 'a.txt', content: 'x' }],
      priority: 'high',
    })
    expect(dropped).toEqual(['attachments', 'priority'])
    expect(body).not.toHaveProperty('attachments')
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/lettermint-message.int.spec.ts`
Expected: FAIL, cannot resolve `@subneo/payload-lettermint` (no `src/index.ts` yet).

- [ ] **Step 4: Implement** `packages/payload-plugin-lettermint/src/message.ts`

```ts
import type { SendEmailOptions } from 'payload'

/** Request body of Lettermint's `POST /send`. */
export interface LettermintSendBody {
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  reply_to?: string[]
  subject: string
  html?: string
  text?: string
  route?: string
}

/** A mapped message; `from` stays open until the adapter has picked the sender. */
export type MappedBody = Omit<LettermintSendBody, 'from'> & { from?: string }

type AddressObject = { name?: string; address: string }

/** Lettermint rejects html or text bodies shorter than this. */
const MIN_BODY_LENGTH = 3

const MAPPED_KEYS = new Set(['from', 'to', 'cc', 'bcc', 'replyTo', 'subject', 'html', 'text'])

/** Splits an address list on the commas between addresses, not the ones inside a quoted name. */
export const splitAddressList = (value: string): string[] => {
  const parts: string[] = []
  let current = ''
  let quoted = false
  let angled = false
  let escaped = false
  for (const ch of value) {
    // A backslash inside a quoted name escapes the next character (`"Say \"hi\""`).
    if (escaped) {
      current += ch
      escaped = false
      continue
    }
    if (quoted && ch === '\\') {
      current += ch
      escaped = true
      continue
    }
    if (ch === '"') quoted = !quoted
    else if (!quoted && ch === '<') angled = true
    else if (!quoted && ch === '>') angled = false
    if (ch === ',' && !quoted && !angled) {
      parts.push(current)
      current = ''
    } else current += ch
  }
  parts.push(current)
  return parts.map((p) => p.trim()).filter(Boolean)
}

/** `"Name" <address>`, or the bare address when there is no name. */
export const formatAddress = ({ name, address }: AddressObject): string => {
  const bare = address.trim()
  const display = name?.trim()
  return display ? `"${display.replace(/(["\\])/g, '\\$1')}" <${bare}>` : bare
}

/** The address inside `"Name" <address>`, or the trimmed input. */
export const bareAddress = (value: string): string => (value.match(/<([^<>]+)>\s*$/)?.[1] ?? value).trim()

const isAddressObject = (value: unknown): value is AddressObject =>
  typeof value === 'object' && value !== null && typeof (value as AddressObject).address === 'string'

/** Every address shape nodemailer allows, as a flat list of strings. */
export const toAddressList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(toAddressList)
  if (typeof value === 'string') return splitAddressList(value)
  if (isAddressObject(value)) {
    const formatted = formatAddress(value)
    return formatted ? [formatted] : []
  }
  return []
}

const asText = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value
  if (value instanceof Uint8Array) return Buffer.from(value).toString('utf8')
  return undefined
}

/**
 * Maps the nodemailer-shaped message Payload hands an adapter onto Lettermint's request body.
 * `dropped` names what Lettermint cannot express here (attachments, streams, nodemailer extras).
 */
export const toLettermintBody = (message: SendEmailOptions): { body: MappedBody; dropped: string[] } => {
  const record = message as Record<string, unknown>
  const dropped = Object.keys(record).filter((key) => !MAPPED_KEYS.has(key) && record[key] !== undefined)
  const body: MappedBody = {
    to: toAddressList(message.to),
    subject: typeof message.subject === 'string' ? message.subject : '',
  }
  const from = toAddressList(message.from)[0]
  if (from) body.from = from
  for (const [key, target] of [['cc', 'cc'], ['bcc', 'bcc'], ['replyTo', 'reply_to']] as const) {
    const list = toAddressList(record[key])
    if (list.length) body[target] = list
  }
  for (const key of ['html', 'text'] as const) {
    if (record[key] == null) continue
    const text = asText(record[key])
    if (text === undefined) dropped.push(key)
    else if (text.length >= MIN_BODY_LENGTH) body[key] = text
  }
  return { body, dropped }
}
```

`packages/payload-plugin-lettermint/src/index.ts`:

```ts
export { l } from './labels'
export {
  bareAddress,
  formatAddress,
  splitAddressList,
  toAddressList,
  toLettermintBody,
  type LettermintSendBody,
  type MappedBody,
} from './message'
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/lettermint-message.int.spec.ts`
Expected: PASS (8 tests).

- [ ] **Step 6: Commit**

```bash
git add packages/payload-plugin-lettermint tsconfig.json tests/int/lettermint-message.int.spec.ts
git commit -m "Lettermint: package scaffold and message mapping"
```

---

### Task 2: Lettermint client and token helpers

**Files:**
- Create: `packages/payload-plugin-lettermint/src/client.ts`
- Create: `packages/payload-plugin-lettermint/src/token.ts`
- Modify: `packages/payload-plugin-lettermint/src/index.ts`
- Test: `tests/int/lettermint-client.int.spec.ts`

**Interfaces:**
- Consumes: `LettermintSendBody` (Task 1).
- Produces: `class LettermintError extends Error { status: number; errors?: Record<string, string[]> }`, `interface ClientOptions { token: string; baseUrl: string; timeoutMs: number; fetch?: typeof fetch }`, `sendMail(body: LettermintSendBody, o: ClientOptions): Promise<LettermintSendResponse>`, `pingToken(o: ClientOptions): Promise<boolean>`, `interface LettermintSendResponse { message_id: string | null; status: string }`, `readToken(envName: string): string | undefined`, `tokenHint(token: string | undefined): string | null`.

- [ ] **Step 1: Write the failing test** `tests/int/lettermint-client.int.spec.ts`

```ts
// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LettermintError, pingToken, readToken, sendMail, tokenHint } from '@subneo/payload-lettermint'

const TOKEN = 'lm_test_0123456789abcd'
const body = { from: 'a@x.io', to: ['b@x.io'], subject: 's', html: '<p>x</p>' }
const opts = (fetch: unknown) => ({ token: TOKEN, baseUrl: 'https://api.test/v1', timeoutMs: 50, fetch: fetch as typeof globalThis.fetch })
const json = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })

describe('sendMail', () => {
  it('posts the body with the token header', async () => {
    const fetch = vi.fn(async () => json(202, { message_id: 'm1', status: 'pending' }))
    expect(await sendMail(body, opts(fetch))).toEqual({ message_id: 'm1', status: 'pending' })
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.test/v1/send')
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>)['x-lettermint-token']).toBe(TOKEN)
    expect(JSON.parse(String(init.body))).toEqual(body)
  })

  it('keeps the per-field messages of a 422', async () => {
    const fetch = vi.fn(async () => json(422, { message: 'The from field is invalid.', errors: { from: ['Domain not verified'] } }))
    const err = await sendMail(body, opts(fetch)).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(LettermintError)
    expect(err).toMatchObject({ status: 422, message: 'The from field is invalid.', errors: { from: ['Domain not verified'] } })
  })

  it('survives an error page that is not JSON', async () => {
    const fetch = vi.fn(async () => new Response('<html>Bad gateway</html>', { status: 502 }))
    await expect(sendMail(body, opts(fetch))).rejects.toMatchObject({ status: 502, message: 'Lettermint answered 502' })
  })

  it('gives up after the timeout', async () => {
    const fetch = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => init.signal!.addEventListener('abort', () => reject(init.signal!.reason))),
    )
    await expect(sendMail(body, opts(fetch))).rejects.toMatchObject({ status: 0, message: 'Lettermint did not answer within 50 ms' })
  })

  it('never puts the token into an error', async () => {
    const failures = [
      vi.fn(async () => json(401, { message: 'Unauthenticated.' })),
      vi.fn(async () => {
        throw new TypeError('fetch failed')
      }),
    ]
    for (const fetch of failures) {
      const err = (await sendMail(body, opts(fetch)).catch((e: unknown) => e)) as LettermintError
      expect(JSON.stringify({ ...err, message: err.message, stack: err.stack })).not.toContain(TOKEN)
    }
  })
})

describe('pingToken', () => {
  it('says whether Lettermint accepts the token', async () => {
    expect(await pingToken(opts(vi.fn(async () => json(200, 200))))).toBe(true)
    expect(await pingToken(opts(vi.fn(async () => json(401, { message: 'Unauthenticated.' }))))).toBe(false)
    await expect(pingToken(opts(vi.fn(async () => json(500, {}))))).rejects.toMatchObject({ status: 500 })
  })
})

describe('token helpers', () => {
  afterEach(() => {
    delete process.env.LM_CLIENT_TEST
  })

  it('reads and trims the env value', () => {
    process.env.LM_CLIENT_TEST = '  lm_abc\n'
    expect(readToken('LM_CLIENT_TEST')).toBe('lm_abc')
    process.env.LM_CLIENT_TEST = '   '
    expect(readToken('LM_CLIENT_TEST')).toBeUndefined()
    delete process.env.LM_CLIENT_TEST
    expect(readToken('LM_CLIENT_TEST')).toBeUndefined()
  })

  it('shows at most the last four characters', () => {
    expect(tokenHint('lm_0123456789abcd')).toBe('…abcd')
    expect(tokenHint('lm_short')).toBeNull()
    expect(tokenHint(undefined)).toBeNull()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/lettermint-client.int.spec.ts`
Expected: FAIL, `sendMail` / `LettermintError` are not exported.

- [ ] **Step 3: Implement** `packages/payload-plugin-lettermint/src/client.ts`

```ts
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
  return (await res.json()) as LettermintSendResponse
}

/** True when Lettermint accepts the token, false when it refuses it; any other failure throws. */
export const pingToken = async (o: ClientOptions): Promise<boolean> => {
  const res = await call('/ping', { method: 'GET' }, o)
  if (res.ok) return true
  if (res.status === 401 || res.status === 403) return false
  throw await failure(res)
}
```

`packages/payload-plugin-lettermint/src/token.ts`:

```ts
/** The token from the environment, trimmed; `undefined` when unset or blank. Read per call, never cached. */
export const readToken = (envName: string): string | undefined => {
  const value = process.env[envName]?.trim()
  return value ? value : undefined
}

/** `…` plus the last four characters for tokens of 12+ characters; shorter ones get no hint at all. */
export const tokenHint = (token: string | undefined): string | null =>
  token && token.length >= 12 ? `…${token.slice(-4)}` : null
```

Append to `packages/payload-plugin-lettermint/src/index.ts`:

```ts
export { LettermintError, pingToken, sendMail, type ClientOptions, type LettermintSendResponse } from './client'
export { readToken, tokenHint } from './token'
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/lettermint-client.int.spec.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/payload-plugin-lettermint/src tests/int/lettermint-client.int.spec.ts
git commit -m "Lettermint: send and ping client, token helpers"
```

---

### Task 3: Options, settings reader and the email adapter

**Files:**
- Create: `packages/payload-plugin-lettermint/src/types.ts`
- Create: `packages/payload-plugin-lettermint/src/settings.ts`
- Create: `packages/payload-plugin-lettermint/src/adapter.ts`
- Modify: `packages/payload-plugin-lettermint/src/index.ts`
- Test: `tests/int/lettermint-adapter.int.spec.ts`

**Interfaces:**
- Consumes: `toLettermintBody`, `formatAddress`, `splitAddressList` (Task 1); `sendMail`, `LettermintSendResponse`, `readToken` (Task 2).
- Produces: `PLUGIN_KEY = '@subneo/payload-lettermint'`, `interface LettermintPluginOptions`, `interface ResolvedLettermintOptions { defaultFrom: { address: string; name: string }; defaultNotifyTo: string; env: { apiToken: string }; globalSlug: string; adminGroup: string | Record<string, string>; baseUrl: string; timeoutMs: number }`, `resolveOptions(o: LettermintPluginOptions): ResolvedLettermintOptions`, `interface EmailSettings { fromAddress: string; fromName: string; notifyTo: string[]; route?: string }`, `readEmailSettings(payload: Payload, o: ResolvedLettermintOptions): Promise<EmailSettings>`, `getEmailSettings(payload: Payload): Promise<EmailSettings>`, `createLettermintAdapter(o: ResolvedLettermintOptions, deps?: { fetch?: typeof fetch }): PayloadEmailAdapter<LettermintResult>`, `type LettermintResult = LettermintSendResponse | { logged: true }`.

- [ ] **Step 1: Write the failing test** `tests/int/lettermint-adapter.int.spec.ts`

```ts
// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createLettermintAdapter, getEmailSettings, LettermintError, PLUGIN_KEY, resolveOptions } from '@subneo/payload-lettermint'

const options = resolveOptions({
  defaultFrom: { address: 'noreply@indicate-data.io', name: 'Indicate Data' },
  defaultNotifyTo: 'hello@indicate-data.io',
  env: { apiToken: 'LM_ADAPTER_TEST' },
})

const fakePayload = (global: Record<string, unknown> | Error = {}) => {
  const findGlobal = vi.fn(async () => {
    if (global instanceof Error) throw global
    return global
  })
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
  return { payload: { findGlobal, logger, config: { custom: { [PLUGIN_KEY]: options } } } as never, findGlobal, logger }
}

const accepted = () => vi.fn(async (_url: string, _init: RequestInit) => new Response(JSON.stringify({ message_id: 'm1', status: 'pending' }), { status: 202 }))
const sentBody = (fetch: ReturnType<typeof accepted>, call = 0) => JSON.parse(String(fetch.mock.calls[call][1].body))

afterEach(() => {
  delete process.env.LM_ADAPTER_TEST
})

describe('createLettermintAdapter', () => {
  it('exposes the static defaults Payload reads at init', () => {
    const adapter = createLettermintAdapter(options)(fakePayload())
    expect(adapter).toMatchObject({ name: 'lettermint', defaultFromAddress: 'noreply@indicate-data.io', defaultFromName: 'Indicate Data' })
  })

  it('logs instead of sending when no token is set, and warns once', async () => {
    const fetch = accepted()
    const { payload, logger } = fakePayload()
    const adapter = createLettermintAdapter(options, { fetch: fetch as never })({ payload })
    expect(await adapter.sendEmail({ to: 'a@x.io', subject: 'Hi', html: '<p>x</p>' })).toEqual({ logged: true })
    await adapter.sendEmail({ to: 'b@x.io', subject: 'Hi again', html: '<p>x</p>' })
    expect(fetch).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledTimes(1)
    expect(logger.warn.mock.calls[0][0]).toContain('LM_ADAPTER_TEST is not set')
    expect(logger.info).toHaveBeenCalledTimes(2)
  })

  it('uses the saved sender for messages without from and for Payload\'s default from', async () => {
    process.env.LM_ADAPTER_TEST = 'lm_adapter_0123456789'
    const fetch = accepted()
    const { payload } = fakePayload({ fromAddress: 'team@indicate-data.io', fromName: 'Indicate Team', route: 'transactional' })
    const adapter = createLettermintAdapter(options, { fetch: fetch as never })({ payload })

    await adapter.sendEmail({ to: 'a@x.io', subject: 's', html: '<p>x</p>' })
    expect(sentBody(fetch, 0)).toMatchObject({ from: '"Indicate Team" <team@indicate-data.io>', route: 'transactional' })

    await adapter.sendEmail({ from: '"Indicate Data" <noreply@indicate-data.io>', to: 'a@x.io', subject: 's', html: '<p>x</p>' })
    expect(sentBody(fetch, 1).from).toBe('"Indicate Team" <team@indicate-data.io>')

    await adapter.sendEmail({ from: 'forms@indicate-data.io', to: 'a@x.io', subject: 's', html: '<p>x</p>' })
    expect(sentBody(fetch, 2).from).toBe('forms@indicate-data.io')

    expect((fetch.mock.calls[0][1].headers as Record<string, string>)['x-lettermint-token']).toBe('lm_adapter_0123456789')
  })

  it('falls back to the plugin defaults when the global is empty or unreadable', async () => {
    process.env.LM_ADAPTER_TEST = 'lm_adapter_0123456789'
    for (const global of [{}, new Error('relation "email_settings" does not exist')]) {
      const fetch = accepted()
      const { payload, logger } = fakePayload(global)
      await createLettermintAdapter(options, { fetch: fetch as never })({ payload }).sendEmail({ to: 'a@x.io', subject: 's', html: '<p>x</p>' })
      expect(sentBody(fetch)).toMatchObject({ from: '"Indicate Data" <noreply@indicate-data.io>' })
      expect(sentBody(fetch)).not.toHaveProperty('route')
      expect(logger.error).toHaveBeenCalledTimes(global instanceof Error ? 1 : 0)
    }
  })

  it('passes Lettermint errors through', async () => {
    process.env.LM_ADAPTER_TEST = 'lm_adapter_0123456789'
    const fetch = vi.fn(async () => new Response(JSON.stringify({ message: 'The from field is invalid.', errors: {} }), { status: 422 }))
    const adapter = createLettermintAdapter(options, { fetch: fetch as never })(fakePayload())
    await expect(adapter.sendEmail({ to: 'a@x.io', subject: 's', html: '<p>x</p>' })).rejects.toBeInstanceOf(LettermintError)
  })

  it('reports options it drops', async () => {
    const { payload, logger } = fakePayload()
    await createLettermintAdapter(options)({ payload }).sendEmail({ to: 'a@x.io', subject: 's', html: '<p>x</p>', attachments: [] })
    expect(logger.warn.mock.calls.some(([m]) => String(m).includes('ignoring attachments'))).toBe(true)
  })
})

describe('getEmailSettings', () => {
  it('splits the team recipients and falls back to the default', async () => {
    expect((await getEmailSettings(fakePayload({ notifyTo: 'a@x.io, "B" <b@x.io>' }).payload)).notifyTo).toEqual(['a@x.io', '"B" <b@x.io>'])
    expect((await getEmailSettings(fakePayload({ notifyTo: '' }).payload)).notifyTo).toEqual(['hello@indicate-data.io'])
  })

  it('says so when the plugin is missing', async () => {
    await expect(getEmailSettings({ config: { custom: {} } } as never)).rejects.toThrow(/lettermintPlugin/)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/lettermint-adapter.int.spec.ts`
Expected: FAIL, `createLettermintAdapter` / `resolveOptions` are not exported.

- [ ] **Step 3: Implement** `packages/payload-plugin-lettermint/src/types.ts`

```ts
import { l } from './labels'

/** Key of the resolved options in `config.custom`. */
export const PLUGIN_KEY = '@subneo/payload-lettermint'
export const DEFAULT_GLOBAL_SLUG = 'email-settings'
export const DEFAULT_BASE_URL = 'https://api.lettermint.co/v1'
export const DEFAULT_TIMEOUT_MS = 10_000
export const DEFAULT_TOKEN_ENV = 'LETTERMINT_API_TOKEN'

export interface LettermintPluginOptions {
  /** Set to `false` to leave the config untouched. */
  enabled?: boolean
  /** Sender Payload uses as its default (password resets); the global starts with it. */
  defaultFrom: { address: string; name: string }
  /** Comma-separated team address(es) the global starts with; default `defaultFrom.address`. */
  defaultNotifyTo?: string
  /** Environment variable holding the Lettermint project token; default `LETTERMINT_API_TOKEN`. */
  env?: { apiToken?: string }
  /** Slug of the settings global; default `email-settings`. */
  globalSlug?: string
  /** Admin sidebar group of the global; default "Einstellungen" / "Settings". */
  adminGroup?: string | Record<string, string>
  /** Default `https://api.lettermint.co/v1`. */
  baseUrl?: string
  /** Request timeout; default 10 000 ms. */
  timeoutMs?: number
}

export interface ResolvedLettermintOptions {
  defaultFrom: { address: string; name: string }
  defaultNotifyTo: string
  env: { apiToken: string }
  globalSlug: string
  adminGroup: string | Record<string, string>
  baseUrl: string
  timeoutMs: number
}

/** The global as the adapter and site code use it, with plugin defaults filled in. */
export interface EmailSettings {
  fromAddress: string
  fromName: string
  notifyTo: string[]
  route?: string
}

export const resolveOptions = (options: LettermintPluginOptions): ResolvedLettermintOptions => ({
  defaultFrom: { address: options.defaultFrom.address.trim(), name: options.defaultFrom.name.trim() },
  defaultNotifyTo: options.defaultNotifyTo?.trim() || options.defaultFrom.address.trim(),
  env: { apiToken: options.env?.apiToken || DEFAULT_TOKEN_ENV },
  globalSlug: options.globalSlug || DEFAULT_GLOBAL_SLUG,
  adminGroup: options.adminGroup || l('Einstellungen', 'Settings'),
  baseUrl: (options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, ''),
  timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
})
```

`packages/payload-plugin-lettermint/src/settings.ts`:

```ts
import type { Payload } from 'payload'

import { splitAddressList } from './message'
import { PLUGIN_KEY, type EmailSettings, type ResolvedLettermintOptions } from './types'

const filled = (value: unknown): string | undefined => (typeof value === 'string' && value.trim() ? value.trim() : undefined)

/** The resolved plugin options stored in the config; throws when the plugin is not installed. */
export const optionsOf = (payload: Payload): ResolvedLettermintOptions => {
  const options = payload.config.custom?.[PLUGIN_KEY] as ResolvedLettermintOptions | undefined
  if (!options) throw new Error('[lettermint] lettermintPlugin is not in the Payload config')
  return options
}

/** Reads the global (bypassing access) and fills gaps with the plugin defaults. Never throws for a missing global. */
export const readEmailSettings = async (payload: Payload, o: ResolvedLettermintOptions): Promise<EmailSettings> => {
  let doc: Record<string, unknown> = {}
  try {
    doc = (await payload.findGlobal({ slug: o.globalSlug as never, depth: 0, overrideAccess: true })) as Record<string, unknown>
  } catch (err) {
    payload.logger.error({ err, msg: '[lettermint] could not read the email settings, using the defaults' })
  }
  const notifyTo = splitAddressList(filled(doc.notifyTo) ?? '')
  return {
    fromAddress: filled(doc.fromAddress) ?? o.defaultFrom.address,
    fromName: filled(doc.fromName) ?? o.defaultFrom.name,
    notifyTo: notifyTo.length ? notifyTo : splitAddressList(o.defaultNotifyTo),
    route: filled(doc.route),
  }
}

/** Email settings for site code (form hooks): sender, team recipients, route. */
export const getEmailSettings = async (payload: Payload): Promise<EmailSettings> => readEmailSettings(payload, optionsOf(payload))
```

`packages/payload-plugin-lettermint/src/adapter.ts`:

```ts
import type { Payload, PayloadEmailAdapter, SendEmailOptions } from 'payload'

import { sendMail, type LettermintSendResponse } from './client'
import { formatAddress, toLettermintBody } from './message'
import { readEmailSettings } from './settings'
import { readToken } from './token'
import type { ResolvedLettermintOptions } from './types'

/** What `sendEmail` resolves to: Lettermint's answer, or `logged` when no token is set. */
export type LettermintResult = LettermintSendResponse | { logged: true }

/**
 * Payload email adapter. Token and settings are read per send, so nothing fails at startup and a
 * restarted container picks up a new token.
 */
export const createLettermintAdapter =
  (o: ResolvedLettermintOptions, deps: { fetch?: typeof fetch } = {}): PayloadEmailAdapter<LettermintResult> =>
  ({ payload }) => {
    // Payload's own mails (forgot password) carry its static default sender; those get the saved one.
    const payloadDefaults = new Set([formatAddress(o.defaultFrom), o.defaultFrom.address])
    let warnedNoToken = false

    return {
      name: 'lettermint',
      defaultFromAddress: o.defaultFrom.address,
      defaultFromName: o.defaultFrom.name,
      sendEmail: async (message: SendEmailOptions): Promise<LettermintResult> => {
        const { body, dropped } = toLettermintBody(message)
        if (dropped.length) payload.logger.warn(`[lettermint] ignoring ${dropped.join(', ')}`)

        const token = readToken(o.env.apiToken)
        if (!token) {
          if (!warnedNoToken) {
            warnedNoToken = true
            payload.logger.warn(`[lettermint] ${o.env.apiToken} is not set: email is logged, not sent`)
          }
          payload.logger.info(`[lettermint] not sent: to ${body.to.join(', ')}, subject "${body.subject}"`)
          return { logged: true }
        }

        const settings = await readEmailSettings(payload as Payload, o)
        const from =
          body.from && !payloadDefaults.has(body.from) ? body.from : formatAddress({ name: settings.fromName, address: settings.fromAddress })
        return sendMail(
          { ...body, from, ...(settings.route ? { route: settings.route } : {}) },
          { token, baseUrl: o.baseUrl, timeoutMs: o.timeoutMs, fetch: deps.fetch },
        )
      },
    }
  }
```

Append to `packages/payload-plugin-lettermint/src/index.ts`:

```ts
export { createLettermintAdapter, type LettermintResult } from './adapter'
export { getEmailSettings, optionsOf, readEmailSettings } from './settings'
export * from './types'
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/lettermint-adapter.int.spec.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/payload-plugin-lettermint/src tests/int/lettermint-adapter.int.spec.ts
git commit -m "Lettermint: email adapter with per-send token and saved sender"
```

---

### Task 4: Settings global, endpoints and the plugin

**Files:**
- Create: `packages/payload-plugin-lettermint/src/global.ts`
- Create: `packages/payload-plugin-lettermint/src/endpoints.ts`
- Create: `packages/payload-plugin-lettermint/src/plugin.ts`
- Modify: `packages/payload-plugin-lettermint/src/index.ts`
- Test: `tests/int/lettermint-plugin.int.spec.ts`

**Interfaces:**
- Consumes: everything from Tasks 1–3.
- Produces: `lettermintPlugin(options: LettermintPluginOptions): Plugin`, `createEmailSettingsGlobal(o): GlobalConfig`, `validateAddressList(value: unknown, options?): true | string`, `ENDPOINT_BASE = '/lettermint'`, `createStatusEndpoint(o, deps?): Endpoint`, `createTestEndpoint(o): Endpoint`, `STATUS_FIELD_PATH = '@subneo/payload-lettermint/admin#EmailStatusField'`. Status JSON: `{ token: { configured: boolean; envName: string; hint: string | null; valid?: boolean; checkError?: string }, sender: { address: string; name: string }, notifyTo: string[], route: string | null }`. Test JSON: `{ ok: true, to: string, messageId: string | null }` or `{ ok: false, status: number, message: string, errors: Record<string, string[]> | null }`.

- [ ] **Step 1: Write the failing test** `tests/int/lettermint-plugin.int.spec.ts`

```ts
// @vitest-environment node
import type { Config, Endpoint, Field, GlobalConfig } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LettermintError, lettermintPlugin, PLUGIN_KEY, validateAddressList } from '@subneo/payload-lettermint'

const plugin = lettermintPlugin({
  defaultFrom: { address: 'noreply@indicate-data.io', name: 'Indicate Data' },
  defaultNotifyTo: 'hello@indicate-data.io',
  env: { apiToken: 'LM_PLUGIN_TEST' },
})
const base = { collections: [], globals: [], endpoints: [] } as unknown as Config

const flatten = (fields: Field[]): Field[] =>
  fields.flatMap((f) => (!('name' in f) && 'fields' in f ? flatten(f.fields as Field[]) : [f]))
const names = (fields: Field[]) => flatten(fields).map((f) => ('name' in f ? f.name : f.type))

const setup = async () => {
  const config = await plugin(base)
  const endpoint = (path: string) => (config.endpoints as Endpoint[]).find((e) => e.path === path)!
  const custom = config.custom as Record<string, unknown>
  const req = (over: Record<string, unknown> = {}) => ({
    user: { email: 'me@indicate-data.io' },
    i18n: { language: 'de' },
    searchParams: new URLSearchParams(),
    payload: {
      config: { custom },
      findGlobal: vi.fn(async () => ({})),
      logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      sendEmail: vi.fn(async () => ({ message_id: 'm1', status: 'pending' })),
    },
    ...over,
  })
  return { config, endpoint, req }
}

afterEach(() => {
  delete process.env.LM_PLUGIN_TEST
  vi.unstubAllGlobals()
})

describe('lettermintPlugin', () => {
  it('installs the adapter, the global, both endpoints and its options', async () => {
    const { config } = await setup()
    expect(typeof config.email).toBe('function')
    const global = (config.globals as GlobalConfig[]).find((g) => g.slug === 'email-settings')!
    expect(names(global.fields)).toEqual(['status', 'fromAddress', 'fromName', 'notifyTo', 'route'])
    expect((config.endpoints as Endpoint[]).map((e) => `${e.method} ${e.path}`)).toEqual(['get /lettermint/status', 'post /lettermint/test'])
    expect((config.custom as Record<string, unknown>)[PLUGIN_KEY]).toMatchObject({ globalSlug: 'email-settings' })
  })

  it('keeps the global away from visitors', async () => {
    const { config } = await setup()
    const global = (config.globals as GlobalConfig[]).find((g) => g.slug === 'email-settings')!
    const read = global.access!.read as (args: { req: { user?: unknown } }) => boolean
    expect(read({ req: {} })).toBe(false)
    expect(read({ req: { user: { id: 1 } } })).toBe(true)
  })

  it('leaves the config alone when disabled', async () => {
    const config = await lettermintPlugin({ enabled: false, defaultFrom: { address: 'a@x.io', name: 'A' } })(base)
    expect(config).toBe(base)
  })

  it('validates the team recipients', () => {
    expect(validateAddressList('a@x.io, "B" <b@x.io>')).toBe(true)
    expect(validateAddressList('a@x.io, nope')).toContain('nope')
    expect(typeof validateAddressList('')).toBe('string')
  })
})

describe('GET /api/lettermint/status', () => {
  it('needs a logged-in user', async () => {
    const { endpoint, req } = await setup()
    expect((await endpoint('/lettermint/status').handler(req({ user: null }) as never)).status).toBe(401)
  })

  it('reports a missing token', async () => {
    const { endpoint, req } = await setup()
    const data = await (await endpoint('/lettermint/status').handler(req() as never)).json()
    expect(data).toMatchObject({
      token: { configured: false, envName: 'LM_PLUGIN_TEST', hint: null },
      sender: { address: 'noreply@indicate-data.io', name: 'Indicate Data' },
      notifyTo: ['hello@indicate-data.io'],
      route: null,
    })
  })

  it('never returns more than the last four characters of the token', async () => {
    process.env.LM_PLUGIN_TEST = 'lm_live_supersecret_9f3a'
    const { endpoint, req } = await setup()
    const text = await (await endpoint('/lettermint/status').handler(req() as never)).text()
    expect(text).toContain('…9f3a')
    expect(text).not.toContain('supersecret')
  })

  it('checks the token with Lettermint on request', async () => {
    process.env.LM_PLUGIN_TEST = 'lm_live_supersecret_9f3a'
    vi.stubGlobal('fetch', vi.fn(async () => new Response('401', { status: 401 })))
    const { endpoint, req } = await setup()
    const data = await (await endpoint('/lettermint/status').handler(req({ searchParams: new URLSearchParams('check=1') }) as never)).json()
    expect(data.token.valid).toBe(false)
  })
})

describe('POST /api/lettermint/test', () => {
  it('needs a logged-in user', async () => {
    const { endpoint, req } = await setup()
    expect((await endpoint('/lettermint/test').handler(req({ user: null }) as never)).status).toBe(401)
  })

  it('refuses without a token', async () => {
    const { endpoint, req } = await setup()
    const res = await endpoint('/lettermint/test').handler(req() as never)
    expect(res.status).toBe(409)
    expect(await res.json()).toMatchObject({ ok: false, message: 'LM_PLUGIN_TEST is not set' })
  })

  it('sends only to the logged-in user', async () => {
    process.env.LM_PLUGIN_TEST = 'lm_live_supersecret_9f3a'
    const { endpoint, req } = await setup()
    const r = req({ data: { to: 'victim@example.org' } })
    const data = await (await endpoint('/lettermint/test').handler(r as never)).json()
    expect(data).toEqual({ ok: true, to: 'me@indicate-data.io', messageId: 'm1' })
    expect(r.payload.sendEmail).toHaveBeenCalledTimes(1)
    expect(r.payload.sendEmail.mock.calls[0][0]).toMatchObject({ to: 'me@indicate-data.io' })
  })

  it("returns Lettermint's message", async () => {
    process.env.LM_PLUGIN_TEST = 'lm_live_supersecret_9f3a'
    const { endpoint, req } = await setup()
    const r = req()
    r.payload.sendEmail.mockRejectedValueOnce(new LettermintError('The from field is invalid.', 422, { from: ['Domain not verified'] }))
    const res = await endpoint('/lettermint/test').handler(r as never)
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ ok: false, status: 422, message: 'The from field is invalid.', errors: { from: ['Domain not verified'] } })
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/lettermint-plugin.int.spec.ts`
Expected: FAIL, `lettermintPlugin` is not exported.

- [ ] **Step 3: Implement** `packages/payload-plugin-lettermint/src/global.ts`

```ts
import type { Field, GlobalConfig } from 'payload'

import { l } from './labels'
import { bareAddress, splitAddressList } from './message'
import type { ResolvedLettermintOptions } from './types'

/** Import-map path of the status panel; must match the `./admin` export. */
export const STATUS_FIELD_PATH = '@subneo/payload-lettermint/admin#EmailStatusField'

const EMAIL = /^[^\s@<>",]+@[^\s@<>",]+\.[^\s@<>",]+$/

/** Comma-separated list with at least one address, each of them valid. */
export const validateAddressList = (value: unknown, options?: { req?: { i18n?: { language?: string } } }): true | string => {
  const en = options?.req?.i18n?.language === 'en'
  const list = typeof value === 'string' ? splitAddressList(value) : []
  if (!list.length) return en ? 'Enter at least one address.' : 'Mindestens eine Adresse angeben.'
  const invalid = list.find((entry) => !EMAIL.test(bareAddress(entry)))
  if (invalid) return en ? `Not a valid address: ${invalid}` : `Keine gültige Adresse: ${invalid}`
  return true
}

/** Sender, team recipients and route. Readable only by logged-in users; the token is never here. */
export const createEmailSettingsGlobal = (o: ResolvedLettermintOptions): GlobalConfig => ({
  slug: o.globalSlug,
  label: l('E-Mail', 'Email'),
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: o.adminGroup,
    description: l(
      `Versand über Lettermint. Der Token steht nur in der Umgebungsvariable ${o.env.apiToken}, nie in der Datenbank.`,
      `Sent through Lettermint. The token lives only in the environment variable ${o.env.apiToken}, never in the database.`,
    ),
  },
  fields: [
    { name: 'status', type: 'ui', admin: { components: { Field: STATUS_FIELD_PATH } } },
    {
      type: 'row',
      fields: [
        {
          name: 'fromAddress',
          type: 'email',
          required: true,
          defaultValue: o.defaultFrom.address,
          label: l('Absenderadresse', 'Sender address'),
          admin: {
            width: '50%',
            description: l('Muss zu einer in Lettermint bestätigten Domain gehören.', 'Must be on a domain verified in Lettermint.'),
          },
        },
        {
          name: 'fromName',
          type: 'text',
          required: true,
          defaultValue: o.defaultFrom.name,
          label: l('Absendername', 'Sender name'),
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'notifyTo',
      type: 'text',
      required: true,
      defaultValue: o.defaultNotifyTo,
      label: l('Team-Empfänger', 'Team recipients'),
      validate: validateAddressList as never,
      admin: {
        description: l(
          'Kommagetrennt. Erhält die Formular-Benachrichtigungen, deren Feld „An“ leer ist.',
          'Comma-separated. Receives the form notifications whose "To" is empty.',
        ),
      },
    },
    {
      name: 'route',
      type: 'text',
      label: l('Lettermint-Route', 'Lettermint route'),
      admin: {
        description: l(
          'Leer: die Standard-Route des Projekts. Sollte eine Transaktions-Route sein.',
          "Empty: the project's default route. Should be a transactional route.",
        ),
      },
    },
  ] as Field[],
})
```

`packages/payload-plugin-lettermint/src/endpoints.ts`:

```ts
import type { Endpoint } from 'payload'

import { LettermintError, pingToken } from './client'
import { readEmailSettings } from './settings'
import { readToken, tokenHint } from './token'
import type { ResolvedLettermintOptions } from './types'

export const ENDPOINT_BASE = '/lettermint'

const unauthorized = () => Response.json({ error: 'Unauthorized' }, { status: 401 })

/** GET /api/lettermint/status — token state (never the token), settings; `?check=1` also asks Lettermint. */
export const createStatusEndpoint = (o: ResolvedLettermintOptions, deps: { fetch?: typeof fetch } = {}): Endpoint => ({
  path: `${ENDPOINT_BASE}/status`,
  method: 'get',
  handler: async (req) => {
    if (!req.user) return unauthorized()
    const token = readToken(o.env.apiToken)
    const settings = await readEmailSettings(req.payload, o)
    let valid: boolean | undefined
    let checkError: string | undefined
    if (token && req.searchParams?.get('check') === '1') {
      try {
        valid = await pingToken({ token, baseUrl: o.baseUrl, timeoutMs: o.timeoutMs, fetch: deps.fetch })
      } catch (err) {
        checkError = err instanceof LettermintError ? err.message : 'Check failed'
      }
    }
    return Response.json({
      token: {
        configured: Boolean(token),
        envName: o.env.apiToken,
        hint: tokenHint(token),
        ...(valid !== undefined ? { valid } : {}),
        ...(checkError ? { checkError } : {}),
      },
      sender: { address: settings.fromAddress, name: settings.fromName },
      notifyTo: settings.notifyTo,
      route: settings.route ?? null,
    })
  },
})

/** POST /api/lettermint/test — a short mail to the logged-in user's own address, never anyone else. */
export const createTestEndpoint = (o: ResolvedLettermintOptions): Endpoint => ({
  path: `${ENDPOINT_BASE}/test`,
  method: 'post',
  handler: async (req) => {
    if (!req.user) return unauthorized()
    const to = (req.user as { email?: unknown }).email
    if (typeof to !== 'string' || !to) {
      return Response.json({ ok: false, status: 400, message: 'Your account has no email address', errors: null }, { status: 400 })
    }
    if (!readToken(o.env.apiToken)) {
      return Response.json({ ok: false, status: 0, message: `${o.env.apiToken} is not set`, errors: null }, { status: 409 })
    }
    const de = req.i18n?.language !== 'en'
    try {
      const result = (await req.payload.sendEmail({
        to,
        subject: de ? 'Testmail aus dem CMS' : 'Test mail from the CMS',
        html: de
          ? '<p>Diese Testmail bestätigt, dass der Versand über Lettermint funktioniert.</p>'
          : '<p>This test mail confirms that sending through Lettermint works.</p>',
      })) as { message_id?: string | null } | undefined
      return Response.json({ ok: true, to, messageId: result?.message_id ?? null })
    } catch (err) {
      if (err instanceof LettermintError) {
        return Response.json({ ok: false, status: err.status, message: err.message, errors: err.errors ?? null }, { status: 502 })
      }
      req.payload.logger.error({ err, msg: '[lettermint] test mail failed' })
      return Response.json({ ok: false, status: 0, message: 'Sending failed; see the server log', errors: null }, { status: 500 })
    }
  },
})
```

`packages/payload-plugin-lettermint/src/plugin.ts`:

```ts
import type { Plugin } from 'payload'

import { createLettermintAdapter } from './adapter'
import { createStatusEndpoint, createTestEndpoint } from './endpoints'
import { createEmailSettingsGlobal } from './global'
import { PLUGIN_KEY, resolveOptions, type LettermintPluginOptions } from './types'

/**
 * Sends every `payload.sendEmail` through Lettermint (replacing any `email` adapter already set),
 * and adds the `email-settings` global plus the status and test endpoints.
 */
export const lettermintPlugin =
  (options: LettermintPluginOptions): Plugin =>
  (config) => {
    if (options.enabled === false) return config
    const o = resolveOptions(options)
    return {
      ...config,
      email: createLettermintAdapter(o),
      globals: [...(config.globals || []), createEmailSettingsGlobal(o)],
      endpoints: [...(config.endpoints || []), createStatusEndpoint(o), createTestEndpoint(o)],
      custom: { ...(config.custom || {}), [PLUGIN_KEY]: o },
    }
  }
```

Append to `packages/payload-plugin-lettermint/src/index.ts`:

```ts
export { lettermintPlugin } from './plugin'
export { ENDPOINT_BASE, createStatusEndpoint, createTestEndpoint } from './endpoints'
export { STATUS_FIELD_PATH, createEmailSettingsGlobal, validateAddressList } from './global'
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/lettermint-plugin.int.spec.ts`
Expected: PASS (12 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/payload-plugin-lettermint/src tests/int/lettermint-plugin.int.spec.ts
git commit -m "Lettermint: settings global, status and test endpoints, plugin"
```

---

### Task 5: Admin status panel and package README

**Files:**
- Create: `packages/payload-plugin-lettermint/src/components/i18n.ts`
- Create: `packages/payload-plugin-lettermint/src/components/EmailStatusField.tsx`
- Create: `packages/payload-plugin-lettermint/src/admin.ts`
- Create: `packages/payload-plugin-lettermint/README.md`
- Test: `tests/int/lettermint-admin.int.spec.tsx`

**Interfaces:**
- Consumes: status and test JSON shapes from Task 4; `ENDPOINT_BASE` path `/lettermint`.
- Produces: `EmailStatusField` exported from `@subneo/payload-lettermint/admin` (matches `STATUS_FIELD_PATH`).

- [ ] **Step 1: Write the failing test** `tests/int/lettermint-admin.int.spec.tsx`

```tsx
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@payloadcms/ui', () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  useConfig: () => ({ config: { serverURL: '', routes: { api: '/api' } } }),
  useAuth: () => ({ user: { email: 'me@indicate-data.io' } }),
  useTranslation: () => ({ i18n: { language: 'de' } }),
}))

import { EmailStatusField } from '@subneo/payload-lettermint/admin'

const status = (token: Record<string, unknown> = {}) => ({
  token: { configured: true, envName: 'LETTERMINT_API_TOKEN', hint: '…ab12', ...token },
  sender: { address: 'noreply@indicate-data.io', name: 'Indicate Data' },
  notifyTo: ['hello@indicate-data.io'],
  route: null,
})
const respond = (body: unknown, code = 200) => Promise.resolve({ ok: code < 400, status: code, json: async () => body })

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('EmailStatusField', () => {
  it('shows the configured token by its hint only', async () => {
    vi.stubGlobal('fetch', vi.fn(() => respond(status())))
    const { container } = render(<EmailStatusField />)
    await waitFor(() => expect(container.textContent).toContain('Token gesetzt über LETTERMINT_API_TOKEN (…ab12)'))
  })

  it('warns when the token is missing and disables the buttons', async () => {
    vi.stubGlobal('fetch', vi.fn(() => respond(status({ configured: false, hint: null }))))
    const { container } = render(<EmailStatusField />)
    await waitFor(() => expect(container.textContent).toContain('LETTERMINT_API_TOKEN ist nicht gesetzt'))
    expect((screen.getByText('Testmail an me@indicate-data.io senden') as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByText('Token prüfen') as HTMLButtonElement).disabled).toBe(true)
  })

  it('sends a test mail to the logged-in user and shows the result', async () => {
    const fetch = vi.fn((url: string) => (url.endsWith('/test') ? respond({ ok: true, to: 'me@indicate-data.io', messageId: 'm1' }) : respond(status())))
    vi.stubGlobal('fetch', fetch)
    const { container } = render(<EmailStatusField />)
    const button = await screen.findByText('Testmail an me@indicate-data.io senden')
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(button)
    await waitFor(() => expect(container.textContent).toContain('Gesendet an me@indicate-data.io (ID m1)'))
    expect(fetch).toHaveBeenCalledWith('/api/lettermint/test', expect.objectContaining({ method: 'POST' }))
  })

  it("shows Lettermint's field errors", async () => {
    const failed = { ok: false, status: 422, message: 'The from field is invalid.', errors: { from: ['Domain not verified'] } }
    vi.stubGlobal('fetch', vi.fn((url: string) => (url.endsWith('/test') ? respond(failed, 502) : respond(status()))))
    render(<EmailStatusField />)
    const button = await screen.findByText('Testmail an me@indicate-data.io senden')
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(button)
    expect(await screen.findByText('from: Domain not verified')).toBeTruthy()
    expect(screen.getByText('Lettermint: The from field is invalid.')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/lettermint-admin.int.spec.tsx`
Expected: FAIL, cannot resolve `@subneo/payload-lettermint/admin`.

- [ ] **Step 3: Implement**

`packages/payload-plugin-lettermint/src/components/i18n.ts`:

```ts
'use client'

import { useTranslation } from '@payloadcms/ui'

/** Picks the German or English string for the admin UI language. */
export const useL = () => {
  const { i18n } = useTranslation()
  return (de: string, en: string) => (i18n.language === 'de' ? de : en)
}
```

`packages/payload-plugin-lettermint/src/components/EmailStatusField.tsx`:

```tsx
'use client'

import { Button, useAuth, useConfig } from '@payloadcms/ui'
import React, { useCallback, useEffect, useState } from 'react'

import { useL } from './i18n'

type Status = {
  token: { configured: boolean; envName: string; hint: string | null; valid?: boolean; checkError?: string }
  sender: { address: string; name: string }
  notifyTo: string[]
  route: string | null
}

type TestResult =
  | { ok: true; to: string; messageId: string | null }
  | { ok: false; status: number; message: string; errors?: Record<string, string[]> | null }

const muted = { color: 'var(--theme-elevation-500)' }
const warning = { color: 'var(--theme-warning-500)' }
const failure = { color: 'var(--theme-error-500)' }
const success = { color: 'var(--theme-success-500)' }

/** Token status (never the token itself), a token check and a test mail to the logged-in user. */
export const EmailStatusField: React.FC = () => {
  const t = useL()
  const { config } = useConfig()
  const { user } = useAuth()
  const base = `${config.serverURL}${config.routes.api}/lettermint`
  const [status, setStatus] = useState<Status | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [busy, setBusy] = useState<'check' | 'test' | null>(null)
  const [result, setResult] = useState<TestResult | null>(null)

  const load = useCallback(
    async (check: boolean) => {
      try {
        const res = await fetch(`${base}/status${check ? '?check=1' : ''}`, { credentials: 'include' })
        if (!res.ok) throw new Error(String(res.status))
        setStatus((await res.json()) as Status)
        setLoadFailed(false)
      } catch {
        setLoadFailed(true)
      }
    },
    [base],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  const checkToken = async () => {
    setBusy('check')
    await load(true)
    setBusy(null)
  }

  const sendTest = async () => {
    setBusy('test')
    setResult(null)
    try {
      const res = await fetch(`${base}/test`, { method: 'POST', credentials: 'include' })
      setResult((await res.json()) as TestResult)
    } catch {
      setResult({ ok: false, status: 0, message: t('Server nicht erreichbar.', 'Server not reachable.') })
    }
    setBusy(null)
  }

  const token = status?.token
  const email = typeof user?.email === 'string' ? user.email : ''

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div className="field-label">{t('Versand über Lettermint', 'Sending through Lettermint')}</div>
      {loadFailed && <p style={failure}>{t('Status konnte nicht geladen werden.', 'Could not load the status.')}</p>}
      {!loadFailed && !status && <p style={muted}>…</p>}
      {token?.configured && (
        <p>
          {t('Token gesetzt über', 'Token set via')} <code>{token.envName}</code>
          {token.hint ? ` (${token.hint})` : ''}
        </p>
      )}
      {token && !token.configured && (
        <p style={warning}>
          {t('Kein Token: ', 'No token: ')}
          <code>{token.envName}</code>
          {t(
            ' ist nicht gesetzt. E-Mails werden nur ins Server-Log geschrieben.',
            ' is not set. Email is only written to the server log.',
          )}
        </p>
      )}
      {token?.valid === true && <p style={success}>{t('Lettermint akzeptiert den Token.', 'Lettermint accepts the token.')}</p>}
      {token?.valid === false && <p style={failure}>{t('Lettermint lehnt den Token ab.', 'Lettermint rejects the token.')}</p>}
      {token?.checkError && <p style={failure}>{token.checkError}</p>}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button buttonStyle="secondary" size="small" disabled={!token?.configured || busy !== null} onClick={() => void checkToken()}>
          {t('Token prüfen', 'Check token')}
        </Button>
        <Button
          buttonStyle="secondary"
          size="small"
          disabled={!token?.configured || !email || busy !== null}
          onClick={() => void sendTest()}
        >
          {t(`Testmail an ${email} senden`, `Send test mail to ${email}`)}
        </Button>
      </div>
      <p style={muted}>
        {t('Der Test nutzt die gespeicherten Einstellungen. Änderungen erst speichern.', 'The test uses the saved settings. Save changes first.')}
      </p>
      {result?.ok === true && (
        <p style={success}>
          {t(`Gesendet an ${result.to}`, `Sent to ${result.to}`)}
          {result.messageId ? ` (ID ${result.messageId})` : ''}
        </p>
      )}
      {result?.ok === false && (
        <div style={failure}>
          <p>{`Lettermint: ${result.message}`}</p>
          {result.errors && (
            <ul>
              {Object.entries(result.errors).map(([field, messages]) => (
                <li key={field}>{`${field}: ${messages.join(', ')}`}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
```

`packages/payload-plugin-lettermint/src/admin.ts`:

```ts
export { EmailStatusField } from './components/EmailStatusField'
```

`packages/payload-plugin-lettermint/README.md`:

````markdown
# @subneo/payload-lettermint

Sends Payload CMS email through [Lettermint](https://lettermint.co). Every `payload.sendEmail`
goes out through Lettermint's sending API: password resets, form-builder notifications, your own
mails. The project token stays in the environment. Sender, team recipients and route are edited in
the admin, next to a token status and a test mail.

## What it does

- Sets `config.email` to a Lettermint adapter. The token and the saved settings are read on every
  send, so nothing fails at startup and a restarted container picks up a new token.
- Without a token, mail is logged (recipients and subject) instead of sent, with one warning per
  process. Local development works without an account.
- Adds a global `email-settings`: sender address and name, team recipients, Lettermint route,
  and a status panel (token set or missing, its last four characters, "check token", "send test
  mail to me"). Only logged-in users can read or change it.
- Adds `GET /api/lettermint/status` and `POST /api/lettermint/test` (logged-in users only; the
  test goes to the user's own address).

## Install

1. Add the package (path alias in `tsconfig.json`, or install it). Entry points:
   `@subneo/payload-lettermint` (config) and `@subneo/payload-lettermint/admin` (status panel).
2. `payload.config.ts`:

   ```ts
   import { lettermintPlugin } from '@subneo/payload-lettermint'

   export default buildConfig({
     plugins: [
       lettermintPlugin({
         defaultFrom: { address: 'noreply@example.com', name: 'Example' },
         defaultNotifyTo: 'team@example.com',
       }),
     ],
   })
   ```

3. Set `LETTERMINT_API_TOKEN` to a **project** token (`lm_…`) in the server environment.
4. Verify the sender domain in the Lettermint project, then run `payload generate:importmap`.

## Options

| Option | Default | Meaning |
| --- | --- | --- |
| `defaultFrom` | required | Sender Payload uses by default (password resets); the global starts with it. |
| `defaultNotifyTo` | `defaultFrom.address` | Team recipients the global starts with, comma-separated. |
| `env.apiToken` | `LETTERMINT_API_TOKEN` | Environment variable holding the token. |
| `globalSlug` | `email-settings` | Slug of the settings global. |
| `adminGroup` | "Einstellungen" / "Settings" | Admin sidebar group of the global. |
| `baseUrl` | `https://api.lettermint.co/v1` | API base URL. |
| `timeoutMs` | `10000` | Request timeout; there are no retries. |
| `enabled` | `true` | `false` leaves the config untouched. |

## Sender rules

A message without `from`, or with Payload's default sender, goes out with the sender saved in the
global. A message that sets its own `from` keeps it. Either way the domain must be verified in
Lettermint.

## Site code

`getEmailSettings(payload)` returns the saved sender, the team recipients as a list and the
route, with the plugin defaults filled in. Errors from Lettermint are `LettermintError`s with
`status` (0 when Lettermint was not reached), `message` and, for a 422, per-field `errors`.

## Security

- The token is read from the environment only. It is never stored, logged or returned; the status
  endpoint shows `…` and its last four characters, and only for tokens of 12 characters or more.
- Attachments and other nodemailer-only options are dropped with a warning.
````

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/lettermint-admin.int.spec.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/payload-plugin-lettermint tests/int/lettermint-admin.int.spec.tsx
git commit -m "Lettermint: admin status panel with token check and test mail; README"
```

---

### Task 6: Wire the plugin into the site

**Files:**
- Create: `src/email/config.ts`
- Modify: `src/plugins/index.ts` (imports; plugin list after `testimonialsPlugin()`)
- Modify: `src/environment.d.ts`
- Modify: `deploy/app.env.example`
- Modify: `deploy/README.md` (env table, after the `SUBNEO_API_KEY` row)
- Modify: `src/app/(payload)/admin/importMap.js` (generated)
- Modify: `src/payload-types.ts` (generated)
- Test: `tests/int/email-site-config.int.spec.ts`

**Interfaces:**
- Consumes: `lettermintPlugin`, `LettermintPluginOptions` (Tasks 3–4).
- Produces: `emailPluginOptions: LettermintPluginOptions` in `src/email/config.ts`; the running site has `email-settings` and `payload.email` = Lettermint adapter.

- [ ] **Step 1: Write the failing test** `tests/int/email-site-config.int.spec.ts`

```ts
// @vitest-environment node
import type { Config, GlobalConfig } from 'payload'
import { describe, expect, it } from 'vitest'

import { lettermintPlugin } from '@subneo/payload-lettermint'

import { emailPluginOptions } from '@/email/config'

describe('site email settings', () => {
  it('puts the E-Mail global under Website with the site defaults', async () => {
    const config = await lettermintPlugin(emailPluginOptions)({ globals: [], endpoints: [] } as unknown as Config)
    const global = (config.globals as GlobalConfig[]).find((g) => g.slug === 'email-settings')!
    expect(global.admin?.group).toEqual({ de: 'Website', en: 'Site' })
    expect(emailPluginOptions.defaultFrom).toEqual({ address: 'noreply@indicate-data.io', name: 'Indicate Data' })
    expect(emailPluginOptions.defaultNotifyTo).toBe('hello@indicate-data.io')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/email-site-config.int.spec.ts`
Expected: FAIL, cannot resolve `@/email/config`.

- [ ] **Step 3: Implement**

`src/email/config.ts`:

```ts
import type { LettermintPluginOptions } from '@subneo/payload-lettermint'

/**
 * Starting values for the admin's Website -> E-Mail page. The Lettermint token is never here:
 * it comes from LETTERMINT_API_TOKEN only.
 */
export const emailPluginOptions: LettermintPluginOptions = {
  defaultFrom: { address: 'noreply@indicate-data.io', name: 'Indicate Data' },
  defaultNotifyTo: 'hello@indicate-data.io',
  adminGroup: { de: 'Website', en: 'Site' },
}
```

In `src/plugins/index.ts` add the imports next to the other `@subneo/*` imports:

```ts
import { lettermintPlugin } from '@subneo/payload-lettermint'
import { emailPluginOptions } from '@/email/config'
```

and add after `testimonialsPlugin(),`:

```ts
  // All outgoing email (forms, password reset) through Lettermint; token from LETTERMINT_API_TOKEN only.
  lettermintPlugin(emailPluginOptions),
```

In `src/environment.d.ts`, after `SUBNEO_REFRESH_SECRET`:

```ts
      /** Lettermint project token (`lm_…`) for outgoing email. Env only, never stored in the database. */
      LETTERMINT_API_TOKEN?: string
```

In `deploy/app.env.example`, after the `SUBNEO_API_KEY=` line and its blank line:

```
# Lettermint project token (lm_…) for outgoing email: form notifications, confirmations and
# password resets. Read only from here or the container environment, never stored in the
# database. Empty: mail is written to the server log instead of sent. Sender and team
# recipients are set in the admin under Website -> E-Mail.
LETTERMINT_API_TOKEN=
```

In `deploy/README.md`, after the `SUBNEO_API_KEY` table row:

```markdown
| `LETTERMINT_API_TOKEN` | no | Lettermint project token for outgoing email. Environment only, never stored in the database; empty means mail is only logged. Sender and team recipients live in the admin under Website → E-Mail. |
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/email-site-config.int.spec.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Regenerate the import map and types**

```bash
DATABASE_URL=postgres://payload:payload@localhost:5433/lettermint_dev pnpm generate:importmap
DATABASE_URL=postgres://payload:payload@localhost:5433/lettermint_dev pnpm generate:types
```
Expected: `src/app/(payload)/admin/importMap.js` gains `"@subneo/payload-lettermint/admin#EmailStatusField"`; `src/payload-types.ts` gains `EmailSetting` / `email-settings`. `git diff --stat` shows only those two generated files besides the edits above.

- [ ] **Step 6: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/email/config.ts src/plugins/index.ts src/environment.d.ts deploy/app.env.example deploy/README.md "src/app/(payload)/admin/importMap.js" src/payload-types.ts tests/int/email-site-config.int.spec.ts
git commit -m "Email: Lettermint plugin in the site config, LETTERMINT_API_TOKEN documented"
```

---

### Task 7: Form email rules: language, default recipient, confirmation cap, honeypot

**Files:**
- Create: `src/email/confirmationCap.ts`
- Create: `src/email/formFields.ts`
- Create: `src/email/formEmails.ts`
- Create: `src/email/honeypot.ts`
- Create: `src/blocks/Form/submission.ts` (client-safe constant and body builder, also used in Task 8)
- Create: `src/plugins/formBuilder.ts`
- Modify: `src/plugins/index.ts` (replace the inline `formBuilderPlugin({...})` options)
- Test: `tests/int/email-forms.int.spec.ts`

**Interfaces:**
- Consumes: `getEmailSettings`, `bareAddress` from `@subneo/payload-lettermint`; `locales`, `localeLabels`, `defaultLocale`, `isLocale` from `@/i18n/config`.
- Produces: `createCap(opts?: { limit?: number; windowMs?: number; now?: () => number }): { allow(address: string): boolean }`, `confirmationCap`, `createBeforeEmail(cap?): BeforeEmail`, `visitorAddressed(emailTo): boolean`, `rejectHoneypot: CollectionBeforeValidateHook`, `HONEYPOT_FIELD = '_hp'` (from `src/blocks/Form/submission.ts`), `buildSubmissionBody(formID, data, locale)`, `emailLanguageField`, `withEmailLanguage(field)`, `submissionLocaleField`, `formBuilderOptions: FormBuilderPluginConfig`.

- [ ] **Step 1: Write the failing test** `tests/int/email-forms.int.spec.ts`

```ts
// @vitest-environment node
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { APIError, type CollectionConfig, type Config, type Field } from 'payload'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@subneo/payload-lettermint', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@subneo/payload-lettermint')>()),
  getEmailSettings: vi.fn(async () => ({
    fromAddress: 'noreply@indicate-data.io',
    fromName: 'Indicate Data',
    notifyTo: ['hello@indicate-data.io', 'sales@indicate-data.io'],
  })),
}))

import { createCap } from '@/email/confirmationCap'
import { createBeforeEmail } from '@/email/formEmails'
import { rejectHoneypot } from '@/email/honeypot'
import { formBuilderOptions } from '@/plugins/formBuilder'

const formEmails = [
  { emailTo: '', language: 'all' },
  { emailTo: '{{email}}', language: 'de' },
  { emailTo: '{{email}}', language: 'en' },
]
// What the form builder hands over: an empty emailTo has already become its fallback address.
const incoming = (visitor = 'visitor@example.org') =>
  ['noreply@indicate-data.io', visitor, visitor].map((to, i) => ({ to, subject: `s${i}`, html: '<div>x</div>', from: '', replyTo: '', cc: '', bcc: '' }))
const params = (data: Record<string, unknown>) => {
  const findByID = vi.fn(async () => ({ id: 7, emails: formEmails }))
  const warn = vi.fn()
  return { args: { data, req: { payload: { findByID, logger: { warn } } } } as never, findByID, warn }
}

describe('beforeEmail', () => {
  it("sends the team mail and the confirmation in the visitor's language", async () => {
    const out = await createBeforeEmail(createCap())(incoming(), params({ form: 7, locale: 'en' }).args)
    expect(out.map((e) => [e.subject, e.to])).toEqual([
      ['s0', 'hello@indicate-data.io, sales@indicate-data.io'],
      ['s2', 'visitor@example.org'],
    ])
  })

  it('treats a submission without locale as German', async () => {
    const out = await createBeforeEmail(createCap())(incoming(), params({ form: 7 }).args)
    expect(out.map((e) => e.subject)).toEqual(['s0', 's1'])
  })

  it('reads the form id from a populated doc', async () => {
    const { args, findByID } = params({})
    ;(args as { doc?: unknown }).doc = { form: { id: 7 }, locale: 'de' }
    await createBeforeEmail(createCap())(incoming(), args)
    expect(findByID).toHaveBeenCalledWith(expect.objectContaining({ collection: 'forms', id: 7, depth: 0 }))
  })

  it('cap counts spellings of one address together and keeps the team mail', async () => {
    const beforeEmail = createBeforeEmail(createCap())
    for (const visitor of ['visitor@example.org', 'Visitor@Example.org ', ' VISITOR@example.org']) {
      expect(await beforeEmail(incoming(visitor), params({ form: 7, locale: 'de' }).args)).toHaveLength(2)
    }
    const { args, warn } = params({ form: 7, locale: 'de' })
    const out = await beforeEmail(incoming('visitor@EXAMPLE.org'), args)
    expect(out.map((e) => e.subject)).toEqual(['s0'])
    expect(warn.mock.calls[0][0]).toContain('example.org')
    expect(warn.mock.calls[0][0]).not.toContain('visitor')
  })
})

describe('createCap', () => {
  it('allows three per rolling hour', () => {
    let now = 0
    const cap = createCap({ now: () => now })
    expect([cap.allow('a@x.io'), cap.allow('a@x.io'), cap.allow('a@x.io'), cap.allow('a@x.io')]).toEqual([true, true, true, false])
    now = 60 * 60 * 1000
    expect(cap.allow('a@x.io')).toBe(true)
  })
})

describe('rejectHoneypot', () => {
  const run = (value: string, operation = 'create') =>
    rejectHoneypot({ data: { form: 1, submissionData: [{ field: 'name', value: 'Ada' }, { field: '_hp', value }] }, operation } as never)

  it('rejects a filled trap', () => {
    expect(() => run('https://spam.example')).toThrow(APIError)
    try {
      run('x')
    } catch (err) {
      expect((err as APIError).status).toBe(400)
    }
  })

  it('strips an empty trap before save', () => {
    expect(run('')).toEqual({ form: 1, submissionData: [{ field: 'name', value: 'Ada' }] })
  })

  it('leaves other operations alone', () => {
    expect(run('x', 'update')).toMatchObject({ submissionData: [{ field: 'name' }, { field: '_hp' }] })
  })
})

describe('formBuilderOptions', () => {
  const flatten = (fields: Field[]): Field[] =>
    fields.flatMap((f) => (!('name' in f) && 'fields' in f ? flatten(f.fields as Field[]) : [f]))
  const byName = (fields: Field[], name: string) => flatten(fields).find((f) => 'name' in f && f.name === name) as Field & Record<string, unknown>

  it('adds the language to form emails and the locale and trap to submissions', async () => {
    const config = await formBuilderPlugin(formBuilderOptions)({ collections: [] } as unknown as Config)
    const forms = (config.collections as CollectionConfig[]).find((c) => c.slug === 'forms')!
    const emails = byName(forms.fields, 'emails') as unknown as { fields: Field[] }
    expect(byName(emails.fields, 'language')).toMatchObject({ type: 'select', defaultValue: 'all' })
    const submissions = (config.collections as CollectionConfig[]).find((c) => c.slug === 'form-submissions')!
    expect(byName(submissions.fields, 'locale')).toMatchObject({ type: 'select', defaultValue: 'de' })
    expect(submissions.hooks?.beforeValidate).toContain(rejectHoneypot)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/email-forms.int.spec.ts`
Expected: FAIL, cannot resolve `@/email/confirmationCap`.

- [ ] **Step 3: Implement**

`src/blocks/Form/submission.ts`:

```ts
import type { Locale } from '@/i18n/config'

/** Name of the hidden trap field; bots fill it, people never see it. Checked in src/email/honeypot.ts. */
export const HONEYPOT_FIELD = '_hp'

/** Body for POST /api/form-submissions: the fields as the form builder expects them, plus the page language. */
export const buildSubmissionBody = (formID: number | string | undefined, data: Record<string, unknown>, locale: Locale) => ({
  form: formID,
  locale,
  submissionData: Object.entries(data).map(([field, value]) => ({ field, value })),
})
```

`src/email/confirmationCap.ts`:

```ts
export const CONFIRMATION_LIMIT = 3
export const CONFIRMATION_WINDOW_MS = 60 * 60 * 1000

/**
 * In-memory limit on mails to visitor-supplied addresses, per address and rolling window. Resets on
 * restart; production runs one container, so that is enough.
 */
export const createCap = ({
  limit = CONFIRMATION_LIMIT,
  windowMs = CONFIRMATION_WINDOW_MS,
  now = Date.now,
}: { limit?: number; windowMs?: number; now?: () => number } = {}) => {
  const sent = new Map<string, number[]>()
  return {
    /** Records a mail to `address` and says whether it may go out. */
    allow(address: string): boolean {
      const key = address.trim().toLowerCase()
      const at = now()
      const recent = (sent.get(key) || []).filter((time) => at - time < windowMs)
      if (recent.length >= limit) {
        sent.set(key, recent)
        return false
      }
      recent.push(at)
      sent.set(key, recent)
      if (sent.size > 5000) {
        for (const [k, times] of sent) if (times.every((time) => at - time >= windowMs)) sent.delete(k)
      }
      return true
    },
  }
}

export const confirmationCap = createCap()
```

`src/email/formFields.ts`:

```ts
import type { Field } from 'payload'

import { defaultLocale, localeLabels, locales } from '@/i18n/config'

/** Per form email: only send when the form was filled in on a page in this language. */
export const emailLanguageField: Field = {
  name: 'language',
  type: 'select',
  required: true,
  defaultValue: 'all',
  label: { de: 'Sprache', en: 'Language' },
  options: [
    { label: { de: 'Alle Sprachen', en: 'All languages' }, value: 'all' },
    ...locales.map((code) => ({ label: localeLabels[code], value: code })),
  ],
  admin: {
    description: {
      de: 'Nur senden, wenn das Formular auf einer Seite in dieser Sprache ausgefüllt wurde.',
      en: 'Only send when the form was filled in on a page in this language.',
    },
  },
}

/** Appends the language select to the form builder's `emails` array. */
export const withEmailLanguage = (field: Field): Field =>
  'name' in field && field.name === 'emails' && field.type === 'array' ? { ...field, fields: [...field.fields, emailLanguageField] } : field

/** Page language of a submission, sent by the form block. */
export const submissionLocaleField: Field = {
  name: 'locale',
  type: 'select',
  defaultValue: defaultLocale,
  label: { de: 'Sprache', en: 'Language' },
  options: locales.map((code) => ({ label: localeLabels[code], value: code })),
  admin: { position: 'sidebar', readOnly: true },
}
```

`src/email/formEmails.ts`:

```ts
import type { BeforeEmail } from '@payloadcms/plugin-form-builder/types'
import { bareAddress, getEmailSettings } from '@subneo/payload-lettermint'

import { defaultLocale, isLocale } from '@/i18n/config'

import { confirmationCap } from './confirmationCap'

type EmailEntry = { emailTo?: string | null; language?: string | null }

/** A recipient built from the submission (`{{email}}`), i.e. an address the visitor typed. */
export const visitorAddressed = (emailTo: string | null | undefined): boolean => Boolean(emailTo && /\{\{.+?\}\}/.test(emailTo))

/**
 * Runs after the form builder has formatted one mail per form email entry, in entry order. Drops
 * entries for another language, sends entries without "To" to the team recipients, and caps mails
 * to visitor-supplied addresses.
 */
export const createBeforeEmail =
  (cap = confirmationCap): BeforeEmail =>
  async (emails, params) => {
    const { req } = params
    // The form builder calls this from afterChange, so `doc` is there at runtime; its type says beforeChange.
    const source = ((params as { doc?: Record<string, unknown> }).doc ?? params.data ?? {}) as Record<string, unknown>
    const locale = isLocale(source.locale) ? source.locale : defaultLocale
    const formRef = source.form
    const formId = typeof formRef === 'object' && formRef !== null ? (formRef as { id: number | string }).id : formRef
    const form = await req.payload.findByID({ collection: 'forms', id: formId as number, depth: 0, req })
    const entries = (form.emails || []) as EmailEntry[]
    const settings = await getEmailSettings(req.payload)

    return emails.flatMap((email, index) => {
      const entry = entries[index] || {}
      const language = entry.language || 'all'
      if (language !== 'all' && language !== locale) return []
      if (!entry.emailTo?.trim()) return [{ ...email, to: settings.notifyTo.join(', ') }]
      if (visitorAddressed(entry.emailTo)) {
        const recipient = bareAddress(String(email.to)).toLowerCase()
        if (!cap.allow(recipient)) {
          req.payload.logger.warn(`[email] confirmation limit reached for an address at ${recipient.split('@')[1] ?? 'unknown'}; mail not sent`)
          return []
        }
      }
      return [email]
    })
  }
```

`src/email/honeypot.ts`:

```ts
import { APIError, type CollectionBeforeValidateHook } from 'payload'

import { HONEYPOT_FIELD } from '@/blocks/Form/submission'

export { HONEYPOT_FIELD }

/** A filled trap fails the submission (nothing saved, nothing sent); an empty one is removed before save. */
export const rejectHoneypot: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (operation !== 'create' || !data || !Array.isArray(data.submissionData)) return data
  const entries = data.submissionData as { field?: unknown; value?: unknown }[]
  const trap = entries.find((entry) => entry?.field === HONEYPOT_FIELD)
  if (trap && typeof trap.value === 'string' && trap.value.trim() !== '') {
    throw new APIError('Submission rejected.', 400, undefined, true)
  }
  return { ...data, submissionData: entries.filter((entry) => entry?.field !== HONEYPOT_FIELD) }
}
```

`src/plugins/formBuilder.ts` (moves the existing inline options out of `src/plugins/index.ts` and extends them):

```ts
import type { FormBuilderPluginConfig } from '@payloadcms/plugin-form-builder/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { createBeforeEmail } from '@/email/formEmails'
import { submissionLocaleField, withEmailLanguage } from '@/email/formFields'
import { rejectHoneypot } from '@/email/honeypot'

export const formBuilderOptions: FormBuilderPluginConfig = {
  fields: {
    payment: false,
  },
  // Language filter, team recipients for entries without "To", limit on visitor confirmations.
  beforeEmail: createBeforeEmail(),
  formOverrides: {
    fields: ({ defaultFields }) => {
      return defaultFields.map((field) => {
        if ('name' in field && field.name === 'confirmationMessage') {
          return {
            ...field,
            editor: lexicalEditor({
              features: ({ rootFeatures }) => {
                return [...rootFeatures, FixedToolbarFeature(), HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] })]
              },
            }),
          }
        }
        return withEmailLanguage(field)
      })
    },
  },
  formSubmissionOverrides: {
    fields: ({ defaultFields }) => [...defaultFields, submissionLocaleField],
    hooks: { beforeValidate: [rejectHoneypot] },
  },
}
```

In `src/plugins/index.ts`: replace the whole `formBuilderPlugin({ … }),` call with `formBuilderPlugin(formBuilderOptions),`, add `import { formBuilderOptions } from './formBuilder'`, and remove the imports that are now unused there (`FixedToolbarFeature`, `HeadingFeature`, `lexicalEditor` if nothing else in the file uses them; check with `pnpm lint`).

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/email-forms.int.spec.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Lint the touched files**

Run: `pnpm exec eslint src/email src/plugins src/blocks/Form/submission.ts`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/email src/plugins/formBuilder.ts src/plugins/index.ts src/blocks/Form/submission.ts tests/int/email-forms.int.spec.ts
git commit -m "Email: form mails by page language, team recipients, confirmation limit, honeypot"
```

---

### Task 8: Form block sends the page language and the trap field

**Files:**
- Modify: `src/blocks/Form/Component.tsx` (imports; `onSubmit` body; honeypot input inside `<form>`)
- Test: `tests/int/form-submission.int.spec.ts`

**Interfaces:**
- Consumes: `buildSubmissionBody`, `HONEYPOT_FIELD` (Task 7); `useLocale()` from `@/providers/Locale`.
- Produces: submissions carrying `locale` and a `_hp` entry.

- [ ] **Step 1: Write the failing test** `tests/int/form-submission.int.spec.ts`

```ts
// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { buildSubmissionBody, HONEYPOT_FIELD } from '@/blocks/Form/submission'
import { HONEYPOT_FIELD as serverTrapName } from '@/email/honeypot'

describe('form submission body', () => {
  it('sends the page language with the fields', () => {
    expect(buildSubmissionBody(4, { name: 'Ada', [HONEYPOT_FIELD]: '' }, 'en')).toEqual({
      form: 4,
      locale: 'en',
      submissionData: [
        { field: 'name', value: 'Ada' },
        { field: '_hp', value: '' },
      ],
    })
  })

  it('uses the trap name the server checks', () => {
    expect(serverTrapName).toBe(HONEYPOT_FIELD)
  })
})
```

- [ ] **Step 2: Run it to verify it passes already for the helper**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/form-submission.int.spec.ts`
Expected: PASS (the helper exists since Task 7). This task's change is the component using it, verified in Step 5.

- [ ] **Step 3: Use the helper and the locale in the component**

In `src/blocks/Form/Component.tsx` add the imports:

```ts
import { useLocale } from '@/providers/Locale'
import { buildSubmissionBody, HONEYPOT_FIELD } from './submission'
```

Inside `FormBlock`, next to `const router = useRouter()`:

```ts
  const locale = useLocale()
```

Replace the `dataToSend` mapping and the `fetch` body:

```ts
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify(buildSubmissionBody(formID, data as unknown as Record<string, unknown>, locale)),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })
```

(delete the now-unused `const dataToSend = …` block) and add `locale` to the `useCallback` dependency list: `[router, formID, redirect, confirmationType, formFromProps.title, locale]`.

Inside `<form …>`, directly after the opening tag, add the trap:

```tsx
              {/* Trap for bots: off-screen, skipped by keyboard and screen readers. */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
                <label htmlFor={`${formID}-${HONEYPOT_FIELD}`}>Leave this field empty</label>
                <input id={`${formID}-${HONEYPOT_FIELD}`} type="text" tabIndex={-1} autoComplete="off" {...register(HONEYPOT_FIELD as never)} />
              </div>
```

- [ ] **Step 4: Type-check and lint**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint src/blocks/Form`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/blocks/Form/Component.tsx tests/int/form-submission.int.spec.ts
git commit -m "Form block: send the page language and a honeypot field"
```

(Browser check of the trap and the language happens in Task 12.)

---

### Task 9: Password reset email in German and English

**Files:**
- Create: `src/email/passwordReset.ts`
- Modify: `src/collections/Users/index.ts` (`auth: true` becomes the object below)
- Test: `tests/int/email-password-reset.int.spec.ts`

**Interfaces:**
- Consumes: `getServerSideURL()` from `@/utilities/getURL`.
- Produces: `passwordResetSubject(args?)`, `passwordResetHTML(args?)`, `resetURL(req, token)`.

- [ ] **Step 1: Write the failing test** `tests/int/email-password-reset.int.spec.ts`

```ts
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { passwordResetHTML, passwordResetSubject, resetURL } from '@/email/passwordReset'

const req = (language: string) =>
  ({ i18n: { language }, payload: { config: { routes: { admin: '/admin' }, admin: { routes: { reset: '/reset' } } } } }) as never

describe('password reset mail', () => {
  const saved = process.env.SITE_URL
  beforeEach(() => {
    process.env.SITE_URL = 'https://indicate-data.test/'
  })
  afterEach(() => {
    // Assigning undefined to process.env would store the string "undefined".
    if (saved === undefined) delete process.env.SITE_URL
    else process.env.SITE_URL = saved
  })

  it('links to the admin reset page on SITE_URL', () => {
    expect(resetURL(req('de'), 'tok/123')).toBe('https://indicate-data.test/admin/reset/tok%2F123')
  })

  it('speaks German by default and English for English admins', async () => {
    expect(await passwordResetSubject({ req: req('de') })).toBe('Passwort zurücksetzen – Indicate Data')
    expect(await passwordResetSubject({ req: req('en') })).toBe('Reset your password – Indicate Data')
    expect(await passwordResetSubject({})).toBe('Passwort zurücksetzen – Indicate Data')
    const en = await passwordResetHTML({ req: req('en'), token: 'abc', user: { name: 'Ada' } })
    expect(en).toContain('Set a new password')
    expect(en).toContain('valid for one hour')
    expect(en).toContain('href="https://indicate-data.test/admin/reset/abc"')
    expect(await passwordResetHTML({ req: req('de'), token: 'abc' })).toContain('Neues Passwort festlegen')
  })

  it('escapes the user name', async () => {
    const html = await passwordResetHTML({ req: req('de'), token: 'abc', user: { name: '<b>Ada</b>' } })
    expect(html).toContain('Hallo &lt;b&gt;Ada&lt;/b&gt;,')
    expect(html).not.toContain('<b>Ada</b>')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/email-password-reset.int.spec.ts`
Expected: FAIL, cannot resolve `@/email/passwordReset`.

- [ ] **Step 3: Implement** `src/email/passwordReset.ts`

```ts
import type { PayloadRequest } from 'payload'

import { getServerSideURL } from '@/utilities/getURL'

type Args = { req?: PayloadRequest; token?: string; user?: { name?: unknown } | null }
type Lang = 'de' | 'en'

const langOf = (req?: PayloadRequest): Lang => (req?.i18n?.language === 'en' ? 'en' : 'de')

const escapeHTML = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const copy = {
  de: {
    subject: 'Passwort zurücksetzen – Indicate Data',
    greeting: (name?: string) => (name ? `Hallo ${name},` : 'Hallo,'),
    body: 'für Ihr Konto im Indicate-Data-CMS wurde ein neues Passwort angefordert. Über den Button legen Sie es fest.',
    button: 'Neues Passwort festlegen',
    fallback: 'Falls der Button nicht funktioniert, öffnen Sie diesen Link:',
    validity: 'Der Link ist eine Stunde gültig.',
    ignore: 'Wenn Sie das nicht waren, ignorieren Sie diese E-Mail. Ihr Passwort bleibt dann unverändert.',
  },
  en: {
    subject: 'Reset your password – Indicate Data',
    greeting: (name?: string) => (name ? `Hello ${name},` : 'Hello,'),
    body: 'a new password was requested for your account in the Indicate Data CMS. Use the button to set it.',
    button: 'Set a new password',
    fallback: 'If the button does not work, open this link:',
    validity: 'The link is valid for one hour.',
    ignore: 'If this was not you, ignore this email. Your password stays as it is.',
  },
} satisfies Record<Lang, Record<string, unknown>>

/** `SITE_URL` + admin route + reset route + token, the page Payload's admin serves for resets. */
export const resetURL = (req: PayloadRequest | undefined, token: string): string => {
  const admin = req?.payload?.config?.routes?.admin ?? '/admin'
  const reset = req?.payload?.config?.admin?.routes?.reset ?? '/reset'
  return `${getServerSideURL().replace(/\/+$/, '')}${admin}${reset}/${encodeURIComponent(token)}`
}

export const passwordResetSubject = async ({ req }: Args = {}): Promise<string> => copy[langOf(req)].subject

/** Branded reset mail; the token expiry is Payload's default of one hour. */
export const passwordResetHTML = async ({ req, token = '', user }: Args = {}): Promise<string> => {
  const lang = langOf(req)
  const t = copy[lang]
  const url = escapeHTML(resetURL(req, token))
  const name = typeof user?.name === 'string' && user.name.trim() ? escapeHTML(user.name.trim()) : undefined
  const small = 'font-size:13px;line-height:1.5;color:#4b5563'
  return `<!doctype html>
<html lang="${lang}"><body style="margin:0;padding:24px;background:#f6f7f9;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#111827">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:8px"><tr><td style="padding:32px">
<p style="margin:0 0 24px;font-size:16px;font-weight:600">Indicate Data</p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.5">${t.greeting(name)}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.5">${t.body}</p>
<p style="margin:0 0 24px"><a href="${url}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600">${t.button}</a></p>
<p style="margin:0 0 16px;${small}">${t.fallback}<br><a href="${url}" style="color:#4b5563;word-break:break-all">${url}</a></p>
<p style="margin:0;${small}">${t.validity} ${t.ignore}</p>
</td></tr></table>
</td></tr></table>
</body></html>`
}
```

In `src/collections/Users/index.ts`, add the import and replace `auth: true,`:

```ts
import { passwordResetHTML, passwordResetSubject } from '../../email/passwordReset'
```

```ts
  auth: {
    forgotPassword: {
      generateEmailSubject: passwordResetSubject,
      generateEmailHTML: passwordResetHTML,
    },
  },
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/email-password-reset.int.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors (if `generateEmailHTML`'s parameter type rejects `Args`, widen `Args['user']` to `unknown` and read `name` via `(user as { name?: unknown } | undefined)?.name`).

- [ ] **Step 6: Commit**

```bash
git add src/email/passwordReset.ts src/collections/Users/index.ts tests/int/email-password-reset.int.spec.ts
git commit -m "Email: branded password reset mail in German and English"
```

---

### Task 10: Generated types, import map and the production migration

**Files:**
- Modify: `src/payload-types.ts` (generated)
- Create: `src/migrations/<stamp>_lettermint_email.ts` and `.json` (generated)
- Modify: `src/migrations/index.ts`

**Interfaces:**
- Produces: `Form['emails'][number]['language']: 'all' | 'de' | 'en'`, `FormSubmission['locale']`, `EmailSetting` types; one migration creating the schema in production.

- [ ] **Step 1: Regenerate types and import map**

```bash
DATABASE_URL=postgres://payload:payload@localhost:5433/lettermint_dev pnpm generate:types
DATABASE_URL=postgres://payload:payload@localhost:5433/lettermint_dev pnpm generate:importmap
```
Expected: `src/payload-types.ts` gains `language?: ('all' | 'de' | 'en')` inside `Form.emails` and `locale?: ('de' | 'en') | null` on `FormSubmission`. Import map unchanged since Task 6.

- [ ] **Step 2: Create the migration against the scratch DB**

Run: `DEV_DATABASE_URL=postgres://payload:payload@localhost:5433/lettermint_dev make migration NAME=lettermint_email`
Expected: `src/migrations/<stamp>_lettermint_email.ts` and `.json`, and a new entry at the end of `src/migrations/index.ts`.

- [ ] **Step 3: Review the generated SQL**

Open the new `.ts`. Its `up` must contain only:
- `CREATE TYPE "public"."enum_forms_emails_language" AS ENUM('all', 'de', 'en');`
- `CREATE TYPE "public"."enum_form_submissions_locale" AS ENUM('de', 'en');`
- `CREATE TABLE "email_settings"` with `from_address`, `from_name`, `notify_to` (NOT NULL, with the site defaults), `route`, `updated_at`, `created_at`
- `ALTER TABLE "forms_emails" ADD COLUMN "language" "enum_forms_emails_language" DEFAULT 'all' NOT NULL;`
- `ALTER TABLE "form_submissions" ADD COLUMN "locale" "enum_form_submissions_locale" DEFAULT 'de';`

and `down` the reverse. Anything else (other tables, drops) means the snapshot drifted: stop and investigate before continuing.

- [ ] **Step 4: Place it before `convert_sections` unless production already ran that**

Ask the user: "Has production already run migration `20260925_163800_convert_sections`?"
- If **yes**: keep the generated stamp and order.
- If **no or unsure**: rename both files to `20260925_163750_lettermint_email.ts` / `.json`, and in `src/migrations/index.ts` rename the import to `migration_20260925_163750_lettermint_email` (path `./20260925_163750_lettermint_email`) and move its `{ up, down, name: '20260925_163750_lettermint_email' }` entry to directly before the `20260925_163800_convert_sections` entry. Reason: the conversion reads pages through the current config, pages reference forms, and `forms_emails.language` must exist by then.

- [ ] **Step 5: Type-check and run the whole int suite**

Run: `pnpm exec tsc --noEmit && pnpm test:int`
Expected: no type errors; all int specs pass (DB specs skip without their env flags).

- [ ] **Step 6: Commit**

```bash
git add src/payload-types.ts "src/app/(payload)/admin/importMap.js" src/migrations
git commit -m "Email: migration for the email settings, form email language and submission locale"
```

---

### Task 11: Contact form emails in the seed and for existing databases

**Files:**
- Create: `src/endpoints/seed/contact-form-emails.ts`
- Modify: `src/endpoints/seed/contact-form.ts` (`emails` becomes `contactFormEmails`)
- Create: `scripts/contact-form-emails.ts`
- Test: `tests/int/email-contact-form.int.spec.ts`

**Interfaces:**
- Consumes: `paragraphs()` from `src/endpoints/seed/lexical.ts`; `Form` type with `language` (Task 10).
- Produces: `contactFormEmails: NonNullable<Form['emails']>`, `TEAM_REPLY_TO`, `applyContactFormEmails(payload: Payload): Promise<{ updated: false } | { updated: true; id: number | string; before: string[] }>`.

- [ ] **Step 1: Write the failing test** `tests/int/email-contact-form.int.spec.ts`

```ts
// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import { contactForm } from '@/endpoints/seed/contact-form'
import { applyContactFormEmails, contactFormEmails } from '@/endpoints/seed/contact-form-emails'

describe('contact form emails', () => {
  it('has one team mail and one confirmation per language', () => {
    expect(contactFormEmails.map((e) => e.language)).toEqual(['all', 'de', 'en'])
    const [team, de, en] = contactFormEmails
    expect(team).toMatchObject({ emailTo: '', emailFrom: '', replyTo: '{{email}}', subject: 'Neue Kontaktanfrage: {{name}}' })
    expect(JSON.stringify(team.message)).toContain('{{*:table}}')
    for (const confirmation of [de, en]) expect(confirmation).toMatchObject({ emailTo: '{{email}}', replyTo: 'hello@indicate-data.io' })
  })

  it('never repeats what the visitor typed in a confirmation', () => {
    for (const confirmation of contactFormEmails.slice(1)) {
      expect(confirmation.subject).not.toMatch(/\{\{/)
      expect(JSON.stringify(confirmation.message)).not.toMatch(/\{\{/)
    }
  })

  it('is what the seed installs', () => {
    expect(contactForm.emails).toBe(contactFormEmails)
  })
})

describe('applyContactFormEmails', () => {
  const fakePayload = (docs: unknown[]) => {
    const find = vi.fn(async () => ({ docs }))
    const update = vi.fn(async () => ({}))
    return { payload: { find, update } as never, find, update }
  }

  it('replaces the email entries of the existing contact form', async () => {
    const { payload, find, update } = fakePayload([{ id: 3, emails: [{ emailTo: 'hello@indicate-data.io', subject: 'Alt' }] }])
    expect(await applyContactFormEmails(payload)).toEqual({ updated: true, id: 3, before: ['Alt → hello@indicate-data.io'] })
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ collection: 'forms', where: { title: { equals: 'Kontaktformular' } } }))
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ collection: 'forms', id: 3, data: { emails: contactFormEmails } }))
  })

  it('does nothing without a contact form', async () => {
    const { payload, update } = fakePayload([])
    expect(await applyContactFormEmails(payload)).toEqual({ updated: false })
    expect(update).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/email-contact-form.int.spec.ts`
Expected: FAIL, cannot resolve `@/endpoints/seed/contact-form-emails`.

- [ ] **Step 3: Implement** `src/endpoints/seed/contact-form-emails.ts`

```ts
import type { Payload } from 'payload'

import type { Form } from '@/payload-types'

import { paragraphs } from './lexical'

type FormEmail = NonNullable<Form['emails']>[number]

export const CONTACT_FORM_TITLE = 'Kontaktformular'
/** Where replies to a confirmation go. */
export const TEAM_REPLY_TO = 'hello@indicate-data.io'

const message = (texts: string[]) => paragraphs(texts) as unknown as FormEmail['message']

/**
 * Team notification (empty "To": the team recipients from Website -> E-Mail; reply goes to the
 * visitor) and one confirmation per language. Confirmations carry nothing the visitor typed.
 */
export const contactFormEmails: FormEmail[] = [
  {
    emailTo: '',
    emailFrom: '',
    replyTo: '{{email}}',
    subject: 'Neue Kontaktanfrage: {{name}}',
    language: 'all',
    message: message(['Neue Anfrage über das Kontaktformular der Website:', '{{*:table}}']),
  },
  {
    emailTo: '{{email}}',
    emailFrom: '',
    replyTo: TEAM_REPLY_TO,
    subject: 'Danke für Ihre Nachricht',
    language: 'de',
    message: message([
      'Guten Tag,',
      'vielen Dank für Ihre Nachricht an Indicate Data. Wir haben sie erhalten und melden uns innerhalb eines Werktags.',
      'Möchten Sie noch etwas ergänzen? Antworten Sie einfach auf diese E-Mail.',
      'Viele Grüße',
      'Ihr Team von Indicate Data',
    ]),
  },
  {
    emailTo: '{{email}}',
    emailFrom: '',
    replyTo: TEAM_REPLY_TO,
    subject: 'Thank you for your message',
    language: 'en',
    message: message([
      'Hello,',
      'thank you for your message to Indicate Data. We have received it and will get back to you within one business day.',
      'Would you like to add anything? Simply reply to this email.',
      'Best regards',
      'The Indicate Data team',
    ]),
  },
]

/** Sets the seed's email entries on the existing contact form (found by title). Safe to run again. */
export const applyContactFormEmails = async (
  payload: Payload,
): Promise<{ updated: false } | { updated: true; id: number | string; before: string[] }> => {
  const { docs } = await payload.find({
    collection: 'forms',
    where: { title: { equals: CONTACT_FORM_TITLE } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const form = docs[0] as { id: number | string; emails?: { emailTo?: string | null; subject?: string | null }[] | null } | undefined
  if (!form) return { updated: false }
  const before = (form.emails || []).map((e) => `${e.subject ?? ''} → ${e.emailTo || '(team)'}`)
  await payload.update({ collection: 'forms', id: form.id, data: { emails: contactFormEmails }, overrideAccess: true })
  return { updated: true, id: form.id, before }
}
```

In `src/endpoints/seed/contact-form.ts`: add `import { CONTACT_FORM_TITLE, contactFormEmails } from './contact-form-emails'`, set `title: CONTACT_FORM_TITLE,`, and replace the whole `emails: [ … ],` array with `emails: contactFormEmails,`.

`scripts/contact-form-emails.ts`:

```ts
/**
 * Sets the email entries of the existing contact form to the ones the seed installs:
 *   NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload \
 *     ./node_modules/.bin/payload run scripts/contact-form-emails.ts
 * Safe to run again: it replaces the form's `emails` list (manual edits to that list are lost).
 */
import { getPayload } from 'payload'
import config from '@payload-config'

import { applyContactFormEmails, contactFormEmails } from '../src/endpoints/seed/contact-form-emails'

const payload = await getPayload({ config })
try {
  const result = await applyContactFormEmails(payload)
  if (!result.updated) {
    payload.logger.warn('[contact-form-emails] no contact form found; run the seed first')
  } else {
    payload.logger.info(`[contact-form-emails] form ${result.id} before: ${result.before.join(' | ') || '(none)'}`)
    payload.logger.info(`[contact-form-emails] form ${result.id} now: ${contactFormEmails.map((e) => `${e.subject} (${e.language})`).join(' | ')}`)
  }
  process.exit(0)
} catch (error) {
  payload.logger.error({ err: error, msg: '[contact-form-emails] failed' })
  process.exit(1)
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/email-contact-form.int.spec.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Apply it to the scratch DB**

Run: `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/lettermint_dev ./node_modules/.bin/payload run scripts/contact-form-emails.ts`
Expected: log lines "before: Neue Kontaktanfrage über die Website → hello@indicate-data.io" and "now: Neue Kontaktanfrage: {{name}} (all) | Danke für Ihre Nachricht (de) | Thank you for your message (en)". If it fails with a missing `language` column, start the worktree dev server once (Task 12 Step 2) so push creates it, then re-run.

- [ ] **Step 6: Type-check and commit**

```bash
pnpm exec tsc --noEmit
git add src/endpoints/seed/contact-form-emails.ts src/endpoints/seed/contact-form.ts scripts/contact-form-emails.ts tests/int/email-contact-form.int.spec.ts
git commit -m "Contact form: team notification plus confirmations in German and English"
```

---

### Task 12: Verification in the running app

**Files:** none changed unless a check fails (then fix in the owning task's files and commit there).

- [ ] **Step 1: Full checks**

```bash
pnpm test:int
pnpm lint
pnpm exec tsc --noEmit
```
Expected: all pass.

- [ ] **Step 2: Start the worktree dev server on the scratch DB without a token**

Run (background): `PORT=3001 SITE_URL=http://localhost:3001 DATABASE_URL=postgres://payload:payload@localhost:5433/lettermint_dev MEDIA_DIR=/Users/stan/Workspace/GitHub/indicateio/indicate-data.com.demo/public/media LETTERMINT_API_TOKEN= pnpm dev`
Expected: server on http://localhost:3001; schema push adds the new table and columns to `lettermint_dev` without prompting.

- [ ] **Step 3: Admin page without a token** (browser tools, logged in as the user's dev account)

Open `http://localhost:3001/admin/globals/email-settings`.
Expected: under Website → E-Mail; the status panel says "Kein Token: LETTERMINT_API_TOKEN ist nicht gesetzt …"; both buttons disabled; sender `noreply@indicate-data.io` / `Indicate Data`, team `hello@indicate-data.io`. Save once (creates the global row).

- [ ] **Step 4: Contact form without a token**

Submit the contact form on `/de/contact` and on `/en/contact`.
Expected server log per submission: two `[lettermint] not sent:` lines. German page: `hello@indicate-data.io` + visitor address with subject "Danke für Ihre Nachricht". English page: team + "Thank you for your message". The submissions in the admin show "Sprache" de / en and no `_hp` row.

- [ ] **Step 5: Honeypot**

Read the contact form's id from its admin URL (Forms → Kontaktformular, `/admin/collections/forms/<id>`), then in the browser console on `/de/contact`, with `FORM_ID` replaced by it: `fetch('/api/form-submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({form:FORM_ID,locale:'de',submissionData:[{field:'name',value:'x'},{field:'email',value:'x@example.org'},{field:'message',value:'x'},{field:'_hp',value:'spam'}]})}).then(r=>r.status)`
Expected: `400`, and no new submission in the admin.

- [ ] **Step 6: Real delivery (needs the user)**

Ask the user to add their Lettermint project token to the worktree `.env` (`LETTERMINT_API_TOKEN=lm_…`), confirm `indicate-data.io` is verified in Lettermint, then restart the dev server from Step 2 without the `LETTERMINT_API_TOKEN=` override.
Then:
- Admin panel shows "Token gesetzt über LETTERMINT_API_TOKEN (…xxxx)"; "Token prüfen" shows "Lettermint akzeptiert den Token."
- "Testmail an <user> senden" shows "Gesendet an … (ID …)", and the user confirms receipt.
- A German contact submission with the user's own address as visitor email: the team inbox gets "Neue Kontaktanfrage: <name>" with the field table and Reply-To = visitor; the visitor address gets "Danke für Ihre Nachricht". Repeat on `/en/contact`: "Thank you for your message".
- `/admin/forgot` with the user's address: a German (or English, per admin language) reset mail whose link opens `http://localhost:3001/admin/reset/…`.

- [ ] **Step 7: Production build sanity**

Stop the dev server, then run: `BUILD_WITHOUT_DB=true pnpm build`
Expected: build succeeds (the admin import map and `EmailStatusField` compile).

- [ ] **Step 8: Clean up and hand over**

Stop the dev server; drop the scratch DB: `docker exec indicate-datacomdemo-postgres-1 dropdb -U payload lettermint_dev`. Then use superpowers:finishing-a-development-branch. Tell the user: the shared dev DB picks up the schema through push after merge; run `scripts/contact-form-emails.ts` against it (and once in production, or edit the form in the admin); production needs `LETTERMINT_API_TOKEN` in Infisical and the Ansible role in `../indicate-infra` (not done here).
