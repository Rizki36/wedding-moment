import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  requireAdmin,
  requireEventOwner,
  requirePengantin,
} from "../auth/guards";
import { db } from "../db/client";
import { events } from "../db/schema";
import { getPresignedGetUrl } from "../storage/presign";

export type CreateEventInput = {
  ownerId: string;
  brideName: string;
  groomName: string;
  eventDate: string;
  venue?: string;
};

export type UpdateEventInput = Partial<Omit<CreateEventInput, "ownerId">> & {
  coverImageKey?: string | null;
};

/** Fields a caller is allowed to change through `updateEventFn`. Deliberately
 * excludes `ownerId`, `id`, `slug`, `status`, `retentionDeadline`, `purgedAt`,
 * and timestamps — those are never client-editable. */
const EDITABLE_UPDATE_FIELDS = [
  "brideName",
  "groomName",
  "eventDate",
  "venue",
  "coverImageKey",
] as const;

function pickEditableFields(input: Record<string, unknown>): UpdateEventInput {
  const result: UpdateEventInput = {};
  for (const key of EDITABLE_UPDATE_FIELDS) {
    if (key in input) {
      (result as Record<string, unknown>)[key] = input[key];
    }
  }
  return result;
}

/**
 * Core DB logic, each wrapped in `createServerOnlyFn` (see `guards.ts` and
 * `users.ts` for the same pattern and its full rationale). They're still
 * callable directly for unit tests and from route loaders — unlike a
 * `createServerFn` handler, `createServerOnlyFn` only throws when actually
 * invoked from a browser, not from Node/vitest or a server-side loader —
 * but wrapping is what lets the compiler prune the `db` import from any
 * client bundle that reaches these functions, rather than just deferring
 * its use. A plain top-level `async function` doesn't get that treatment:
 * confirmed via `pnpm build` + `grep -r DATABASE_URL dist/client` that
 * leaving these unwrapped kept `db` alive in the client bundle even once
 * every direct call site was routed through the `*Fn` wrappers below.
 */
export const createEvent = createServerOnlyFn(
  async (input: CreateEventInput) => {
    const slug = nanoid(10);
    const eventDate = new Date(input.eventDate);
    const retentionDeadline = new Date(
      eventDate.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    const [event] = await db
      .insert(events)
      .values({
        slug,
        ownerId: input.ownerId,
        brideName: input.brideName,
        groomName: input.groomName,
        eventDate: input.eventDate,
        venue: input.venue,
        retentionDeadline,
      })
      .returning();

    return event;
  },
);

export const getEvent = createServerOnlyFn(async (eventId: string) => {
  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  return event ?? null;
});

export const getEventBySlug = createServerOnlyFn(async (slug: string) => {
  const [event] = await db.select().from(events).where(eq(events.slug, slug));
  return event ?? null;
});

export const listMyEvents = createServerOnlyFn(async (ownerId: string) => {
  return db.select().from(events).where(eq(events.ownerId, ownerId));
});

export const updateEvent = createServerOnlyFn(
  async (eventId: string, input: UpdateEventInput) => {
    const [event] = await db
      .update(events)
      .set(input)
      .where(eq(events.id, eventId))
      .returning();
    return event;
  },
);

/**
 * Client-safe entry points. These run through TanStack Start's server
 * function RPC boundary, so they are the ones the New Event / Settings
 * route components call from their `onSubmit` handlers.
 *
 * IMPORTANT: these are network-reachable RPC endpoints independent of any
 * route's `beforeLoad` — a caller can POST to them directly without ever
 * rendering the page. Route-level guards (`requirePengantin`,
 * `requireEventOwner` in `beforeLoad`) are page-load gating only and do NOT
 * protect the endpoint itself, so each handler re-verifies the session (and
 * ownership, for updates) itself. The guards read the current request's
 * headers internally (see `guards.ts`'s `getAmbientHeaders`), so no
 * `getRequestHeaders()` call — and no import of
 * '@tanstack/react-start/server' — is needed in this file.
 */
export type CreateEventFormInput = Omit<CreateEventInput, "ownerId">;

export const createEventFn = createServerFn({ method: "POST" })
  .validator((input: CreateEventFormInput) => input)
  .handler(async ({ data }) => {
    // Never trust a client-supplied ownerId — derive it from the verified
    // session so a caller cannot create events on behalf of another user.
    const session = await requirePengantin();
    return createEvent({ ...data, ownerId: session.user.id });
  });

export const updateEventFn = createServerFn({ method: "POST" })
  .validator((input: { eventId: string } & Record<string, unknown>) => input)
  .handler(async ({ data }) => {
    const { eventId, ...rest } = data;
    // Only the owning pengantin (or an admin) may update this event.
    await requireEventOwner(eventId);
    // Restrict to the whitelisted editable fields — never let ownerId, id,
    // slug, status, retentionDeadline, purgedAt, or timestamps through.
    return updateEvent(eventId, pickEditableFields(rest));
  });

/**
 * Client-safe entry points for route `loader`s. Loaders run on both server
 * and client (a loader is not a server boundary by itself — see the plain
 * `async function`s above), so a client-bundled route file (one with both
 * `beforeLoad`/`loader` and `component`) that calls `getEvent`/`listMyEvents`
 * directly from its loader pulls `db/client.ts` into the client bundle,
 * where `neon(process.env.DATABASE_URL!)` throws on import and crashes
 * hydration app-wide. Each handler re-verifies access itself, matching the
 * `createEventFn`/`updateEventFn` rationale above, since these become
 * network-reachable independent of any route's `beforeLoad`.
 */
export const getEventFn = createServerFn({ method: "GET" })
  .validator((eventId: string) => eventId)
  .handler(async ({ data: eventId }) => {
    // `requireEventOwner` allows admins through, so this single endpoint
    // serves both the pengantin dashboard and the admin QR page.
    await requireEventOwner(eventId);
    const event = await getEvent(eventId);
    if (!event?.coverImageKey) return event;
    // `coverImageKey` is overwritten with a short-lived presigned GET URL
    // so the Settings page can preview it directly — cover images live in
    // a private R2 bucket, same as frames (see `listFramesForEventFn`).
    return {
      ...event,
      coverImageKey: await getPresignedGetUrl(event.coverImageKey),
    };
  });

export const listMyEventsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    // Ownership is derived from the verified session, not a client-supplied
    // id, so a caller can only ever list their own events here.
    const session = await requirePengantin();
    return listMyEvents(session.user.id);
  },
);

/** Admin-only: list events for an arbitrary pengantin (`admin/pengantin.$id.tsx`). */
export const listEventsForOwnerFn = createServerFn({ method: "GET" })
  .validator((ownerId: string) => ownerId)
  .handler(async ({ data: ownerId }) => {
    await requireAdmin();
    return listMyEvents(ownerId);
  });

/** Admin-only: create an event owned by an arbitrary pengantin (`admin/pengantin.$id.events.new.tsx`). */
export const createEventForOwnerFn = createServerFn({ method: "POST" })
  .validator((input: { ownerId: string } & CreateEventFormInput) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { ownerId, ...rest } = data;
    return createEvent({ ...rest, ownerId });
  });
