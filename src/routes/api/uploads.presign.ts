import { createFileRoute } from "@tanstack/react-router";
import { requireEventOwner } from "../../server/auth/guards";
import { getEvent } from "../../server/functions/events";
import {
  frameKey,
  submissionAudioKey,
  submissionPhotoKey,
} from "../../server/storage/keys";
import { getPresignedUploadUrl } from "../../server/storage/presign";

/**
 * Presigned-upload endpoint. Dispatches on a `kind` discriminator:
 *
 * - `kind: 'frame'` (the original behavior, unchanged): requires
 *   `requireEventOwner` since only the owning pengantin may upload frames
 *   for their event.
 * - `kind: 'submission-photo' | 'submission-audio'`: guests are anonymous
 *   and never log in, so there is no session to check ownership against.
 *   Instead the target event must exist and be `active` before a
 *   presigned PUT URL is issued — mirroring the same "event must be
 *   active" gate `createSubmission` (Task 15) enforces at write time.
 *
 * CRITICAL security requirement: this is a network-reachable RPC endpoint
 * independent of any route's `beforeLoad` — an unauthenticated or
 * non-owning caller must not be able to obtain a presigned PUT URL for
 * someone else's event (frame path), and a caller must not be able to
 * obtain a presigned PUT URL for an inactive/nonexistent event (submission
 * paths). `requireEventOwner` throws a TanStack Router `redirect()` object
 * on failure, which makes sense for a page's `beforeLoad` but not for a
 * JSON API endpoint invoked via `fetch()` — so it's caught here and
 * converted into a plain 403 JSON response instead of letting it propagate
 * as an uncaught exception.
 */
export const Route = createFileRoute("/api/uploads/presign")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = await request.json();
        const { kind, eventId, contentType } = body;

        if (kind === "frame" || kind === undefined) {
          const { frameId } = body;
          if (!eventId || !frameId || !contentType) {
            return Response.json(
              { error: "eventId, frameId, and contentType are required" },
              { status: 400 },
            );
          }

          try {
            await requireEventOwner(eventId);
          } catch {
            return Response.json({ error: "Forbidden" }, { status: 403 });
          }

          const key = frameKey(eventId, frameId);
          const url = await getPresignedUploadUrl(key, contentType);
          return Response.json({ url, key });
        }

        if (kind === "submission-photo" || kind === "submission-audio") {
          const { submissionId, ext } = body;
          if (!eventId || !submissionId || !contentType) {
            return Response.json(
              { error: "eventId, submissionId, and contentType are required" },
              { status: 400 },
            );
          }
          if (kind === "submission-audio" && !ext) {
            return Response.json(
              { error: "ext is required for submission-audio" },
              { status: 400 },
            );
          }

          const event = await getEvent(eventId);
          if (!event || event.status !== "active") {
            return Response.json(
              { error: "Event is not accepting submissions" },
              { status: 403 },
            );
          }

          const key =
            kind === "submission-photo"
              ? submissionPhotoKey(eventId, submissionId)
              : submissionAudioKey(eventId, submissionId, ext);
          const url = await getPresignedUploadUrl(key, contentType);
          return Response.json({ url, key });
        }

        return Response.json({ error: "Unknown kind" }, { status: 400 });
      },
    },
  },
});
