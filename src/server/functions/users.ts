import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { auth } from '../auth/auth'
import { requireAdmin } from '../auth/guards'
import { toPlaceholderEmail } from '../auth/placeholder-email'
import { db } from '../db/client'
import { user } from '../db/schema'

export type CreatePengantinInput = { name: string; username: string; password: string }

/**
 * Core logic, each wrapped in `createServerOnlyFn` (matching `guards.ts`'s
 * pattern) rather than left as plain top-level functions. They're still
 * callable directly for unit tests — `createServerOnlyFn` only throws when
 * called from a real browser (`typeof window !== 'undefined'`), which a
 * Node/vitest environment never is, unlike a `createServerFn` handler
 * (which additionally requires a live Start request's AsyncLocalStorage
 * context). Wrapping matters here because these use `auth`/`db` directly:
 * a plain exported function using them is only safe from leaking into the
 * client bundle as long as nothing outside this file's server-only
 * boundary ends up calling it — but the compiler doesn't verify that, it
 * only prunes imports it can prove are exclusively reachable from inside a
 * `createServerOnlyFn`/`createServerFn` closure. Confirmed via `pnpm build`
 * plus `grep -r DATABASE_URL dist/client`: leaving these as plain functions
 * kept `auth`/`db` alive in the client bundle even after every call site
 * was routed through the `*Fn` wrappers below.
 */
export const createPengantinAccount = createServerOnlyFn(async (input: CreatePengantinInput) => {
  const result = await auth.api.signUpEmail({
    body: {
      name: input.name,
      email: toPlaceholderEmail(input.username),
      username: input.username,
      displayUsername: input.username,
      password: input.password,
    },
  })
  return result.user
})

export const listPengantin = createServerOnlyFn(async () => {
  return db.select().from(user).where(eq(user.role, 'pengantin'))
})

/**
 * Client-safe entry point for `admin/index.tsx`'s route `loader`. Loaders
 * run on both server and client (see `createPengantinAccountFn`'s comment
 * above for the general rationale), so calling `listPengantin` — which
 * touches `db` directly — from a loader in a client-bundled route file
 * pulls `db/client.ts` (and `auth.ts`, which `db` sits behind) into the
 * client bundle, where `neon(process.env.DATABASE_URL!)` throws on import
 * and crashes hydration app-wide. Routing it through `createServerFn`
 * mirrors `createPengantinAccountFn`: the compiler replaces this handler
 * with a client RPC stub and prunes the now-unreachable `db`/`auth`
 * imports from the client build.
 */
export const listPengantinFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return listPengantin()
})

/**
 * Client-safe entry point used by the "Buat Akun Pengantin" form
 * (`pengantin.new.tsx`). This is a network-reachable RPC endpoint
 * independent of any route's `beforeLoad` — a caller can POST to it
 * directly without ever rendering the admin page. Route-level guards are
 * page-load gating only and do NOT protect the endpoint itself, so the
 * handler re-verifies the caller is an authenticated admin before creating
 * an account. `requireAdmin` reads the current request's headers
 * internally (see `guards.ts`'s `getAmbientHeaders`), so no
 * `getRequestHeaders()` call — and no import of
 * '@tanstack/react-start/server' — is needed in this file.
 */
export const createPengantinAccountFn = createServerFn({ method: 'POST' })
  .validator((input: CreatePengantinInput) => input)
  .handler(async ({ data }) => {
    await requireAdmin()
    return createPengantinAccount(data)
  })
