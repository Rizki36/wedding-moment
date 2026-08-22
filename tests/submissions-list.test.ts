import "dotenv/config";
import { describe, expect, it } from "vitest";
import { createEvent } from "../src/server/functions/events";
import {
  createSubmission,
  listSubmissionsForEvent,
} from "../src/server/functions/submissions";

describe("listSubmissionsForEvent", () => {
  it("lists only submissions for the given event, newest first", async () => {
    const eventA = await createEvent({
      ownerId: "owner-a",
      brideName: "A",
      groomName: "B",
      eventDate: "2026-09-01",
    });
    const eventB = await createEvent({
      ownerId: "owner-b",
      brideName: "C",
      groomName: "D",
      eventDate: "2026-09-01",
    });

    const first = await createSubmission({
      eventId: eventA.id,
      guestName: "Guest 1",
      frameId: null,
      photoObjectKey: "p1",
      audioObjectKey: "a1",
    });
    // Small delay so createdAt timestamps are guaranteed to differ, so the
    // newest-first ordering assertion below isn't flaky on fast machines.
    await new Promise((resolve) => setTimeout(resolve, 10));
    const second = await createSubmission({
      eventId: eventA.id,
      guestName: "Guest 3",
      frameId: null,
      photoObjectKey: "p3",
      audioObjectKey: "a3",
    });
    await createSubmission({
      eventId: eventB.id,
      guestName: "Guest 2",
      frameId: null,
      photoObjectKey: "p2",
      audioObjectKey: "a2",
    });

    const listA = await listSubmissionsForEvent(eventA.id);
    expect(listA).toHaveLength(2);
    expect(listA.map((s) => s.id)).toEqual([second.id, first.id]);
    expect(listA.every((s) => s.eventId === eventA.id)).toBe(true);
  });

  it("returns an empty array for an event with no submissions", async () => {
    const event = await createEvent({
      ownerId: "owner-c",
      brideName: "E",
      groomName: "F",
      eventDate: "2026-09-01",
    });
    const list = await listSubmissionsForEvent(event.id);
    expect(list).toEqual([]);
  });
});
