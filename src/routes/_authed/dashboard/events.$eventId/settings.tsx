import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { requireEventOwner } from '../../../../server/auth/guards'
import { getEventFn, updateEventFn } from '../../../../server/functions/events'

export const Route = createFileRoute('/_authed/dashboard/events/$eventId/settings')({
  beforeLoad: async ({ params }) => {
    await requireEventOwner(params.eventId)
  },
  loader: async ({ params }) => getEventFn({ data: params.eventId }),
  component: EventSettings,
})

function EventSettings() {
  const event = Route.useLoaderData()
  const [venue, setVenue] = useState(event?.venue ?? '')
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!event) return
    await updateEventFn({ data: { eventId: event.id, venue } })
    setSaved(true)
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-md flex flex-col gap-4">
      <h1 className="font-(--font-display) text-2xl text-(--color-fg)">Pengaturan Acara</h1>
      <input
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        placeholder="Lokasi"
        className="border rounded px-3 py-2"
      />
      {saved && <p className="text-sm text-(--color-fg-muted)">Tersimpan.</p>}
      <button type="submit" className="rounded-full bg-(--color-fg) text-white py-2">
        Simpan
      </button>
    </form>
  )
}
