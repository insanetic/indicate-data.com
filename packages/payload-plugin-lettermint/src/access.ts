/**
 * True only for a user of the admin collection. API-key users of other auth collections (for
 * example plugin-mcp's `payload-mcp-api-keys`) also set `req.user`, so `Boolean(req.user)` is not enough.
 */
export const isAdminUser = (req: {
  user?: { collection?: unknown } | null
  payload?: { config?: { admin?: { user?: unknown } } }
}): boolean => {
  const adminCollection = req.payload?.config?.admin?.user
  return typeof adminCollection === 'string' && req.user?.collection === adminCollection
}
