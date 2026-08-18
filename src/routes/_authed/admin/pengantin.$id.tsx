import { createFileRoute, Link } from '@tanstack/react-router'
import { listMyEvents } from '../../../server/functions/events'

export const Route = createFileRoute('/_authed/admin/pengantin/$id')({
  loader: async ({ params }) => listMyEvents(params.id),
  component: PengantinDetail,
})

function PengantinDetail() {
  const events = Route.useLoaderData()
  return (
    <div className="p-8">
      <h1 className="font-(--font-display) text-2xl text-(--color-fg) mb-4">Acara milik pengantin ini</h1>
      <ul className="grid gap-2">
        {events.map((event) => (
          <li key={event.id}>
            <Link to="/dashboard/events/$eventId" params={{ eventId: event.id }}>
              {event.brideName} &amp; {event.groomName}
            </Link>
          </li>
        ))}
      </ul>
      {events.length === 0 && <p className="text-(--color-fg-muted)">Belum ada acara.</p>}
    </div>
  )
}
