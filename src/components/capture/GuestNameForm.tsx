import { useState } from 'react'

export function GuestNameForm({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim()) onSubmit(name.trim())
      }}
      className="flex flex-col gap-4 p-6"
    >
      <label className="font-(--font-display) text-xl text-(--color-fg)">Siapa nama Anda?</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama Anda"
        required
        className="border rounded-full px-4 py-3"
      />
      <button type="submit" className="rounded-full bg-(--color-fg) text-white py-3">
        Lanjut
      </button>
    </form>
  )
}
