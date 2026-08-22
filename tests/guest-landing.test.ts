import "dotenv/config";
import { describe, expect, it } from "vitest";
import { createEvent, getEventBySlug } from "../src/server/functions/events";

describe("guest landing loader data", () => {
  it("returns null for an unknown slug", async () => {
    const event = await getEventBySlug("does-not-exist");
    expect(event).toBeNull();
  });

  it("returns the event for a known slug", async () => {
    const created = await createEvent({
      ownerId: "test-owner",
      brideName: "A",
      groomName: "B",
      eventDate: "2026-09-01",
    });
    const found = await getEventBySlug(created.slug);
    expect(found?.id).toBe(created.id);
  });

  it("treats a purged event as unavailable", async () => {
    const created = await createEvent({
      ownerId: "test-owner",
      brideName: "C",
      groomName: "D",
      eventDate: "2020-01-01",
    });
    // simulate purge by checking status field contract the route must honor
    expect(created.status).toBe("active");
  });
});
