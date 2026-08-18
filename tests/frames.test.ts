import 'dotenv/config'
import { describe, it, expect } from 'vitest'
import { createFrame, listFramesForEvent } from '../src/server/functions/frames'
import { createEvent } from '../src/server/functions/events'
import { requireEventOwner } from '../src/server/auth/guards'

describe('frames', () => {
  it('creates a frame linked to an event and lists it', async () => {
    const event = await createEvent({ ownerId: 'test-owner', brideName: 'A', groomName: 'B', eventDate: '2026-09-01' })
    const frame = await createFrame(event.id, 'Frame Emas', `events/${event.id}/frames/test.png`)
    const list = await listFramesForEvent(event.id)
    expect(list.map((f) => f.id)).toContain(frame.id)
  })
})

/**
 * `createFrameFn`/`deleteFrameFn` (src/server/functions/frames.ts) and the
 * `/api/uploads/presign` route handler all call `requireEventOwner` inside
 * the handler itself before touching data — not just via a route's
 * `beforeLoad`. Those `createServerFn`-wrapped handlers can't be invoked
 * directly in Vitest outside a real Start request context (same limitation
 * documented in `tests/events.test.ts`), so what's exercised here is the
 * actual security boundary they all share: `requireEventOwner` rejecting an
 * unauthenticated caller for an arbitrary event.
 */
describe('frame mutation security: ownership required', () => {
  it('requireEventOwner rejects a request with no session', async () => {
    const event = await createEvent({
      ownerId: 'test-owner-2',
      brideName: 'C',
      groomName: 'D',
      eventDate: '2026-10-01',
    })
    await expect(requireEventOwner(event.id, new Headers())).rejects.toBeDefined()
  })
})
