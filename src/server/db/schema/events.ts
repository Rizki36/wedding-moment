import {
  date,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    ownerId: text("owner_id").notNull(),
    brideName: text("bride_name").notNull(),
    groomName: text("groom_name").notNull(),
    eventDate: date("event_date").notNull(),
    venue: text("venue"),
    coverImageKey: text("cover_image_key"),
    status: text("status").notNull().default("active"),
    retentionDeadline: timestamp("retention_deadline", {
      withTimezone: true,
    }).notNull(),
    purgedAt: timestamp("purged_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    ownerIdx: index("events_owner_id_idx").on(table.ownerId),
    retentionIdx: index("events_retention_deadline_idx").on(
      table.retentionDeadline,
    ),
  }),
);
