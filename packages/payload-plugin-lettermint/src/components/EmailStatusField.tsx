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
        <p style={success} role="status">
          {t(`Gesendet an ${result.to}`, `Sent to ${result.to}`)}
          {result.messageId ? ` (ID ${result.messageId})` : ''}
        </p>
      )}
      {result?.ok === false && (
        <div style={failure} role="alert">
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
