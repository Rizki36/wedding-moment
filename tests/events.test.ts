import "dotenv/config";
import { describe, expect, it } from "vitest";
import { auth } from "../src/server/auth/auth";
import {
  requireAdmin,
  requireEventOwner,
  requirePengantin,
} from "../src/server/auth/guards";
import { toPlaceholderEmail } from "../src/server/auth/placeholder-email";
import {
  createEvent,
  getEvent,
  updateEvent,
} from "../src/server/functions/events";

describe("createEvent", () => {
  it("creates an event with a computed retentionDeadline 30 days after eventDate", async () => {
    const event = await createEvent({
      ownerId: "test-owner-id",
      brideName: "Siti",
      groomName: "Budi",
      eventDate: "2026-09-01",
      venue: "Balai Kartini",
    });

    expect(event.slug).toBeTruthy();
    const retention = new Date(event.retentionDeadline);
    const eventDate = new Date("2026-09-01");
    const diffDays =
      (retention.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(30);

    const fetched = await getEvent(event.id);
    expect(fetched?.brideName).toBe("Siti");
  });
});

describe("updateEvent coverImageKey", () => {
  it("persists a coverImageKey and can clear it back to null", async () => {
    const event = await createEvent({
      ownerId: "test-owner-id",
      brideName: "Wati",
      groomName: "Yanto",
      eventDate: "2026-09-15",
    });
    expect(event.coverImageKey).toBeNull();

    const updated = await updateEvent(event.id, {
      coverImageKey: "events/some-event/cover.jpg",
    });
    expect(updated.coverImageKey).toBe("events/some-event/cover.jpg");

    const cleared = await updateEvent(event.id, { coverImageKey: null });
    expect(cleared.coverImageKey).toBeNull();
  });
});

/**
 * `createEventFn`/`updateEventFn` (src/server/functions/events.ts) are
 * `createServerFn`-wrapped RPC endpoints, reachable over the network
 * independent of any route's `beforeLoad`. Calling the wrapped functions
 * directly in Vitest isn't possible outside a real Start request context
 * (it throws "No Start context found in AsyncLocalStorage" — confirmed
 * during implementation), so the RPC-level integration path can't be
 * exercised in this unit-test environment. What CAN be — and is — tested
 * here is the exact guard logic each handler calls before touching the
 * database (`requirePengantin` for createEventFn, `requireEventOwner` for
 * updateEventFn), which is the actual security boundary the reviewer
 * flagged as missing. This mirrors the existing `tests/guards.test.ts`
 * pattern (`requireAdmin(new Headers())` rejects).
 */
async function signUpAndGetHeaders(name: string, username: string) {
  const { headers, response } = await auth.api.signUpEmail({
    body: {
      name,
      email: toPlaceholderEmail(username),
      username,
      password: "password123",
    },
    returnHeaders: true,
  });
  const setCookie = headers.get("set-cookie");
  if (!setCookie) throw new Error("sign up did not return a session cookie");
  // Keep only the `name=value` pair(s), strip cookie attributes (Path, HttpOnly, etc.)
  const cookie = setCookie
    .split(",")
    .map((part) => part.split(";")[0].trim())
    .join("; ");
  return { headers: new Headers({ cookie }), userId: response.user.id };
}

describe("createEventFn security: session required", () => {
  it("requirePengantin rejects a request with no session (unauthenticated RPC call)", async () => {
    await expect(requirePengantin(new Headers())).rejects.toBeDefined();
  });
});

describe("updateEventFn security: session + ownership required", () => {
  it("requireEventOwner rejects a request with no session (unauthenticated RPC call)", async () => {
    const event = await createEvent({
      ownerId: "test-owner-id",
      brideName: "Ani",
      groomName: "Bram",
      eventDate: "2026-09-05",
    });
    await expect(
      requireEventOwner(event.id, new Headers()),
    ).rejects.toBeDefined();
  });

  it("requireEventOwner rejects a real, authenticated non-owner", async () => {
    const owner = await signUpAndGetHeaders("Owner", `owner-${Date.now()}`);
    const intruder = await signUpAndGetHeaders(
      "Intruder",
      `intruder-${Date.now()}`,
    );

    const event = await createEvent({
      ownerId: owner.userId,
      brideName: "Cinta",
      groomName: "Dedi",
      eventDate: "2026-09-10",
    });

    // The owner is allowed through.
    await expect(
      requireEventOwner(event.id, owner.headers),
    ).resolves.toBeDefined();
    // A different authenticated pengantin is not.
    await expect(
      requireEventOwner(event.id, intruder.headers),
    ).rejects.toBeDefined();
  });
});

/**
 * `createEventForOwnerFn` (src/server/functions/events.ts) is a
 * `createServerFn`-wrapped RPC endpoint, so — as with `createEventFn` above
 * — it can't be invoked directly in Vitest. What's tested here is the guard
 * it calls before trusting the client-supplied `ownerId`: `requireAdmin`,
 * which must reject both an unauthenticated caller and an authenticated
 * non-admin (e.g. a pengantin trying to create an event "for themselves"
 * through the admin-only endpoint). The underlying core logic — that
 * `createEvent` accepts an arbitrary `ownerId` distinct from the caller —
 * is already covered by the `createEvent` test above.
 */
describe("createEventForOwnerFn security: admin required", () => {
  it("requireAdmin rejects a request with no session (unauthenticated RPC call)", async () => {
    await expect(requireAdmin(new Headers())).rejects.toBeDefined();
  });

  it("requireAdmin rejects a real, authenticated non-admin (a plain pengantin)", async () => {
    const pengantin = await signUpAndGetHeaders(
      "Not Admin",
      `not-admin-evt-${Date.now()}`,
    );
    await expect(requireAdmin(pengantin.headers)).rejects.toBeDefined();
  });
});
