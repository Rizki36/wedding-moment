import { createFileRoute } from '@tanstack/react-router'
import { getEventFn } from '../../../server/functions/events'
import { QrCodeCard } from '../../../components/dashboard/QrCodeCard'

/**
 * `requireAdmin` is already enforced by the parent `/_authed/admin` layout
 * route's `beforeLoad` (see `src/routes/_authed/admin.tsx`) — matches the
 * existing `pengantin.$id.tsx` admin route, which also has no `beforeLoad`
 * of its own. `getEventFn` itself calls `requireEventOwner`, which lets
 * admins through regardless of ownership.
 */
export const Route = createFileRoute('/_authed/admin/events/$eventId/qr')({
  loader: async ({ params }) => getEventFn({ data: params.eventId }),
  component: AdminQrPage,
})

function AdminQrPage() {
  const event = Route.useLoaderData()
  if (!event) return null
  return (
    <div className="p-8">
      <h1 className="font-(--font-display) text-2xl text-(--color-on-surface) mb-4">
        Cetak QR untuk {event.brideName} &amp; {event.groomName}
      </h1>
      <QrCodeCard eventId={event.id} slug={event.slug} />
    </div>
  )
}
