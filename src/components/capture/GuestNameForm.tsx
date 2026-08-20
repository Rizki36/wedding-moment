import { useState } from 'react'
import { Button } from '#/components/ui/Button'

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
      <label className="font-(--font-display) text-xl text-(--color-on-surface)">Siapa nama Anda?</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama Anda"
        required
        className="border-b-2 border-(--color-outline-variant) bg-(--color-surface-container-low) rounded px-4 py-3 text-(--color-on-surface) focus:border-(--color-primary) focus:outline-none transition-colors"
      />
      <Button type="submit">Lanjut</Button>
    </form>
  )
}
