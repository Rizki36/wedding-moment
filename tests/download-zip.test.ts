// @vitest-environment node
import "dotenv/config";
import JSZip from "jszip";
import { afterAll, describe, expect, it } from "vitest";
import { buildSubmissionsZipResponse } from "../src/server/functions/download";
import { createEvent } from "../src/server/functions/events";
import { createSubmission } from "../src/server/functions/submissions";
import {
  submissionAudioKey,
  submissionPhotoKey,
} from "../src/server/storage/keys";
import {
  R2_BUCKET_NAME,
  R2_ENDPOINT,
  r2Client,
} from "../src/server/storage/r2-client";

describe("buildSubmissionsZipResponse", () => {
  const submissionId = "sub-zip-1";
  let photoKey: string;
  let audioKey: string;

  afterAll(async () => {
    if (photoKey)
      await r2Client.fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${photoKey}`, {
        method: "DELETE",
      });
    if (audioKey)
      await r2Client.fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${audioKey}`, {
        method: "DELETE",
      });
  });

  it("produces a ZIP containing every submission photo and audio file, streamed straight from R2", async () => {
    const event = await createEvent({
      ownerId: "owner-zip-test",
      brideName: "A",
      groomName: "B",
      eventDate: "2026-09-01",
    });
    photoKey = submissionPhotoKey(event.id, submissionId);
    audioKey = submissionAudioKey(event.id, submissionId, "webm");

    await r2Client.fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${photoKey}`, {
      method: "PUT",
      body: Buffer.from("fake-photo-bytes"),
      headers: { "Content-Type": "image/jpeg" },
    });
    await r2Client.fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${audioKey}`, {
      method: "PUT",
      body: Buffer.from("fake-audio-bytes"),
      headers: { "Content-Type": "audio/webm" },
    });

    const submission = await createSubmission({
      eventId: event.id,
      guestName: "Tamu Zip",
      frameId: null,
      photoObjectKey: photoKey,
      audioObjectKey: audioKey,
    });

    const response = await buildSubmissionsZipResponse(event.id);
    expect(response).not.toBeNull();
    expect(response!.headers.get("Content-Disposition")).toContain(
      `${event.slug}-moments.zip`,
    );

    const zipBuffer = Buffer.from(await response!.arrayBuffer());
    const zip = await JSZip.loadAsync(zipBuffer);
    const fileNames = Object.keys(zip.files);

    const photoEntry = fileNames.find((n) => n.includes("photo.jpg"));
    const audioEntry = fileNames.find((n) => n.includes("audio.webm"));
    expect(photoEntry).toBeDefined();
    expect(audioEntry).toBeDefined();
    expect(photoEntry).toContain(`Tamu Zip-${submission!.id}`);

    const photoBytes = await zip.files[photoEntry!].async("string");
    const audioBytes = await zip.files[audioEntry!].async("string");
    expect(photoBytes).toBe("fake-photo-bytes");
    expect(audioBytes).toBe("fake-audio-bytes");
  }, 20000);

  it("returns null for a nonexistent event", async () => {
    const response = await buildSubmissionsZipResponse(
      "00000000-0000-0000-0000-000000000000",
    );
    expect(response).toBeNull();
  });

  it("omits the audio entry for a submission with no recorded audio", async () => {
    const event = await createEvent({
      ownerId: "owner-zip-test-2",
      brideName: "A",
      groomName: "B",
      eventDate: "2026-09-01",
    });
    const skipSubmissionId = "sub-zip-2";
    const skipPhotoKey = submissionPhotoKey(event.id, skipSubmissionId);

    await r2Client.fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${skipPhotoKey}`, {
      method: "PUT",
      body: Buffer.from("fake-photo-bytes-no-audio"),
      headers: { "Content-Type": "image/jpeg" },
    });

    const submission = await createSubmission({
      eventId: event.id,
      guestName: "Tamu Tanpa Suara",
      frameId: null,
      photoObjectKey: skipPhotoKey,
      audioObjectKey: null,
    });

    try {
      const response = await buildSubmissionsZipResponse(event.id);
      const zipBuffer = Buffer.from(await response!.arrayBuffer());
      const zip = await JSZip.loadAsync(zipBuffer);
      const fileNames = Object.keys(zip.files);

      const photoEntry = fileNames.find(
        (n) =>
          n.includes(`Tamu Tanpa Suara-${submission!.id}`) &&
          n.includes("photo.jpg"),
      );
      const audioEntry = fileNames.find(
        (n) =>
          n.includes(`Tamu Tanpa Suara-${submission!.id}`) &&
          n.includes("audio"),
      );
      expect(photoEntry).toBeDefined();
      expect(audioEntry).toBeUndefined();
    } finally {
      await r2Client.fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${skipPhotoKey}`, {
        method: "DELETE",
      });
    }
  }, 20000);
});
