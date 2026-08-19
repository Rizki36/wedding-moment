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
      <label className="font-(--font-display) text-xl text-(--color-fg)">Siapa nama Anda?</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama Anda"
        required
        className="border border-(--color-fg)/30 rounded-full px-4 py-3 bg-(--color-bg) text-(--color-fg)"
      />
      <Button type="submit">Lanjut</Button>
    </form>
  )
}
