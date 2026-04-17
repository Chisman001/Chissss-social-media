const DEFAULT_CALLBACK = "/feed"

function isSafeExactPath(path: string, base: string): boolean {
  return path === base || path.startsWith(`${base}?`) || path.startsWith(`${base}#`)
}

/**
 * Returns a same-origin relative path safe for `router.push` / `signIn` callback.
 * Rejects external URLs, protocol-relative URLs, and paths outside the app allowlist.
 */
export function getSafeCallbackUrl(raw: string | null | undefined): string {
  if (raw == null || typeof raw !== "string") return DEFAULT_CALLBACK

  let path = raw.trim()
  try {
    path = decodeURIComponent(path.replace(/\+/g, " "))
  } catch {
    return DEFAULT_CALLBACK
  }

  if (!path.startsWith("/") || path.startsWith("//")) return DEFAULT_CALLBACK
  if (path.includes("\\") || /[\u0000-\u001f\u007f]/.test(path)) return DEFAULT_CALLBACK
  if (path.includes("://")) return DEFAULT_CALLBACK
  const colon = path.indexOf(":")
  const firstQ = path.indexOf("?")
  const firstH = path.indexOf("#")
  if (colon !== -1) {
    const beforeMeta = Math.min(
      firstQ === -1 ? path.length : firstQ,
      firstH === -1 ? path.length : firstH,
    )
    if (colon < beforeMeta) return DEFAULT_CALLBACK
  }

  if (isSafeExactPath(path, "/feed")) return path
  if (isSafeExactPath(path, "/notifications")) return path
  if (isSafeExactPath(path, "/settings")) return path

  if (path.startsWith("/u/")) {
    const rest = path.slice("/u/".length)
    if (rest.length === 0) return DEFAULT_CALLBACK
    const handle = rest.split(/[?#]/)[0] ?? ""
    if (handle.length === 0) return DEFAULT_CALLBACK
    return path
  }

  if (path.startsWith("/post/")) {
    const rest = path.slice("/post/".length)
    if (rest.length === 0) return DEFAULT_CALLBACK
    const id = rest.split(/[?#]/)[0] ?? ""
    if (id.length === 0) return DEFAULT_CALLBACK
    return path
  }

  return DEFAULT_CALLBACK
}
