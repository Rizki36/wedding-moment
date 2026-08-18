import 'dotenv/config'
import { describe, it, expect } from 'vitest'
import { createEvent, getEvent } from '../src/server/functions/events'

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
