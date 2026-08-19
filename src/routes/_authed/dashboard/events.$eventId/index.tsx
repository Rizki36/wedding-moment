import { createFileRoute, Link } from '@tanstack/react-router'
import { requireEventOwnerFn } from '../../../../server/auth/guards'
import { getEventFn } from '../../../../server/functions/events'
import { QrCodeCard } from '../../../../components/dashboard/QrCodeCard'

export const Route = createFileRoute('/_authed/dashboard/events/$eventId/')({
  beforeLoad: async ({ params }) => {
    await requireEventOwnerFn({ data: params.eventId })
  },
  loader: async ({ params }) => getEventFn({ data: params.eventId }),
  component: EventOverview,
})

function EventOverview() {
  const event = Route.useLoaderData()
  return (
    <div className="p-8">
      <h1 className="font-(--font-display) text-2xl text-(--color-fg)">
        {event?.brideName} &amp; {event?.groomName}
      </h1>
      <p className="text-(--color-fg-muted)">
        {event?.eventDate} — {event?.venue}
      </p>
      <Link
        to="/dashboard/events/$eventId/frames"
        params={{ eventId: event?.id ?? '' }}
        className="inline-block mt-4 rounded-full border border-(--color-fg) px-4 py-2"
      >
        Kelola Bingkai
      </Link>
      <Link
        to="/dashboard/events/$eventId/submissions"
        params={{ eventId: event?.id ?? '' }}
        className="inline-block mt-4 ml-2 rounded-full border border-(--color-fg) px-4 py-2"
      >
        Lihat Ucapan Tamu
      </Link>
      {event && <QrCodeCard eventId={event.id} slug={event.slug} />}
    </div>
  )
}
