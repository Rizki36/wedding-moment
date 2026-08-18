import { createFileRoute, Link } from '@tanstack/react-router'
import { listMyEvents } from '../../../server/functions/events'

export const Route = createFileRoute('/_authed/dashboard/')({
  loader: async ({ context }) => listMyEvents(context.session.user.id),
  component: DashboardHome,
})

function DashboardHome() {
  const events = Route.useLoaderData()
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-(--font-display) text-3xl text-(--color-fg)">Acara Saya</h1>
        <Link to="/dashboard/events/new" className="rounded-full bg-(--color-fg) text-white px-4 py-2">
          Buat Acara
        </Link>
      </div>
      <ul className="grid gap-4">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              to="/dashboard/events/$eventId"
              params={{ eventId: event.id }}
              className="block border rounded-2xl p-4"
            >
              {event.brideName} &amp; {event.groomName} — {event.eventDate}
            </Link>
          </li>
        ))}
      </ul>
      {events.length === 0 && <p className="text-(--color-fg-muted)">Belum ada acara.</p>}
    </div>
  )
}
