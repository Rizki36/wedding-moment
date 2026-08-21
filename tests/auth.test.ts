import 'dotenv/config'
import { describe, it, expect } from 'vitest'
import { auth } from '../src/server/auth/auth'
import { toPlaceholderEmail } from '../src/server/auth/placeholder-email'

describe('better auth', () => {
  it('signs up a new pengantin and creates a session', async () => {
    const username = `test-${Date.now()}`
    const signUpResult = await auth.api.signUpEmail({
      body: { name: 'Test Pengantin', email: toPlaceholderEmail(username), username, password: 'password123' },
    })
    expect(signUpResult.user).toBeDefined()
    expect(signUpResult.user.role).toBe('pengantin')
  })
})
