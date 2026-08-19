import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { events, submissions } from '../db/schema'
import { createSubmissionSchema } from '../../lib/validators'

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
