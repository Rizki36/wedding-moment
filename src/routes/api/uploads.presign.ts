import { createFileRoute } from '@tanstack/react-router'
import { getPresignedUploadUrl } from '../../server/storage/presign'
import { requireEventOwner } from '../../server/auth/guards'
import { frameKey } from '../../server/storage/keys'

/**
 * Presigned-upload endpoint. This is the INITIAL version, handling only
 * frame uploads (`kind: 'frame'` implicitly). A later task (submission
 * photo/audio presigning) will extend this same file with a `kind`
 * dispatch field — kept deliberately simple here rather than
 * pre-building that dispatch before it's needed.
 *
 * CRITICAL security requirement: this is a network-reachable RPC endpoint
 * independent of any route's `beforeLoad` — an unauthenticated or
 * non-owning caller must not be able to obtain a presigned PUT URL for
 * someone else's event. `requireEventOwner` is therefore checked INSIDE
 * this handler (not just relied on via a page's `beforeLoad`), matching the
 * pattern established in `events.ts`/`users.ts` (Task 7/8).
 *
 * `requireEventOwner` throws a TanStack Router `redirect()` object on
 * failure, which makes sense for a page's `beforeLoad` but not for a JSON
 * API endpoint invoked via `fetch()` — so it's caught here and converted
 * into a plain 403 JSON response instead of letting it propagate as an
 * uncaught exception.
 */
export const Route = createFileRoute('/api/uploads/presign')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { eventId, frameId, contentType } = await request.json()

        if (!eventId || !frameId || !contentType) {
          return Response.json({ error: 'eventId, frameId, and contentType are required' }, { status: 400 })
        }

        try {
          await requireEventOwner(eventId)
        } catch {
          return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        const key = frameKey(eventId, frameId)
        const url = await getPresignedUploadUrl(key, contentType)
        return Response.json({ url, key })
      },
    },
  },
})
