ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_username" text;--> statement-breakpoint
UPDATE "user" SET
  "username" = lower(regexp_replace(split_part("email", '@', 1), '[^a-zA-Z0-9_.]', '', 'g')) || '-' || substr("id", 1, 6),
  "display_username" = split_part("email", '@', 1)
WHERE "username" IS NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "username" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "display_username" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");
