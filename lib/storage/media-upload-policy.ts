export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024

export const UPLOAD_ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const

export const UPLOAD_ALLOWED_MIME_SET = new Set<string>(UPLOAD_ALLOWED_MIME)
