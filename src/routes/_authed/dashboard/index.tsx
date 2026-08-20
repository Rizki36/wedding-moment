import { createFileRoute, Link } from '@tanstack/react-router'
import { listMyEventsFn } from '../../../server/functions/events'
import { LinkButton } from '#/components/ui/Button'

export const Route = createFileRoute('/_authed/dashboard/')({
  loader: async () => listMyEventsFn(),
  component: DashboardHome,
})

function DashboardHome() {
  const events = Route.useLoaderData()
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-(--font-display) text-3xl text-(--color-on-surface)">Acara Saya</h1>
        <LinkButton to="/dashboard/events/new">Buat Acara</LinkButton>
      </div>
      <ul className="grid gap-4">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              to="/dashboard/events/$eventId"
              params={{ eventId: event.id }}
              className="block bg-(--color-surface-container-lowest) rounded-lg shadow-[0_4px_20px_rgba(45,71,57,0.04)] p-4 text-(--color-on-surface)"
            >
              {event.brideName} &amp; {event.groomName} — {event.eventDate}
            </Link>
          </li>
        ))}
      </ul>
      {events.length === 0 && <p className="text-(--color-on-surface-variant)">Belum ada acara.</p>}
    </div>
  )
}
