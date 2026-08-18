import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { createEventFn } from '../../../server/functions/events'

export const Route = createFileRoute('/_authed/dashboard/events/new')({ component: NewEventPage })

function NewEventPage() {
  const { session } = Route.useRouteContext()
  const navigate = useNavigate()
  const [brideName, setBrideName] = useState('')
  const [groomName, setGroomName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [venue, setVenue] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const event = await createEventFn({
        data: { ownerId: session.user.id, brideName, groomName, eventDate, venue },
      })
      navigate({ to: '/dashboard/events/$eventId', params: { eventId: event.id } })
    } catch {
      setError('Gagal membuat acara')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-12 flex flex-col gap-4 p-8">
      <h1 className="font-(--font-display) text-2xl text-(--color-fg)">Buat Acara Baru</h1>
      <input
        value={brideName}
        onChange={(e) => setBrideName(e.target.value)}
        placeholder="Nama Pengantin Wanita"
        required
        className="border rounded px-3 py-2"
      />
      <input
        value={groomName}
        onChange={(e) => setGroomName(e.target.value)}
        placeholder="Nama Pengantin Pria"
        required
        className="border rounded px-3 py-2"
      />
      <input
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        type="date"
        required
        className="border rounded px-3 py-2"
      />
      <input
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        placeholder="Lokasi (opsional)"
        className="border rounded px-3 py-2"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" className="rounded-full bg-(--color-fg) text-white py-2">
        Simpan
      </button>
    </form>
  )
}
