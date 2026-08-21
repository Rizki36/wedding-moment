import 'dotenv/config'
import { describe, it, expect } from 'vitest'
import { createEvent, getEvent } from '../src/server/functions/events'
import { requireEventOwner, requirePengantin } from '../src/server/auth/guards'
import { auth } from '../src/server/auth/auth'
import { toPlaceholderEmail } from '../src/server/auth/placeholder-email'

describe('createEvent', () => {
  it('creates an event with a computed retentionDeadline 30 days after eventDate', async () => {
    const event = await createEvent({
      ownerId: 'test-owner-id',
      brideName: 'Siti',
      groomName: 'Budi',
      eventDate: '2026-09-01',
      venue: 'Balai Kartini',
    })

    expect(event.slug).toBeTruthy()
    const retention = new Date(event.retentionDeadline)
    const eventDate = new Date('2026-09-01')
    const diffDays = (retention.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBe(30)

    const fetched = await getEvent(event.id)
    expect(fetched?.brideName).toBe('Siti')
  })
})

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
    body: { name, email: toPlaceholderEmail(username), username, password: 'password123' },
    returnHeaders: true,
  })
  const setCookie = headers.get('set-cookie')
  if (!setCookie) throw new Error('sign up did not return a session cookie')
  // Keep only the `name=value` pair(s), strip cookie attributes (Path, HttpOnly, etc.)
  const cookie = setCookie
    .split(',')
    .map((part) => part.split(';')[0].trim())
    .join('; ')
  return { headers: new Headers({ cookie }), userId: response.user.id }
}

describe('createEventFn security: session required', () => {
  it('requirePengantin rejects a request with no session (unauthenticated RPC call)', async () => {
    await expect(requirePengantin(new Headers())).rejects.toBeDefined()
  })
})

describe('updateEventFn security: session + ownership required', () => {
  it('requireEventOwner rejects a request with no session (unauthenticated RPC call)', async () => {
    const event = await createEvent({
      ownerId: 'test-owner-id',
      brideName: 'Ani',
      groomName: 'Bram',
      eventDate: '2026-09-05',
    })
    await expect(requireEventOwner(event.id, new Headers())).rejects.toBeDefined()
  })

  it('requireEventOwner rejects a real, authenticated non-owner', async () => {
    const owner = await signUpAndGetHeaders('Owner', `owner-${Date.now()}`)
    const intruder = await signUpAndGetHeaders('Intruder', `intruder-${Date.now()}`)

    const event = await createEvent({
      ownerId: owner.userId,
      brideName: 'Cinta',
      groomName: 'Dedi',
      eventDate: '2026-09-10',
    })

    // The owner is allowed through.
    await expect(requireEventOwner(event.id, owner.headers)).resolves.toBeDefined()
    // A different authenticated pengantin is not.
    await expect(requireEventOwner(event.id, intruder.headers)).rejects.toBeDefined()
  })
})
