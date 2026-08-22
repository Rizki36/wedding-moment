import { createServerOnlyFn } from "@tanstack/react-start";
import { downloadZip } from "client-zip";
import { getR2Object } from "../storage/r2-client";
import { getEvent } from "./events";
import { listSubmissionsForEvent } from "./submissions";

/**
 * Extracts the file extension (including the leading dot) from an object
 * key, e.g. `events/e1/submissions/s1/audio.webm` -> `.webm`. Falls back to
 * an empty string if the key has no extension, though in practice every
 * `submissionAudioKey` always has one (see `keys.ts`).
 */
function extname(key: string) {
  const match = key.match(/\.[a-z0-9]+$/i);
  return match ? match[0] : "";
}

/**
 * Builds a streaming ZIP `Response` containing every submission's photo and
 * audio file for an event, one entry at a time — R2 object bytes are piped
 * directly from `getR2Object`'s `ReadableStream` into `client-zip`'s
 * `downloadZip`, so the whole archive is never buffered in memory
 * server-side.
 *
 * Wrapped in `createServerOnlyFn` (matching every other DB-touching helper
 * in `server/functions/*.ts`) so the compiler prunes `db`/R2 imports from
 * any client bundle that might reach this module. Deliberately does NOT
 * perform authorization itself — same convention as `listSubmissionsForEvent`
 * — the caller (the `/api/download/{eventId}.zip` route handler) must call
 * `requireEventOwner` first.
 */
export const buildSubmissionsZipResponse = createServerOnlyFn(
  async (eventId: string) => {
    const event = await getEvent(eventId);
    if (!event) return null;

    const submissionList = await listSubmissionsForEvent(eventId);

    async function* entries() {
      for (const s of submissionList) {
        const photoRes = await getR2Object(s.photoObjectKey);
        if (photoRes.ok && photoRes.body) {
          yield {
            name: `${s.guestName}-${s.id}/photo.jpg`,
            input: photoRes.body,
          };
        }

        if (s.audioObjectKey) {
          const audioRes = await getR2Object(s.audioObjectKey);
          if (audioRes.ok && audioRes.body) {
            yield {
              name: `${s.guestName}-${s.id}/audio${extname(s.audioObjectKey)}`,
              input: audioRes.body,
            };
          }
        }
      }
    }

    const response = downloadZip(entries());
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${event.slug}-moments.zip"`,
    );
    return response;
  },
);
