import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { signIn } from '../server/auth/auth-client'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const { error } = await signIn.email({ email, password })
    if (error) setError(error.message ?? 'Login gagal')
    else window.location.href = '/dashboard'
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-16 flex flex-col gap-4">
      <h1 className="font-(--font-display) text-2xl text-(--color-fg)">Masuk</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required className="border rounded px-3 py-2" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Kata sandi" required className="border rounded px-3 py-2" />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" className="rounded-full bg-(--color-fg) text-white py-2">Masuk</button>
    </form>
  )
}
