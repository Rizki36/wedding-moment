import 'dotenv/config'
import { describe, it, expect } from 'vitest'
import { requireAdmin } from '../src/server/auth/guards'

describe('requireAdmin', () => {
  it('throws a redirect for an unauthenticated request', async () => {
    await expect(requireAdmin(new Headers())).rejects.toBeDefined()
  })
})
