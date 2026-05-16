interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const DEFAULTS = {
  windowMs: 60 * 1000,
  max: 10,
}

export function rateLimit(key: string, options?: { windowMs?: number; max?: number }): { allowed: boolean; remaining: number; resetAt: number } {
  const windowMs = options?.windowMs ?? DEFAULTS.windowMs
  const max = options?.max ?? DEFAULTS.max
  const now = Date.now()

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs }
  }

  entry.count += 1

  if (entry.count > max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt }
}

export function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}

setInterval(cleanupExpiredEntries, 5 * 60 * 1000)
