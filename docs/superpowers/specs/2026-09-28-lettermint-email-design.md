# Email through Lettermint — design

Date: 2026-09-28
Status: approved 2026-09-28; plan `docs/superpowers/plans/2026-09-28-lettermint-email.md`

## Goal

The site sends real email through [Lettermint](https://lettermint.co): a notification to the team
for every form submission, a confirmation to the visitor who filled in the form, and Payload's
password reset for admin users. The Lettermint token is configured on the server only and is never
stored in the database or shown in full anywhere. Everything that is not secret (sender, default
team recipient, route) is editable in the admin, next to a token status and a test-mail button.

## Decisions (from the conversation)

- Provider: Lettermint, sending API `POST https://api.lettermint.co/v1/send`, project token in the
  `x-lettermint-token` header.
- **Token from env/config only, never in the database** (for now). `LETTERMINT_API_TOKEN`, locally
  from `.env`, in production from Infisical via the env or a mounted `/app/config/*.env`. The admin
  shows only whether it is set and its last four characters.
- Non-secret settings live in an admin global "E-Mail": sender address and name, default team
  recipient, Lettermint route.
- v1 covers: team notification per form, confirmation to the submitter, password reset, test mail
  from the settings page.
- Approach A: our own workspace package `@subneo/payload-lettermint` with a `fetch`-based adapter.
  Not the community adapter `@abinnovision/payloadcms-email-lettermint`: it validates token and
  sender at config build (startup fails without a token, sender not editable at runtime) and pulls
  in the vendor SDK.
- Confirmation mails go out in the visitor's page language (de/en), chosen per form email entry.
- Abuse guard is in v1: a honeypot field and at most 3 mails per visitor-supplied address per hour.

## Current state

- `@payloadcms/plugin-form-builder` is configured (`src/plugins/index.ts`). Every form has an
  `emails` array (`emailTo`, `cc`, `bcc`, `replyTo`, `emailFrom`, `subject`, `message` with
  `{{field}}` placeholders). On create of a submission its `afterChange` hook formats them and calls
  `payload.sendEmail`, catching and logging errors, so a failed mail never loses a submission.
  Placeholder values are HTML-escaped by the plugin.
- No `email` adapter is configured, so Payload falls back to its console adapter: nothing is sent,
  neither form mails nor the password reset (`/admin/forgot`).
- The contact form seed (`src/endpoints/seed/contact-form.ts`) already has one notification entry
  to `hello@indicate-data.io`. The seed creates the form only when it is missing.
- Forms and form submissions are not localised (`unlocalizedCollections`), and a submission does
  not record the page language. The form block (`src/blocks/Form/Component.tsx`) posts
  `{ form, submissionData }` to `/api/form-submissions`.
- No spam protection on forms: no honeypot, no rate limit.
- Workspace packages are wired by tsconfig path alias only (no workspace dependency), with entry
  points `.` and `./admin` (see `@subneo/payload-testimonials`).

## Architecture

```
packages/payload-plugin-lettermint/          @subneo/payload-lettermint (MIT)
  src/index.ts        lettermintPlugin, lettermintAdapter, getEmailSettings, LettermintError, types
  src/plugin.ts       sets config.email, adds the global and the endpoints
  src/adapter.ts      Payload EmailAdapter: resolves token + settings per send, console fallback
  src/message.ts      Payload SendEmailOptions (nodemailer shape) -> Lettermint request body
  src/client.ts       send() and ping() over fetch, timeout, LettermintError
  src/global.ts       'email-settings' global factory
  src/endpoints.ts    GET /api/lettermint/status, POST /api/lettermint/test
  src/token.ts        readToken(env name), tokenHint()
  src/labels.ts       de/en label helper
  src/admin.ts        'use client': EmailStatusField (token status + test button)
  src/components/EmailStatusField.tsx
```

The site wires it with tsconfig aliases `@subneo/payload-lettermint` and
`@subneo/payload-lettermint/admin`. Site-specific email behaviour stays in `src/email/`:

```
src/email/
  formEmails.ts       form-builder beforeEmail: default recipient, language filter, cap
  honeypot.ts         form-submissions beforeValidate hook
  confirmationCap.ts  in-memory per-address limiter
  passwordReset.ts    generateEmailSubject / generateEmailHTML for Users
```

### Package: adapter

`lettermintPlugin(options)` sets `config.email = lettermintAdapter(...)`, so every
`payload.sendEmail` goes through it: form builder, forgot password, the test endpoint.

```ts
lettermintPlugin({
  defaultFrom: { address: 'noreply@indicate-data.io', name: 'Indicate Data' },
  defaultNotifyTo: 'hello@indicate-data.io',
  env: { apiToken: 'LETTERMINT_API_TOKEN' }, // default
  globalSlug: 'email-settings',              // default
  baseUrl: 'https://api.lettermint.co/v1',   // default
  timeoutMs: 10_000,                         // default
})
```

Payload reads `defaultFromAddress` / `defaultFromName` from the adapter synchronously, so those are
the static `defaultFrom` values. At send time the adapter:

1. Reads the token from `process.env[env.apiToken]` (per send, so a restarted container with a new
   env applies; nothing fails at startup).
2. Reads the global with `payload.findGlobal({ slug, depth: 0, overrideAccess: true })`.
3. Resolves the sender: if the message has no `from`, or its `from` is exactly Payload's default
   (`"<defaultFrom.name>" <<defaultFrom.address>>`, which forgot-password uses), it uses the
   global's sender. An explicit `from` set on a form entry is kept.
4. Maps the message (below), adds `route` from the global when set, and posts it.
5. Without a token: logs `to` and `subject` at info level, warns once per process that
   `LETTERMINT_API_TOKEN` is not set, and returns without sending. Local dev and form submissions
   keep working with no token.

### Package: message mapping

Payload only ever hands the adapter simple messages. Mapping:

- `from`: string or `{ name, address }` -> one string (`"Name" <addr>`).
- `to`, `cc`, `bcc`, `replyTo` -> `to`, `cc`, `bcc`, `reply_to` as string arrays. Accepts a string,
  `{ name, address }`, or arrays of either. A comma-separated string is split on separating commas
  only (a quoted display name may contain a comma). Empty values are omitted.
- `subject` -> `subject`; `html` / `text` as strings. A body shorter than 3 characters is omitted
  (Lettermint rejects it).
- `attachments` and any other nodemailer-only option: dropped, reported once per send via
  `payload.logger.warn`. Nothing in the site sends attachments.

### Package: client

- `send(body, { token, baseUrl, timeoutMs })`: `POST /send`, `Content-Type: application/json`,
  `x-lettermint-token`, `AbortSignal.timeout(timeoutMs)`. Success is `202` with
  `{ message_id, status }`.
- `ping(token)`: `GET /ping`, used by the status endpoint only when asked (`?check=1`).
- Any non-2xx or network/timeout failure throws `LettermintError` with `status` (0 for network),
  Lettermint's `message`, and for `422` the per-field `errors`. The token never appears in the
  error, its message or a log line. No retries.

### Package: global `email-settings` ("E-Mail")

| Field | Type | Notes |
| --- | --- | --- |
| `fromAddress` | email, required | Default `defaultFrom.address`. Must be on a domain verified in Lettermint. |
| `fromName` | text, required | Default `defaultFrom.name`. |
| `notifyTo` | text, required | Default `defaultNotifyTo`. Comma-separated addresses, each validated. Used by form entries with an empty "To". |
| `route` | text | Lettermint route slug; empty = the project's default route. Should be a transactional route. |
| `status` | ui | `EmailStatusField`: token status, hint, test button. |

Access: read and update for admin users only (`req.user.collection === config.admin.user`; MCP and other API-key users are refused). Not added to the MCP plugin. Labels de/en like
the other packages. `getEmailSettings(payload)` returns the resolved settings (global values with
plugin defaults filled in) for site code.

### Package: endpoints and admin field

- `GET /api/lettermint/status` (admin user, else 401) returns
  `{ token: { configured, envName, hint }, sender, notifyTo, route }`. `hint` is `…` plus the last
  four characters, and only when the token is at least 12 characters long; otherwise `null`. With
  `?check=1` it also pings Lettermint and adds `token.valid: true | false`.
- `POST /api/lettermint/test` (admin user, else 401) sends a short test mail to `req.user.email`
  only, using the saved settings. Returns `{ ok: true, messageId }` or `{ ok: false, status,
  message, errors }` with Lettermint's text. No arbitrary recipient, so it cannot be used as a relay.
- `EmailStatusField` shows "Token: configured via LETTERMINT_API_TOKEN (…ab12)" or "missing — mail
  is only logged", a "Check token" link (`?check=1`), and "Send test mail to <me>". It notes that
  the test uses saved settings, so unsaved edits need saving first.

## Site integration

### Form builder options (`src/plugins/index.ts`)

- `formOverrides`: the `emails` array gets a `language` select, label "Sprache", options
  `all` (default) / `de` / `en`. Additive.
- `formSubmissionOverrides`: a `locale` select (`de` / `en`, default `de`, read-only, sidebar) so
  the admin shows each submission's language; and the honeypot hook (below).
- `beforeEmail` (`src/email/formEmails.ts`): re-reads the form (`findByID`, depth 0) and walks its
  `emails` in the same order as the formatted mails:
  - drops entries whose `language` is neither `all` nor the submission's `locale`;
  - fills `to` from `notifyTo` for entries whose `emailTo` was empty;
  - applies the confirmation cap to entries whose `emailTo` contains a `{{placeholder}}` (a
    visitor-supplied address).

### Form block (`src/blocks/Form/Component.tsx`)

- Sends `locale` (the current page language) with `{ form, submissionData }`.
- Renders a honeypot input `_hp`: visually hidden, `tabIndex={-1}`, `autoComplete="off"`,
  `aria-hidden`, submitted as a `submissionData` entry.

### Abuse guard

- Honeypot (`src/email/honeypot.ts`, `beforeValidate` on form-submissions): a non-empty `_hp`
  fails the request with a generic 400 and nothing is saved or sent; an empty `_hp` entry is removed
  before save, so it never shows in the admin or in `{{*}}`.
- Confirmation cap (`src/email/confirmationCap.ts`): at most 3 mails per visitor-supplied address
  (lower-cased) per rolling hour, in memory per process. Over the cap the mail is dropped with a
  warning that names only the address's domain. The submission and the team notification are
  unaffected. The counter resets on restart; production runs a single container, so that is enough
  for v1.

### Contact form content

The seed's `emails` become three entries:

1. **Team notification** (`language: all`): `emailTo` empty (-> `notifyTo`), `emailFrom` empty
   (-> global sender), `replyTo: {{email}}`, subject `Neue Kontaktanfrage: {{name}}`, body a short
   line plus every field via `{{*:table}}` in its own paragraph. The serializer escapes the node
   text before substituting, and the table helper escapes each key and value, so the table arrives
   as HTML with visitor input escaped.
2. **Confirmation de** (`language: de`) to `{{email}}`, `replyTo: hello@indicate-data.io`, subject
   `Danke für Ihre Nachricht`, fixed text.
3. **Confirmation en** (`language: en`) to `{{email}}`, `replyTo: hello@indicate-data.io`, subject
   `Thank you for your message`, fixed text.

Confirmation texts contain nothing the visitor typed, not even the name, so the form cannot carry
someone else's text to a third-party inbox.

The seed only creates missing forms, so `scripts/contact-form-emails.ts` sets the three entries
on the existing contact form (found by title), printing before and after. Idempotent: it replaces
the `emails` array. Dev: run on the host with `NODE_ENV=production DATABASE_URL=… payload run`.
Production: run once in the container, edit in the admin, or it arrives with the next content
import.

### Password reset (`src/email/passwordReset.ts`)

`Users.auth.forgotPassword.generateEmailSubject` / `generateEmailHTML`:

- Language from `req.i18n.language` (`de` or `en`, falling back to `de`).
- Subject `Passwort zurücksetzen – Indicate Data` / `Reset your password – Indicate Data`.
- Simple inline-styled HTML: greeting, one sentence, a button and the plain link, validity note
  ("valid for one hour": Payload's default `forgotPassword.expiration` of 3 600 000 ms, which the
  Users collection keeps), "ignore this mail if it was not you".
- Link: `${getServerSideURL()}${adminRoute}${resetRoute}/${token}`, i.e. `SITE_URL`, the same origin
  source as the rest of the site.
- Sender: Payload passes its default `from`, which the adapter replaces with the global's sender.
- If Lettermint rejects the mail, the error propagates and the forgot-password request fails
  visibly rather than claiming success.

### Env and deploy

- `LETTERMINT_API_TOKEN` added to `src/environment.d.ts`, the app config template
  `deploy/app.env.example` and the env table in `deploy/README.md`.
- `.env.example` is not readable from this session; the user adds the line there.
- Production secret in Infisical and the Ansible role in `../indicate-infra`: follow-up, done by
  the user or on request.
- Prerequisite for real delivery: the sender domain (`indicate-data.io`) verified in the
  Lettermint project, and a transactional route.

## Data and migrations

Additive schema changes: the `email_settings` global table, `forms_emails.language` (enum),
`form_submissions.locale` (enum). Dev picks them up through push. Production gets one migration
via `make migration NAME=lettermint_email`.

Ordering constraint: until production has run `20260925_163800_convert_sections`, every new schema
migration must sort before it (rename its timestamp and move it in `src/migrations/index.ts`),
because the conversion reads pages through the current config and pages reference forms. Check the
production state at implementation time.

## Error handling

| Situation | Behaviour |
| --- | --- |
| No token | Adapter logs to/subject, warns once, sends nothing. Status shows "missing". |
| Lettermint 4xx/5xx, timeout, network | `LettermintError` with status, message, field errors. |
| … during a form submission | Form builder logs it; submission is saved; other entries still send. |
| … during password reset | Error propagates; the request fails visibly. |
| … from the test button | Shown in the admin with Lettermint's text (e.g. unverified domain). |
| Honeypot filled | Generic 400, nothing saved or sent. |
| Confirmation cap reached | That mail is dropped with a warning; everything else proceeds. |

## Security notes

- The token exists only in the process environment. It is never written to the database, returned
  by an API (only a 4-character hint, and only for tokens of 12+ characters), logged, or included
  in an error.
- Both endpoints require an admin user (not an MCP or other API key); the test mail goes only to that user's own address.
- The global is readable only by admin users and is not exposed through MCP.
- Placeholder values in form mails are HTML-escaped by the form builder; the JSON API leaves no
  room for header injection.
- Confirmation mails carry no visitor-supplied text; honeypot and cap limit abuse of the
  visitor-supplied recipient.

## Testing

Vitest int specs under `tests/int/`, like the existing package specs:

- `lettermint-message`: address shapes, comma splitting with quoted names, empty values, short
  bodies, dropped options reported.
- `lettermint-client`: mocked `fetch` for 202, 422 with field errors, 500, timeout; the token never
  appears in errors.
- `lettermint-adapter`: no token -> no `fetch`, one warning; sender fallback for missing `from` and
  for Payload's default `from`; explicit `from` kept; `route` added.
- `lettermint-endpoints`: 401 without a user; the hint never contains more than the last 4
  characters; the test mail goes to `req.user.email`.
- `email-form`: `beforeEmail` language filter, default recipient, cap (4th mail in an hour dropped),
  honeypot reject and strip.
- `email-password-reset`: subject and link in de and en.

Real check, once a token is in the local `.env`: the test mail from the admin, a real contact-form
submission in de and en (team mail plus the matching confirmation), and a password reset against
the dev container.

## Out of scope

- Storing the token in the database (encrypted or otherwise).
- A send log or delivery status in the CMS (the Lettermint dashboard has it).
- Retries, queueing through Payload jobs, batch sending, attachments.
- Localising the forms collection.
- Moving the Subneo API key off its plain-text field.
- Infisical and Ansible changes in `../indicate-infra`.
