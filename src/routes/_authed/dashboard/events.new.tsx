import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { createEventFn } from '../../../server/functions/events'
import { Button } from '#/components/ui/Button'

export const Route = createFileRoute('/_authed/dashboard/events/new')({ component: NewEventPage })

const inputClass =
  'border-b-2 border-(--color-outline-variant) bg-(--color-surface-container-low) rounded px-3 py-2 text-(--color-on-surface) focus:border-(--color-primary) focus:outline-none transition-colors'

function NewEventPage() {
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
        data: { brideName, groomName, eventDate, venue },
      })
      navigate({ to: '/dashboard/events/$eventId', params: { eventId: event.id } })
    } catch {
      setError('Gagal membuat acara')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-12 flex flex-col gap-4 p-8">
      <h1 className="font-(--font-display) text-2xl text-(--color-on-surface)">Buat Acara Baru</h1>
      <input
        value={brideName}
        onChange={(e) => setBrideName(e.target.value)}
        placeholder="Nama Pengantin Wanita"
        required
        className={inputClass}
      />
      <input
        value={groomName}
        onChange={(e) => setGroomName(e.target.value)}
        placeholder="Nama Pengantin Pria"
        required
        className={inputClass}
      />
      <input
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        type="date"
        required
        className={inputClass}
      />
      <input
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        placeholder="Lokasi (opsional)"
        className={inputClass}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit">Simpan</Button>
    </form>
  )
}
