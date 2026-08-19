import { and, eq, isNull, lt } from 'drizzle-orm'
import { db } from '../db/client'
import { events, frames, submissions } from '../db/schema'
import { deleteR2Object, listR2ObjectsByPrefix } from '../storage/r2-client'
import { eventPrefix } from '../storage/keys'

/**
 * Plain server-only functions — NOT wrapped in `createServerFn`/
 * `createServerOnlyFn`. Unlike `events.ts`/`frames.ts`/`submissions.ts`,
 * this module is never imported by any client-bundled route or component:
 * it's only reachable from Task 19's cron route handler (server-only by
 * construction) or directly from tests, so there's no client-bundle-leak
 * risk to guard against here.
 */

/** Events whose 30-day retention window has passed and that have not
 * already been purged. Consumed by the cron route (Task 19) to decide what
 * to purge on each run. */
export async function findEventsPastRetention() {
  return db
    .select()
    .from(events)
    .where(and(lt(events.retentionDeadline, new Date()), isNull(events.purgedAt)))
}

/** Deletes every object under `prefix`, with limited concurrency so a large
 * event doesn't fire hundreds of simultaneous DELETE requests at once.
 * See `r2-client.ts`'s `deleteR2Object` doc comment for why this issues
 * individual DELETEs rather than R2's bulk multi-delete endpoint. */
async function deleteR2Prefix(prefix: string, concurrency = 10): Promise<void> {
  const keys = await listR2ObjectsByPrefix(prefix)

  for (let i = 0; i < keys.length; i += concurrency) {
    const batch = keys.slice(i, i + concurrency)
    await Promise.all(batch.map((key) => deleteR2Object(key)))
  }
}

/**
 * Purges one event: deletes all of its R2 objects (photos, audio, frame
 * images — everything under `events/{eventId}/`), deletes its `submissions`
 * and `frames` rows, and marks the event `status: 'purged'` with
 * `purgedAt` set. The `events` row itself is kept (not deleted) so the
 * purge is auditable and `findEventsPastRetention` naturally excludes it
 * on future runs via `isNull(events.purgedAt)`.
 *
 * Idempotent and safe to call twice: a nonexistent event, or one that's
 * already purged, is a no-op. R2 deletion runs before any DB write — if it
 * throws partway through, the event is NOT marked purged, so a later retry
 * (from the Task 19 cron) will re-attempt the R2 cleanup (re-listing and
 * re-deleting is safe since `deleteR2Object` treats a 404 as success) and
 * then proceed to the DB step. This is a best-effort approach, not a full
 * two-phase-commit — a crash between the R2 delete completing and the DB
 * update landing would leave the DB rows around with objects already gone,
 * but a retry's R2 step would just no-op (empty list) and complete the DB
 * step, so the system still converges to a fully purged state.
 *
 * `frames`/`submissions` FKs are already `onDelete: 'cascade'` (see
 * `db/schema/frames.ts`, `db/schema/submissions.ts`), so deleting the
 * `events` row alone would cascade-delete both — but since we deliberately
 * keep the `events` row, both child tables are deleted explicitly here
 * instead. `submissions` is deleted before `frames` since `submissions.frameId`
 * references `frames.id` (`onDelete: 'set null'`, so order isn't strictly
 * required for FK correctness, but deleting submissions first avoids ever
 * leaving a dangling reference even momentarily).
 */
export async function purgeEvent(eventId: string): Promise<void> {
  const [event] = await db.select().from(events).where(eq(events.id, eventId))
  if (!event || event.purgedAt) return

  await deleteR2Prefix(eventPrefix(eventId))

  await db.delete(submissions).where(eq(submissions.eventId, eventId))
  await db.delete(frames).where(eq(frames.eventId, eventId))

  await db
    .update(events)
    .set({ status: 'purged', purgedAt: new Date() })
    .where(eq(events.id, eventId))
}
