import { createFileRoute } from '@tanstack/react-router'
import { requireEventOwner } from '../../server/auth/guards'
import { buildSubmissionsZipResponse } from '../../server/functions/download'

/**
 * Streaming bulk ZIP download of every guest submission (photo + audio) for
 * an event. Private, owner-only — unlike `qr.{$eventId}[.]png.ts`, this
 * exposes guests' private photos/audio, so it MUST authorize before doing
 * any work. Same pattern as `uploads.presign.ts`: `requireEventOwner` throws
 * a TanStack Router `redirect()` on failure, which doesn't make sense for a
 * JSON/binary API endpoint, so it's caught here and converted into a plain
 * 403 response.
 *
 * File name follows the same bracket-escaping convention as
 * `qr.{$eventId}[.]png.ts` (`{$eventId}` for the dynamic segment, `[.]` to
 * escape the literal dot before the `zip` suffix so it isn't parsed as a
 * separate path segment) — confirmed against `routeTree.gen.ts`'s generated
 * pattern for the QR route, which resolves to `/api/qr/{$eventId}.png`.
 * This file resolves to `/api/download/{$eventId}.zip`.
 */
export const Route = createFileRoute('/api/download/{$eventId}.zip')({
  server: {
    handlers: {
      GET: async ({ params }: { params: { eventId: string } }) => {
        try {
          await requireEventOwner(params.eventId)
        } catch {
          return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        const response = await buildSubmissionsZipResponse(params.eventId)
        if (!response) return Response.json({ error: 'Not found' }, { status: 404 })
        return response
      },
    },
  },
})
