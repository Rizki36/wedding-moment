import { AwsClient } from "aws4fetch";

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
  service: "s3",
  region: "auto",
});

export const R2_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

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
  return r2Client.fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`, {
    method: "GET",
  });
}

/**
 * Lists every object key under `prefix` via R2's S3-compatible
 * ListObjectsV2 API (`GET {bucket}?list-type=2&prefix=...`), signed via
 * `r2Client.fetch`. There is no `@aws-sdk/client-s3` available here (see
 * the module-level comment), and adding a full XML-parsing dependency for
 * this single call site isn't worth it: the response body is parsed with a
 * simple `<Key>...</Key>` regex instead. This is safe specifically because
 * every key under our prefixes is our own convention (`events/{eventId}/...`,
 * see `keys.ts`) and never derived from unescaped user input, so there's no
 * XML-injection concern to guard against. Pagination is handled via the
 * `IsTruncated` / `NextContinuationToken` fields, also regex-extracted.
 */
export async function listR2ObjectsByPrefix(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const url = new URL(`${R2_ENDPOINT}/${R2_BUCKET_NAME}`);
    url.searchParams.set("list-type", "2");
    url.searchParams.set("prefix", prefix);
    if (continuationToken) {
      url.searchParams.set("continuation-token", continuationToken);
    }

    const res = await r2Client.fetch(url, { method: "GET" });
    if (!res.ok) {
      throw new Error(
        `listR2ObjectsByPrefix failed: ${res.status} ${await res.text()}`,
      );
    }
    const body = await res.text();

    for (const match of body.matchAll(/<Key>([^<]*)<\/Key>/g)) {
      keys.push(match[1]);
    }

    const isTruncated = /<IsTruncated>true<\/IsTruncated>/.test(body);
    const tokenMatch = body.match(
      /<NextContinuationToken>([^<]*)<\/NextContinuationToken>/,
    );
    continuationToken = isTruncated && tokenMatch ? tokenMatch[1] : undefined;
  } while (continuationToken);

  return keys;
}

/**
 * Deletes a single object from R2 via a signed DELETE request.
 *
 * R2's S3-compatible API supports a bulk multi-delete endpoint (POST
 * `{bucket}?delete` with a hand-built XML request body), but without an XML
 * builder dependency already in the project, hand-rolling that request body
 * is more risk than it's worth for MVP-scale purges (dozens to low hundreds
 * of objects per wedding event). `purgeEvent` (in `functions/purge.ts`)
 * instead calls this once per key, batched with limited concurrency. This
 * is the documented tradeoff: more HTTP round-trips than a true bulk
 * delete, acceptable at this scale.
 */
export async function deleteR2Object(key: string): Promise<void> {
  const res = await r2Client.fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(
      `deleteR2Object failed for ${key}: ${res.status} ${await res.text()}`,
    );
  }
}
