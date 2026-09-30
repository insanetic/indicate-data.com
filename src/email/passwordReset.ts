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
