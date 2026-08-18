import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '../db/client'
import { events } from '../db/schema'
import { requireEventOwner, requirePengantin } from '../auth/guards'

export type CreateEventInput = {
  ownerId: string
  brideName: string
  groomName: string
  eventDate: string
  venue?: string
}

export type UpdateEventInput = Partial<Omit<CreateEventInput, 'ownerId'>>

/** Fields a caller is allowed to change through `updateEventFn`. Deliberately
 * excludes `ownerId`, `id`, `slug`, `status`, `retentionDeadline`, `purgedAt`,
 * and timestamps — those are never client-editable. */
const EDITABLE_UPDATE_FIELDS = ['brideName', 'groomName', 'eventDate', 'venue'] as const

function pickEditableFields(input: Record<string, unknown>): UpdateEventInput {
  const result: UpdateEventInput = {}
  for (const key of EDITABLE_UPDATE_FIELDS) {
    if (key in input) {
      ;(result as Record<string, unknown>)[key] = input[key]
    }
  }
  return result
}

/**
 * Core DB logic — plain async functions so they can be unit-tested directly
 * (calling a `createServerFn`-wrapped function outside of the Start request
 * runtime throws "No Start context found in AsyncLocalStorage"). Route
 * loaders in this project call these directly too, since TanStack Start
 * loaders always execute server-side (see `_authed.tsx`'s `beforeLoad`
 * pattern from Task 6). Only the two mutations invoked from client-side
 * event handlers (the New Event / Settings forms) go through the
 * `createServerFn`-wrapped variants below, so the `db` import never gets
 * bundled into client JS.
 */
export async function createEvent(input: CreateEventInput) {
  const slug = nanoid(10)
  const eventDate = new Date(input.eventDate)
  const retentionDeadline = new Date(eventDate.getTime() + 30 * 24 * 60 * 60 * 1000)

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
    .returning()

  return event
}

export async function getEvent(eventId: string) {
  const [event] = await db.select().from(events).where(eq(events.id, eventId))
  return event ?? null
}

export async function getEventBySlug(slug: string) {
  const [event] = await db.select().from(events).where(eq(events.slug, slug))
  return event ?? null
}

export async function listMyEvents(ownerId: string) {
  return db.select().from(events).where(eq(events.ownerId, ownerId))
}

export async function updateEvent(eventId: string, input: UpdateEventInput) {
  const [event] = await db.update(events).set(input).where(eq(events.id, eventId)).returning()
  return event
}

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
export type CreateEventFormInput = Omit<CreateEventInput, 'ownerId'>

export const createEventFn = createServerFn({ method: 'POST' })
  .validator((input: CreateEventFormInput) => input)
  .handler(async ({ data }) => {
    // Never trust a client-supplied ownerId — derive it from the verified
    // session so a caller cannot create events on behalf of another user.
    const session = await requirePengantin()
    return createEvent({ ...data, ownerId: session.user.id })
  })

export const updateEventFn = createServerFn({ method: 'POST' })
  .validator((input: { eventId: string } & Record<string, unknown>) => input)
  .handler(async ({ data }) => {
    const { eventId, ...rest } = data
    // Only the owning pengantin (or an admin) may update this event.
    await requireEventOwner(eventId)
    // Restrict to the whitelisted editable fields — never let ownerId, id,
    // slug, status, retentionDeadline, purgedAt, or timestamps through.
    return updateEvent(eventId, pickEditableFields(rest))
  })
