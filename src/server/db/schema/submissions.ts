import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core'
import { events } from './events'
import { frames } from './frames'

export const submissions = pgTable('submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  guestName: text('guest_name').notNull(),
  frameId: uuid('frame_id').references(() => frames.id, { onDelete: 'set null' }),
  photoObjectKey: text('photo_object_key').notNull(),
  audioObjectKey: text('audio_object_key'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  eventCreatedIdx: index('submissions_event_id_created_at_idx').on(table.eventId, table.createdAt),
}))
