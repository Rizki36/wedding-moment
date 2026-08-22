import { createFileRoute } from "@tanstack/react-router";
import {
  findEventsPastRetention,
  purgeEvent,
} from "../../server/functions/purge";

/**
 * Retention-purge cron endpoint. Deletes every event whose 30-day retention
 * window has passed (per `findEventsPastRetention`) via `purgeEvent`
 * (Task 18) — R2 objects, `submissions`/`frames` rows, and marks the event
 * `purged`.
 *
 * Guarded by a shared secret (`CRON_SECRET`) rather than a session/ownership
 * check, since this is invoked by a scheduler, not a logged-in user — see
 * `x-cron-secret` header compared against `process.env.CRON_SECRET`. The
 * secret is checked BEFORE any purge work happens, so a missing/wrong
 * secret never triggers a partial or accidental purge run.
 *
 * There is currently no automated Cloudflare Worker `scheduled` trigger
 * wired to call this endpoint (see wrangler.jsonc's `triggers.crons` entry
 * and the Task 19 report for why) — until that's added, this endpoint must
 * be invoked manually or by an external scheduler (e.g. a GitHub Actions
 * scheduled workflow) with the `x-cron-secret` header set to `CRON_SECRET`.
 */
export const Route = createFileRoute("/api/cron/purge")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const secret = request.headers.get("x-cron-secret");
        if (!secret || secret !== process.env.CRON_SECRET) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dueEvents = await findEventsPastRetention();
        for (const event of dueEvents) {
          await purgeEvent(event.id);
        }

        return Response.json({ purgedCount: dueEvents.length });
      },
    },
  },
});
