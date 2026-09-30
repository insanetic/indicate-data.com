/** The token from the environment, trimmed; `undefined` when unset or blank. Read per call, never cached. */
export const readToken = (envName: string): string | undefined => {
  const value = process.env[envName]?.trim()
  return value ? value : undefined
}

/** `…` plus the last four characters for tokens of 12+ characters; shorter ones get no hint at all. */
export const tokenHint = (token: string | undefined): string | null =>
  token && token.length >= 12 ? `…${token.slice(-4)}` : null
