/** Public base URL for object storage (no trailing slash), e.g. R2 public bucket or CDN origin. */
export function publicMediaUrl(storageKey: string | null | undefined): string | null {
  if (!storageKey) return null
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL
  if (!base) return null
  return `${base.replace(/\/$/, "")}/${storageKey}`
}
