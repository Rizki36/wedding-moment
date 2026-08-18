import { r2Client, R2_ENDPOINT, R2_BUCKET_NAME } from './r2-client'

/**
 * Returns a short-lived (5 minute) presigned URL the client can PUT the
 * object bytes to directly, so file bytes never transit our server.
 *
 * This helper does NOT perform authorization — callers (the
 * `/api/uploads/presign` route handler) must verify the caller is allowed to
 * write to `key` before calling this.
 */
export async function getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
  const url = new URL(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`)
  url.searchParams.set('X-Amz-Expires', '300')

  const signed = await r2Client.sign(
    new Request(url, { method: 'PUT', headers: { 'Content-Type': contentType } }),
    { aws: { signQuery: true } },
  )

  return signed.url
}

/**
 * Returns a short-lived (5 minute) presigned URL the client can GET the
 * object bytes from directly.
 *
 * Same authorization caveat as `getPresignedUploadUrl`: this helper does NOT
 * perform authorization — callers must verify the caller is allowed to read
 * `key` before calling this.
 */
export async function getPresignedGetUrl(key: string): Promise<string> {
  const url = new URL(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`)
  url.searchParams.set('X-Amz-Expires', '300')

  const signed = await r2Client.sign(new Request(url, { method: 'GET' }), {
    aws: { signQuery: true },
  })

  return signed.url
}
