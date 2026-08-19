import { createFileRoute } from '@tanstack/react-router'
import { getEvent } from '../../../server/functions/events'
import { QrCodeCard } from '../../../components/dashboard/QrCodeCard'

/**
 * `requireAdmin` is already enforced by the parent `/_authed/admin` layout
 * route's `beforeLoad` (see `src/routes/_authed/admin.tsx`) — matches the
 * existing `pengantin.$id.tsx` admin route, which also has no `beforeLoad`
 * of its own.
 */
export const Route = createFileRoute('/_authed/admin/events/$eventId/qr')({
  loader: async ({ params }) => getEvent(params.eventId),
  component: AdminQrPage,
})

function AdminQrPage() {
  const event = Route.useLoaderData()
  if (!event) return null
  return (
    <div className="p-8">
      <h1 className="font-(--font-display) text-2xl text-(--color-fg) mb-4">
        Cetak QR untuk {event.brideName} &amp; {event.groomName}
      </h1>
      <QrCodeCard eventId={event.id} slug={event.slug} />
    </div>
  )
}
