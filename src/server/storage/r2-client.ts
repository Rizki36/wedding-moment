import { S3Client } from '@aws-sdk/client-s3'

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  // Cloudflare Workers' workerd runtime (used by pnpm dev/preview and the real
  // deploy target per wrangler.jsonc) does not fully satisfy the Node-compat
  // capability checks the AWS SDK v3 "flexible checksums" middleware performs
  // (a `process.version` check inside `emitWarningIfUnsupportedVersion`, which
  // resolves to `undefined` under workerd and throws at S3Client construction
  // time). Disabling automatic checksum calculation/validation skips that
  // middleware entirely. See task-9-report.md for the full investigation.
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
})

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!
