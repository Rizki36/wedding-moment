import { AwsClient } from 'aws4fetch'

// `@aws-sdk/client-s3` is unusable under Cloudflare's `workerd` runtime (the
// runtime for `pnpm dev`, `pnpm run preview`, and the real Workers deploy
// target): its `S3Client` constructor unconditionally calls a Node-only
// version-check helper that gets resolved to a non-callable `Symbol` stub
// under Vite/`@cloudflare/vite-plugin`'s `browser` package-export condition,
// crashing with `TypeError: emitWarningIfUnsupportedVersion$1 is not a
// function` (root-caused in task-9-report.md). `aws4fetch` is a lightweight,
// fetch-based S3-compatible request signer with no Node-only code paths, so
// it works correctly under workerd.
export const r2Client = new AwsClient({
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  service: 's3',
  region: 'auto',
})

export const R2_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!

/**
 * Streams an object directly from R2 via a signed GET request, server-side.
 * Unlike `getPresignedGetUrl` (which hands the *client* a URL to fetch
 * from directly), this performs the signed request itself and returns the
 * raw `Response` — whose `.body` is a `ReadableStream` — so callers (e.g.
 * the bulk ZIP download route) can pipe object bytes straight into another
 * stream (a ZIP writer) without buffering the whole object in memory.
 *
 * `r2Client.fetch` (as opposed to `.sign`, used by `presign.ts`) signs AND
 * performs the HTTP request in one call. Same authorization caveat as the
 * `getPresigned*Url` helpers: this does NOT perform authorization — callers
 * must verify the caller is allowed to read `key` before calling this.
 */
export async function getR2Object(key: string): Promise<Response> {
  return r2Client.fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`, { method: 'GET' })
}
