import { R2_BUCKET_NAME, R2_ENDPOINT, r2Client } from "./r2-client";

/**
 * Returns a short-lived (5 minute) presigned URL the client can PUT the
 * object bytes to directly, so file bytes never transit our server.
 *
 * This helper does NOT perform authorization — callers (the
 * `/api/uploads/presign` route handler) must verify the caller is allowed to
 * write to `key` before calling this.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
): Promise<string> {
  const url = new URL(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`);
  url.searchParams.set("X-Amz-Expires", "300");

  const signed = await r2Client.sign(
    new Request(url, {
      method: "PUT",
      headers: { "Content-Type": contentType },
    }),
    { aws: { signQuery: true } },
  );

  return signed.url;
}

/**
 * Returns a presigned URL the client can GET the object bytes from
 * directly, valid for 1 hour. Used both for guest-facing frame images
 * (generated once at page load, then reused throughout the whole capture
 * flow — see src/routes/e/$eventSlug/index.tsx) and for pengantin/admin
 * dashboard submission media, so the expiry needs to comfortably outlive a
 * slow guest session, not just a single fetch.
 *
 * Same authorization caveat as `getPresignedUploadUrl`: this helper does NOT
 * perform authorization — callers must verify the caller is allowed to read
 * `key` before calling this.
 */
export async function getPresignedGetUrl(key: string): Promise<string> {
  const url = new URL(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`);
  url.searchParams.set("X-Amz-Expires", "3600");

  const signed = await r2Client.sign(new Request(url, { method: "GET" }), {
    aws: { signQuery: true },
  });

  return signed.url;
}
