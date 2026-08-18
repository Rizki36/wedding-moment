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
