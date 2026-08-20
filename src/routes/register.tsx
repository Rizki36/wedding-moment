import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { signUp } from '../server/auth/auth-client'
import { Button } from '#/components/ui/Button'

export const Route = createFileRoute('/register')({ component: RegisterPage })

const inputClass =
  'border-b-2 border-(--color-outline-variant) bg-(--color-surface-container-low) rounded px-4 py-3 text-(--color-on-surface) focus:border-(--color-primary) focus:outline-none transition-colors'

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await signUp.email({ name, email, password })
    if (error) setError(error.message ?? 'Registrasi gagal')
    else window.location.href = '/dashboard'
  }

  return (
    <main className="bg-(--color-surface) min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="font-(--font-display) text-3xl text-(--color-on-surface) text-center mb-2">
          Daftar sebagai Pengantin
        </h1>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama"
          required
          className={inputClass}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          required
          className={inputClass}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Kata sandi"
          required
          className={inputClass}
        />
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <Button type="submit" className="mt-2">
          Daftar
        </Button>
      </form>
    </main>
  )
}
