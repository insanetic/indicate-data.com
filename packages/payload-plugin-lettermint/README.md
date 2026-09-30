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
