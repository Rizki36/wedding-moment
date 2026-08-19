import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { signIn } from '../server/auth/auth-client'
import { Button } from '#/components/ui/Button'

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
    <main className="bg-(--color-bg) min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="font-(--font-display) text-3xl text-(--color-fg) text-center mb-2">Masuk</h1>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          required
          className="border border-(--color-fg)/30 rounded-full px-4 py-3 bg-(--color-bg) text-(--color-fg)"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Kata sandi"
          required
          className="border border-(--color-fg)/30 rounded-full px-4 py-3 bg-(--color-bg) text-(--color-fg)"
        />
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <Button type="submit" className="mt-2">
          Masuk
        </Button>
      </form>
    </main>
  )
}
