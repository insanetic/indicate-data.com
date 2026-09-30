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
