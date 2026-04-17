import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

const redis = url && token ? new Redis({ url, token }) : null

const writeLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "chis_writes",
    })
  : null

const registerLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "chis_reg",
    })
  : null

export async function rateLimitWrites(key: string): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!writeLimiter) return { ok: true }
  const { success } = await writeLimiter.limit(key)
  if (!success) return { ok: false, message: "Too many requests. Please wait a moment." }
  return { ok: true }
}

export async function rateLimitRegister(key: string): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!registerLimiter) return { ok: true }
  const { success } = await registerLimiter.limit(key)
  if (!success) {
    return {
      ok: false,
      message: "Too many registration attempts from this network. Try again later.",
    }
  }
  return { ok: true }
}
