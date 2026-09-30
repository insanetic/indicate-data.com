import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({ user: { email: 'me@indicate-data.io' } as { email?: string } }))

vi.mock('@payloadcms/ui', () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  useConfig: () => ({ config: { serverURL: '', routes: { api: '/api' } } }),
  useAuth: () => auth,
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
  auth.user = { email: 'me@indicate-data.io' }
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
  it('checks the token with Lettermint', async () => {
    const fetch = vi.fn((url: string) => respond(status(url.endsWith('?check=1') ? { valid: true } : {})))
    vi.stubGlobal('fetch', fetch)
    const { container } = render(<EmailStatusField />)
    const button = await screen.findByText('Token prüfen')
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(button)
    expect(await screen.findByText('Lettermint akzeptiert den Token.')).toBeTruthy()
    expect(fetch).toHaveBeenCalledWith('/api/lettermint/status?check=1', expect.anything())
    expect(container.textContent).toContain('Token gesetzt über LETTERMINT_API_TOKEN (…ab12)')
  })

  it('keeps the status when the token check fails', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => (url.endsWith('?check=1') ? respond({}, 500) : respond(status()))))
    const { container } = render(<EmailStatusField />)
    const button = await screen.findByText('Token prüfen')
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(button)
    expect(await screen.findByText('Token-Prüfung fehlgeschlagen.')).toBeTruthy()
    expect(container.textContent).toContain('Token gesetzt über LETTERMINT_API_TOKEN (…ab12)')
    expect(container.textContent).not.toContain('Status konnte nicht geladen werden.')
  })

  it('shows field errors that are not a list', async () => {
    const failed = { ok: false, status: 422, message: 'Invalid.', errors: { from: 'Domain not verified' } }
    vi.stubGlobal('fetch', vi.fn((url: string) => (url.endsWith('/test') ? respond(failed, 502) : respond(status()))))
    render(<EmailStatusField />)
    const button = await screen.findByText('Testmail an me@indicate-data.io senden')
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(button)
    expect(await screen.findByText('from: Domain not verified')).toBeTruthy()
  })

  it('shows the HTTP status when the server does not answer with JSON', async () => {
    const notJson = () =>
      Promise.resolve({
        ok: false,
        status: 504,
        json: async () => {
          throw new SyntaxError('Unexpected token <')
        },
      })
    vi.stubGlobal('fetch', vi.fn((url: string) => (url.endsWith('/test') ? notJson() : respond(status()))))
    const { container } = render(<EmailStatusField />)
    const button = await screen.findByText('Testmail an me@indicate-data.io senden')
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(button)
    await waitFor(() => expect(container.textContent).toContain('Server antwortete mit 504.'))
    expect(container.textContent).not.toContain('nicht erreichbar')
  })

  it('labels the test button without an address when the user has none', async () => {
    auth.user = {}
    vi.stubGlobal('fetch', vi.fn(() => respond(status())))
    render(<EmailStatusField />)
    const button = (await screen.findByText('Testmail senden')) as HTMLButtonElement
    expect(button.textContent).toBe('Testmail senden')
    expect(button.disabled).toBe(true)
  })
})
