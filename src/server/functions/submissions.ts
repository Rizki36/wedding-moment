import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { db } from '../db/client'
import { events, submissions } from '../db/schema'
import { createSubmissionSchema } from '../../lib/validators'
import { requireEventOwner } from '../auth/guards'
import { getPresignedGetUrl } from '../storage/presign'

/**
 * Core DB logic, wrapped in `createServerOnlyFn` — see `events.ts`/
 * `frames.ts` for the full rationale (a plain top-level `async function`
 * doesn't get its `db` import pruned from the client bundle, even once
 * every direct call site is routed through `createSubmissionFn` below).
 *
 * Unlike `createEvent`/`createFrame`, this path is intentionally
 * unauthenticated — guests never log in — so the only gate is that the
 * target event must exist and be `active`. `createServerOnlyFn` is still
 * callable directly from Vitest/Node (it only throws when invoked from a
 * browser), so this is unit-testable exactly like the other `*.ts` server
 * functions.
 */
export const createSubmission = createServerOnlyFn(async (input: unknown) => {
  const parsed = createSubmissionSchema.parse(input)

  const [event] = await db.select().from(events).where(eq(events.id, parsed.eventId))
  if (!event || event.status !== 'active') {
    throw new Error('Event is not accepting submissions')
  }

  const [submission] = await db.insert(submissions).values(parsed).returning()
  return submission
})

/**
 * Lists all submissions for an event, newest first. Ownership is NOT
 * re-checked here — unlike `createSubmission` (unauthenticated by design),
 * this is only ever called from an already-guarded context (a route
 * `beforeLoad`, or `listSubmissionsForEventFn` below, both of which run
 * `requireEventOwner` first), matching how `getEvent`/`listFramesForEvent`
 * defer authorization to their callers rather than duplicating it.
 */
export const listSubmissionsForEvent = createServerOnlyFn(async (eventId: string) => {
  return db.select().from(submissions).where(eq(submissions.eventId, eventId)).orderBy(desc(submissions.createdAt))
})

/**
 * Client-safe entry point for `events.$eventId/submissions.tsx`'s route
 * `loader`. Loaders run on both server and client, so calling
 * `listSubmissionsForEvent` (which touches `db`) directly from a loader in
 * that client-bundled route file pulls `db/client.ts` into the client
 * bundle, where `neon(process.env.DATABASE_URL!)` throws on import and
 * crashes hydration app-wide — see `events.ts`'s `getEventFn` for the same
 * rationale. This is also a network-reachable RPC endpoint independent of
 * any route's `beforeLoad`, so it re-verifies ownership itself rather than
 * trusting the page's guard. It also resolves each submission's R2 object
 * keys into short-lived presigned GET URLs here, server-side, matching how
 * `getGuestLandingDataFn` (`src/routes/e/$eventSlug/index.tsx`) resolves
 * frame thumbnail URLs — the R2 bucket is private, so a bare object key
 * cannot be used as an `<img>`/`<audio>` `src` on the client.
 */
export const listSubmissionsForEventFn = createServerFn({ method: 'GET' })
  .validator((eventId: string) => eventId)
  .handler(async ({ data: eventId }) => {
    await requireEventOwner(eventId)
    const rows = await listSubmissionsForEvent(eventId)
    return Promise.all(
      rows.map(async (s) => ({
        id: s.id,
        guestName: s.guestName,
        photoUrl: await getPresignedGetUrl(s.photoObjectKey),
        audioUrl: s.audioObjectKey ? await getPresignedGetUrl(s.audioObjectKey) : null,
      })),
    )
  })

/**
 * Client-safe entry point. This is a network-reachable RPC endpoint,
 * independent of any route's `beforeLoad`/loader — the guest capture step
 * (`src/routes/e/$eventSlug/index.tsx`) calls this directly from its
 * `onSubmit` handler, the same calling convention `FrameUploadForm` uses
 * for `createFrameFn`. No auth guard here by design: guests are anonymous,
 * and `createSubmission` itself re-verifies the target event is `active`
 * before writing anything.
 */
export const createSubmissionFn = createServerFn({ method: 'POST' })
  .validator((input: unknown) => input)
  .handler(async ({ data }) => createSubmission(data))
