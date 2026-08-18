import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { auth } from '../auth/auth'
import { requireAdmin } from '../auth/guards'
import { db } from '../db/client'
import { user } from '../db/schema'

export type CreatePengantinInput = { name: string; email: string; password: string }

/**
 * Core logic — plain async functions so they can be unit-tested directly and
 * called from route loaders (see events.ts for the rationale: TanStack Start
 * loaders always execute server-side, so calling these directly from a
 * loader that's already behind a `beforeLoad` guard is safe and matches the
 * pattern established in Task 7).
 */
export async function createPengantinAccount(input: CreatePengantinInput) {
  const result = await auth.api.signUpEmail({
    body: { name: input.name, email: input.email, password: input.password },
  })
  return result.user
}

export async function listPengantin() {
  return db.select().from(user).where(eq(user.role, 'pengantin'))
}

/**
 * Client-safe entry point used by the "Buat Akun Pengantin" form
 * (`pengantin.new.tsx`). This is a network-reachable RPC endpoint
 * independent of any route's `beforeLoad` — a caller can POST to it
 * directly without ever rendering the admin page. Route-level guards are
 * page-load gating only and do NOT protect the endpoint itself, so the
 * handler re-verifies the caller is an authenticated admin via
 * `getRequestHeaders()` before creating an account.
 */
export const createPengantinAccountFn = createServerFn({ method: 'POST' })
  .validator((input: CreatePengantinInput) => input)
  .handler(async ({ data }) => {
    await requireAdmin(getRequestHeaders())
    return createPengantinAccount(data)
  })
