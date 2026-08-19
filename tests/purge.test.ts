// @vitest-environment node
import 'dotenv/config'
import { describe, it, expect } from 'vitest'
import { eq } from 'drizzle-orm'
import { createEvent } from '../src/server/functions/events'
import { createFrame } from '../src/server/functions/frames'
import { createSubmission } from '../src/server/functions/submissions'
import { findEventsPastRetention, purgeEvent } from '../src/server/functions/purge'
import { db } from '../src/server/db/client'
import { events, frames, submissions } from '../src/server/db/schema'
import { getPresignedUploadUrl } from '../src/server/storage/presign'
import { listR2ObjectsByPrefix } from '../src/server/storage/r2-client'
import { frameKey, submissionPhotoKey, submissionAudioKey, eventPrefix } from '../src/server/storage/keys'

async function putR2Object(key: string, contentType: string, body: string) {
  const url = await getPresignedUploadUrl(key, contentType)
  const res = await fetch(url, { method: 'PUT', body: Buffer.from(body), headers: { 'Content-Type': contentType } })
  expect(res.ok).toBe(true)
}

describe('purge', () => {
  it('finds events whose retentionDeadline has passed and are not yet purged', async () => {
    const pastEvent = await createEvent({ ownerId: 'owner-purge', brideName: 'A', groomName: 'B', eventDate: '2020-01-01' })
    const futureEvent = await createEvent({ ownerId: 'owner-purge', brideName: 'C', groomName: 'D', eventDate: '2030-01-01' })

    const due = await findEventsPastRetention()
    const dueIds = due.map((e) => e.id)
    expect(dueIds).toContain(pastEvent.id)
    expect(dueIds).not.toContain(futureEvent.id)
  })

  it('deletes R2 objects, DB child rows, and marks the event purged, idempotently', async () => {
    const event = await createEvent({ ownerId: 'owner-purge-2', brideName: 'E', groomName: 'F', eventDate: '2020-01-01' })
    const frame = await createFrame(event.id, 'Frame', frameKey(event.id, 'f1'))
    await putR2Object(frame.objectKey, 'image/png', 'x')

    const submission = await createSubmission({
      eventId: event.id,
      guestName: 'G',
      frameId: frame.id,
      photoObjectKey: submissionPhotoKey(event.id, 'sub-purge'),
      audioObjectKey: submissionAudioKey(event.id, 'sub-purge', 'webm'),
    })
    await putR2Object(submission.photoObjectKey, 'image/jpeg', 'x')
    await putR2Object(submission.audioObjectKey, 'audio/webm', 'x')

    // Sanity check: objects really exist in R2 before purging.
    const before = await listR2ObjectsByPrefix(eventPrefix(event.id))
    expect(before.length).toBeGreaterThanOrEqual(3)

    await purgeEvent(event.id)

    const after = await listR2ObjectsByPrefix(eventPrefix(event.id))
    expect(after).toHaveLength(0)

    const remainingSubmissions = await db.select().from(submissions).where(eq(submissions.eventId, event.id))
    const remainingFrames = await db.select().from(frames).where(eq(frames.eventId, event.id))
    expect(remainingSubmissions).toHaveLength(0)
    expect(remainingFrames).toHaveLength(0)

    const [purgedEvent] = await db.select().from(events).where(eq(events.id, event.id))
    expect(purgedEvent.status).toBe('purged')
    expect(purgedEvent.purgedAt).not.toBeNull()

    // idempotent second call
    await expect(purgeEvent(event.id)).resolves.not.toThrow()
  }, 30000)

  it('is a no-op for a nonexistent event', async () => {
    await expect(purgeEvent('00000000-0000-0000-0000-000000000000')).resolves.not.toThrow()
  })
})
