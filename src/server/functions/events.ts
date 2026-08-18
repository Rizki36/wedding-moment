import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '../db/client'
import { events } from '../db/schema'

export type CreateEventInput = {
  ownerId: string
  brideName: string
  groomName: string
  eventDate: string
  venue?: string
}

export type UpdateEventInput = Partial<Omit<CreateEventInput, 'ownerId'>>

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
 */
export const createEventFn = createServerFn({ method: 'POST' })
  .validator((input: CreateEventInput) => input)
  .handler(async ({ data }) => createEvent(data))

export const updateEventFn = createServerFn({ method: 'POST' })
  .validator((input: { eventId: string } & UpdateEventInput) => input)
  .handler(async ({ data }) => {
    const { eventId, ...rest } = data
    return updateEvent(eventId, rest)
  })
