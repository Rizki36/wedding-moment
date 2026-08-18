import { createFileRoute } from '@tanstack/react-router'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { requireEventOwner } from '../../../../server/auth/guards'
import { getEvent } from '../../../../server/functions/events'

export const Route = createFileRoute('/_authed/dashboard/events/$eventId/')({
  beforeLoad: async ({ params }) => {
    await requireEventOwner(getRequestHeaders(), params.eventId)
  },
  loader: async ({ params }) => getEvent(params.eventId),
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
      {/* QrCodeCard (Task 10), frames link (Task 9), submissions link (Task 16) added in later tasks */}
    </div>
  )
}
