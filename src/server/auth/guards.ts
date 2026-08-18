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
 */
export async function getSessionOrRedirect(headers?: Headers) {
  const session = await auth.api.getSession({ headers: headers ?? getAmbientHeaders() })
  if (!session) throw redirect({ to: '/login' })
  return session
}

export async function requireAdmin(headers?: Headers) {
  const session = await getSessionOrRedirect(headers)
  if (session.user.role !== 'admin') throw redirect({ to: '/dashboard' })
  return session
}

export async function requirePengantin(headers?: Headers) {
  const session = await getSessionOrRedirect(headers)
  if (session.user.role !== 'pengantin' && session.user.role !== 'admin') throw redirect({ to: '/login' })
  return session
}

export async function requireEventOwner(eventId: string, headers?: Headers) {
  const session = await requirePengantin(headers)
  if (session.user.role === 'admin') return session
  const [event] = await db.select().from(events).where(eq(events.id, eventId))
  if (!event || event.ownerId !== session.user.id) throw redirect({ to: '/dashboard' })
  return session
}
