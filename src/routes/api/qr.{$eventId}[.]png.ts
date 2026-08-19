import { createFileRoute } from '@tanstack/react-router'
import QRCode from 'qrcode'
import { getEvent } from '../../server/functions/events'

/**
 * On-demand QR code generation. Public/unauthenticated by design (matches
 * the brief): the event slug embedded in the resulting URL is already
 * public once an invitation is shared, and this endpoint reveals nothing
 * beyond that public `/e/{slug}` URL — no privileged data is read or
 * returned here, so (unlike `uploads.presign.ts`) no `requireEventOwner`/
 * `requireAdmin` check is needed inside the handler.
 */
export const Route = createFileRoute('/api/qr/{$eventId}.png')({
  server: {
    handlers: {
      GET: async ({ params, request }: { params: { eventId: string }; request: Request }) => {
        const event = await getEvent(params.eventId)
        if (!event) return new Response('Not found', { status: 404 })

        const url = new URL(request.url)
        const eventUrl = `${url.protocol}//${url.host}/e/${event.slug}`
        const buffer = await QRCode.toBuffer(eventUrl, { type: 'png', width: 512 })

        const download = url.searchParams.get('download')
        const headers = new Headers({
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        })
        if (download) headers.set('Content-Disposition', `attachment; filename="qr-${event.slug}.png"`)

        return new Response(new Uint8Array(buffer), { headers })
      },
    },
  },
})
