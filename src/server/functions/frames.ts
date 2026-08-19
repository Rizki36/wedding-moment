import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { frames } from '../db/schema'
import { requireEventOwner } from '../auth/guards'

/**
 * Core DB logic, each wrapped in `createServerOnlyFn` — see `events.ts` for
 * the full rationale (a plain top-level `async function` doesn't get its
 * `db` import pruned from the client bundle, even once every direct call
 * site is routed through the `*Fn` wrappers below).
 */
export const createFrame = createServerOnlyFn(async (eventId: string, name: string, objectKey: string) => {
  const [frame] = await db.insert(frames).values({ eventId, name, objectKey }).returning()
  return frame
})

export const listFramesForEvent = createServerOnlyFn(async (eventId: string) => {
  return db.select().from(frames).where(eq(frames.eventId, eventId))
})

export const deleteFrame = createServerOnlyFn(async (frameId: string) => {
  await db.delete(frames).where(eq(frames.id, frameId))
})

/**
 * Client-safe entry points. These run through TanStack Start's server
 * function RPC boundary, so they are the ones `FrameUploadForm` and the
 * frames management route call from client-side event handlers.
 *
 * IMPORTANT: these are network-reachable RPC endpoints independent of any
 * route's `beforeLoad` — a caller can invoke them directly without ever
 * rendering the page, so each handler re-verifies ownership itself rather
 * than trusting the page's `beforeLoad` guard.
 */
/**
 * Client-safe entry point for `events.$eventId/frames.tsx`'s route
 * `loader`. Loaders run on both server and client, so calling
 * `listFramesForEvent` (which touches `db`) directly from a loader in that
 * client-bundled route file pulls `db/client.ts` into the client bundle,
 * where `neon(process.env.DATABASE_URL!)` throws on import and crashes
 * hydration app-wide — see `events.ts`'s `getEventFn` for the same
 * rationale.
 */
export const listFramesForEventFn = createServerFn({ method: 'GET' })
  .validator((eventId: string) => eventId)
  .handler(async ({ data: eventId }) => {
    await requireEventOwner(eventId)
    return listFramesForEvent(eventId)
  })

export const createFrameFn = createServerFn({ method: 'POST' })
  .validator((input: { eventId: string; name: string; objectKey: string }) => input)
  .handler(async ({ data }) => {
    await requireEventOwner(data.eventId)
    return createFrame(data.eventId, data.name, data.objectKey)
  })

/**
 * Only `frameId` is accepted from the client — NOT a client-supplied
 * `eventId` — because trusting a client-supplied `eventId` for the
 * ownership check would let an owner of Event A delete a frame belonging
 * to Event B simply by pairing their own `eventId` with someone else's
 * `frameId`. Instead the frame's real `eventId` is looked up server-side
 * first, and that value is what gets checked against the caller's session.
 */
export const deleteFrameFn = createServerFn({ method: 'POST' })
  .validator((input: { frameId: string }) => input)
  .handler(async ({ data }) => {
    const [frame] = await db.select().from(frames).where(eq(frames.id, data.frameId))
    if (!frame) return
    await requireEventOwner(frame.eventId)
    await deleteFrame(data.frameId)
  })
