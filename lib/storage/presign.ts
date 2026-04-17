import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { nanoid } from "nanoid"

import { UPLOAD_ALLOWED_MIME_SET, UPLOAD_MAX_BYTES } from "@/lib/storage/media-upload-policy"
import { getUploadS3Client } from "@/lib/storage/s3-upload-client"

export function isUploadConfigured(): boolean {
  return getUploadS3Client() !== null
}

export async function createPresignedPut(input: {
  userId: string
  contentType: string
  byteSize: number
}): Promise<{ uploadUrl: string; storageKey: string; expiresInSeconds: number }> {
  if (input.byteSize > UPLOAD_MAX_BYTES) throw new Error("File is too large (max 5 MB).")
  if (!UPLOAD_ALLOWED_MIME_SET.has(input.contentType)) throw new Error("Use JPEG, PNG, WebP, or GIF.")

  const cfg = getUploadS3Client()
  if (!cfg) throw new Error("Uploads are not configured on this server.")

  const storageKey = `${input.userId}/${nanoid()}-${Date.now()}`
  const command = new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: storageKey,
    ContentType: input.contentType,
    ContentLength: input.byteSize,
  })
  const expiresInSeconds = 120
  const uploadUrl = await getSignedUrl(cfg.client, command, { expiresIn: expiresInSeconds })
  return { uploadUrl, storageKey, expiresInSeconds }
}
