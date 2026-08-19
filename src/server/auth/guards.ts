import { createServerOnlyFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { redirect } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { auth } from './auth'
import { db } from '../db/client'
import { events } from '../db/schema'

/**
 * Reading the current request's headers touches TanStack Start's
 * AsyncLocalStorage-backed request context, which only exists inside a real
 * Start server request (a route's `beforeLoad`/`loader`, or a
 * `createServerFn` handler). Statically importing `getRequestHeaders` from
 * '@tanstack/react-start/server' into any file that ends up in the
 * client-bundled route tree (e.g. a route file that has both `beforeLoad`
 * and `component`) trips TanStack Start's import-protection build check —
 * confirmed via `pnpm run build` failing on `_authed.tsx`, `dashboard.tsx`,
 * `admin.tsx`, `events.$eventId/index.tsx`, `events.$eventId/settings.tsx`,
 * plus the two `createServerFn`-hosting files `events.ts`/`users.ts` — even
 * though the call only ever executes server-side at runtime.
 *
 * Wrapping the call in `createServerOnlyFn` keeps this the only file that
 * statically imports '@tanstack/react-start/server', and has the compiler
 * strip the wrapped function body (and this import) out of any client build
 * that pulls in this module. Per TanStack Start's import-protection guide:
 * "wrap the helper in createServerOnlyFn, which ensures it only runs on the
 * server and is removed from client builds along with its associated
 * server-only imports."
 * (https://tanstack.com/start/latest/docs/framework/react/guide/import-protection.md)
 */
const getAmbientHeaders = createServerOnlyFn(() => getRequestHeaders())

/**
 * `headers` is optional and defaults to the current request's headers via
 * `getAmbientHeaders()` above — every real call site (route `beforeLoad`s,
 * `createServerFn` handlers) calls these guards with no argument. The
 * parameter is kept (rather than dropped entirely) so tests can inject a
 * synthetic `Headers` — including a real signed-in user's session cookie —
 * to exercise unauthenticated/wrong-role/wrong-owner rejection paths
 * without a live Start server request context, which
 * `getAmbientHeaders()`/`getRequestHeaders()` requires and vitest does not
 * provide (confirmed: calling `getRequestHeaders()` outside a real Start
 * request throws "No StartEvent found in AsyncLocalStorage").
 *
 * Each guard below is itself wrapped in `createServerOnlyFn`. `auth` (from
 * `./auth`) and `db` (from `../db/client`) are regular local modules, not
 * one of TanStack Start's recognized server-only packages, so the compiler
 * won't flag them — but `auth.ts` eagerly builds a Better Auth instance via
 * `drizzleAdapter(db, ...)` at module scope, and `db/client.ts` eagerly
 * calls `neon(process.env.DATABASE_URL!)` at module scope. If either import
 * stays reachable from client-bundled route files (e.g. `_authed.tsx`,
 * `dashboard.tsx`, `admin.tsx`, the `events.$eventId/*` routes — all of
 * which have both `beforeLoad` and `component`), that module-scope code
 * runs in the browser, where `process.env.DATABASE_URL` is undefined, and
 * `neon()` throws immediately on import — crashing hydration for the whole
 * app, not just the guard call. Per the import-protection guide, wrapping a
 * helper in `createServerOnlyFn` removes it "from client builds along with
 * its associated server-only imports" — so keeping `auth`/`db` usage
 * exclusively inside these wrapped closures (rather than in top-level
 * `async function`s) lets the compiler prune both imports, and everything
 * they pull in, from the client bundle instead of just deferring them.
 */
export const getSessionOrRedirect = createServerOnlyFn(async (headers?: Headers) => {
  const session = await auth.api.getSession({ headers: headers ?? getAmbientHeaders() })
  if (!session) throw redirect({ to: '/login' })
  return session
})

export const requireAdmin = createServerOnlyFn(async (headers?: Headers) => {
  const session = await getSessionOrRedirect(headers)
  if (session.user.role !== 'admin') throw redirect({ to: '/dashboard' })
  return session
})

export const requirePengantin = createServerOnlyFn(async (headers?: Headers) => {
  const session = await getSessionOrRedirect(headers)
  if (session.user.role !== 'pengantin' && session.user.role !== 'admin') throw redirect({ to: '/login' })
  return session
})

export const requireEventOwner = createServerOnlyFn(async (eventId: string, headers?: Headers) => {
  const session = await requirePengantin(headers)
  if (session.user.role === 'admin') return session
  const [event] = await db.select().from(events).where(eq(events.id, eventId))
  if (!event || event.ownerId !== session.user.id) throw redirect({ to: '/dashboard' })
  return session
})
