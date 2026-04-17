import { HeadObjectCommand } from "@aws-sdk/client-s3"

import { UPLOAD_ALLOWED_MIME_SET, UPLOAD_MAX_BYTES } from "@/lib/storage/media-upload-policy"
import { getUploadS3Client } from "@/lib/storage/s3-upload-client"

export async function verifyUploadedObject(input: {
  storageKey: string
  expectedByteSize: number
  expectedMime: string
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!UPLOAD_ALLOWED_MIME_SET.has(input.expectedMime))
    return { ok: false, message: "Unsupported file type." }
  if (input.expectedByteSize > UPLOAD_MAX_BYTES || input.expectedByteSize <= 0) {
    return { ok: false, message: "Invalid file size." }
  }

  const cfg = getUploadS3Client()
  if (!cfg) return { ok: false, message: "Upload verification is not configured." }

  try {
    const head = await cfg.client.send(
      new HeadObjectCommand({
        Bucket: cfg.bucket,
        Key: input.storageKey,
      }),
    )
    const len = head.ContentLength
    if (len == null) return { ok: false, message: "Upload is missing or incomplete." }
    if (len !== input.expectedByteSize) {
      return { ok: false, message: "Uploaded file does not match the declared size." }
    }
    const ctype = head.ContentType?.split(";")[0]?.trim().toLowerCase()
    if (!ctype || !UPLOAD_ALLOWED_MIME_SET.has(ctype)) {
      return { ok: false, message: "Uploaded file type is not allowed." }
    }
    if (ctype !== input.expectedMime) {
      return { ok: false, message: "Uploaded file type does not match the declared type." }
    }
    return { ok: true }
  } catch (e: unknown) {
    if (isS3NotFound(e)) {
      return { ok: false, message: "Upload is missing or invalid. Try uploading again." }
    }
    return { ok: false, message: "Could not verify upload." }
  }
}

function isS3NotFound(e: unknown): boolean {
  if (!e || typeof e !== "object") return false
  const o = e as { name?: string; $metadata?: { httpStatusCode?: number } }
  if (o.$metadata?.httpStatusCode === 404) return true
  return o.name === "NotFound" || o.name === "NoSuchKey"
}
