import "dotenv/config";
import { describe, expect, it } from "vitest";
import { createEvent } from "../src/server/functions/events";
import { createSubmission } from "../src/server/functions/submissions";

describe("createSubmission", () => {
  it("creates a submission for an active event", async () => {
    const event = await createEvent({
      ownerId: "test-owner",
      brideName: "A",
      groomName: "B",
      eventDate: "2026-09-01",
    });

    const submission = await createSubmission({
      eventId: event.id,
      guestName: "Tamu Uji",
      frameId: null,
      photoObjectKey: `events/${event.id}/submissions/sub1/photo.jpg`,
      audioObjectKey: `events/${event.id}/submissions/sub1/audio.webm`,
    });

    expect(submission.guestName).toBe("Tamu Uji");
    expect(submission.eventId).toBe(event.id);
    expect(submission.frameId).toBeNull();
  });

  it("creates a submission with no audio when the guest skips recording", async () => {
    const event = await createEvent({
      ownerId: "test-owner",
      brideName: "A",
      groomName: "B",
      eventDate: "2026-09-01",
    });

    const submission = await createSubmission({
      eventId: event.id,
      guestName: "Tamu Tanpa Suara",
      frameId: null,
      photoObjectKey: `events/${event.id}/submissions/sub2/photo.jpg`,
      audioObjectKey: null,
    });

    expect(submission.guestName).toBe("Tamu Tanpa Suara");
    expect(submission.audioObjectKey).toBeNull();
  });

  it("rejects a submission to a nonexistent event", async () => {
    await expect(
      createSubmission({
        eventId: "00000000-0000-0000-0000-000000000000",
        guestName: "X",
        frameId: null,
        photoObjectKey: "x",
        audioObjectKey: "y",
      }),
    ).rejects.toThrow();
  });

  it("rejects input that fails schema validation", async () => {
    await expect(
      createSubmission({
        eventId: "not-a-uuid",
        guestName: "",
        frameId: null,
        photoObjectKey: "",
        audioObjectKey: "",
      }),
    ).rejects.toThrow();
  });
});
