import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client, R2_BUCKET_NAME } from './r2-client'

/**
 * Returns a short-lived (5 minute) presigned URL the client can PUT the
 * object bytes to directly, so file bytes never transit our server.
 *
 * This helper does NOT perform authorization — callers (the
 * `/api/uploads/presign` route handler) must verify the caller is allowed to
 * write to `key` before calling this.
 */
export async function getPresignedUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, ContentType: contentType })
  return getSignedUrl(s3Client, command, { expiresIn: 300 })
}
