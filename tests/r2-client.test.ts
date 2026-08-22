// @vitest-environment node
import "dotenv/config";
import { afterAll, describe, expect, it } from "vitest";
import {
  getPresignedGetUrl,
  getPresignedUploadUrl,
} from "../src/server/storage/presign";
import {
  R2_BUCKET_NAME,
  R2_ENDPOINT,
  r2Client,
} from "../src/server/storage/r2-client";

const testKey = "events/test-event/submissions/test-sub/photo.jpg";
const presignTestKey =
  "events/test-event/submissions/test-sub/presigned-photo.jpg";

describe("R2 client", () => {
  it("puts and gets an object directly via the aws4fetch-signed client", async () => {
    const putUrl = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${testKey}`;

    const putRes = await r2Client.fetch(putUrl, {
      method: "PUT",
      body: Buffer.from("test-content"),
      headers: { "Content-Type": "image/jpeg" },
    });
    expect(putRes.ok).toBe(true);

    const getRes = await r2Client.fetch(putUrl, { method: "GET" });
    expect(getRes.ok).toBe(true);
    const body = await getRes.text();
    expect(body).toBe("test-content");
  });

  afterAll(async () => {
    const putUrl = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${testKey}`;
    await r2Client.fetch(putUrl, { method: "DELETE" });
  });
});

describe("presigned URLs", () => {
  it("generates a presigned PUT URL that plain fetch() can use to upload, then a presigned GET URL to read it back", async () => {
    const uploadUrl = await getPresignedUploadUrl(presignTestKey, "image/png");
    expect(uploadUrl).toMatch(/^https:\/\//);
    expect(uploadUrl).toContain("X-Amz-Signature");

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      body: Buffer.from("presigned-test-content"),
      headers: { "Content-Type": "image/png" },
    });
    expect(putRes.ok).toBe(true);

    const getUrl = await getPresignedGetUrl(presignTestKey);
    expect(getUrl).toMatch(/^https:\/\//);
    expect(getUrl).toContain("X-Amz-Signature");

    const getRes = await fetch(getUrl);
    expect(getRes.ok).toBe(true);
    const body = await getRes.text();
    expect(body).toBe("presigned-test-content");
  });

  afterAll(async () => {
    const deleteUrl = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${presignTestKey}`;
    await r2Client.fetch(deleteUrl, { method: "DELETE" });
  });
});
