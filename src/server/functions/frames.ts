import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { frames } from '../db/schema'
import { requireEventOwner } from '../auth/guards'

/**
 * Core DB logic — plain async functions so they can be unit-tested directly
 * and called from route loaders, matching the pattern established in
 * `events.ts` (Task 7).
 */
export async function createFrame(eventId: string, name: string, objectKey: string) {
  const [frame] = await db.insert(frames).values({ eventId, name, objectKey }).returning()
  return frame
}

export async function listFramesForEvent(eventId: string) {
  return db.select().from(frames).where(eq(frames.eventId, eventId))
}

export async function deleteFrame(frameId: string) {
  await db.delete(frames).where(eq(frames.id, frameId))
}

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
