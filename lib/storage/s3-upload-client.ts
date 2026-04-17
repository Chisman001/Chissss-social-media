import { S3Client } from "@aws-sdk/client-s3"

export function getUploadS3Client():
  | {
      client: S3Client
      bucket: string
    }
  | null {
  const bucket = process.env.S3_BUCKET
  const region = process.env.S3_REGION ?? "auto"
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
  const endpoint = process.env.S3_ENDPOINT
  if (!bucket || !accessKeyId || !secretAccessKey) return null
  return {
    client: new S3Client({
      region,
      endpoint: endpoint || undefined,
      forcePathStyle: Boolean(endpoint),
      credentials: { accessKeyId, secretAccessKey },
    }),
    bucket,
  }
}
