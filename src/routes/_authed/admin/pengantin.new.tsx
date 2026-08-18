import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { createPengantinAccountFn } from '../../../server/functions/users'

export const Route = createFileRoute('/_authed/admin/pengantin/new')({ component: NewPengantinPage })

function NewPengantinPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const user = await createPengantinAccountFn({ data: { name, email, password } })
      navigate({ to: '/admin/pengantin/$id', params: { id: user.id } })
    } catch {
      setError('Gagal membuat akun')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-12 flex flex-col gap-4">
      <h1 className="font-(--font-display) text-2xl text-(--color-fg)">Buat Akun Pengantin</h1>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama"
        required
        className="border rounded px-3 py-2"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Email"
        required
        className="border rounded px-3 py-2"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Kata sandi sementara"
        required
        className="border rounded px-3 py-2"
      />
      <p className="text-sm text-(--color-fg-muted)">
        Beri tahu kredensial ini secara manual kepada pengantin (chat/telepon).
      </p>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" className="rounded-full bg-(--color-fg) text-white py-2">
        Buat Akun
      </button>
    </form>
  )
}
