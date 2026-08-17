import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { events } from './events'

export const frames = pgTable('frames', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  name: text('name'),
  objectKey: text('object_key').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
