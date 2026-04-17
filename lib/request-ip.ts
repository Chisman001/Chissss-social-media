import { headers } from "next/headers"

/** Best-effort client IP for rate limiting (trust proxy headers from your edge). */
export async function getRateLimitIpKey(): Promise<string> {
  const h = await headers()
  const xff = h.get("x-forwarded-for")
  if (xff) {
    const first = xff.split(",")[0]?.trim()
    if (first) return first
  }
  const realIp = h.get("x-real-ip")?.trim()
  if (realIp) return realIp
  return "unknown"
}
