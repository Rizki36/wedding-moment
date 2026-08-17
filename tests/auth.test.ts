import 'dotenv/config'
import { describe, it, expect } from 'vitest'
import { auth } from '../src/server/auth/auth'

describe('better auth', () => {
  it('signs up a new pengantin and creates a session', async () => {
    const signUpResult = await auth.api.signUpEmail({
      body: { name: 'Test Pengantin', email: `test-${Date.now()}@example.com`, password: 'password123' },
    })
    expect(signUpResult.user).toBeDefined()
    expect(signUpResult.user.role).toBe('pengantin')
  })
})
