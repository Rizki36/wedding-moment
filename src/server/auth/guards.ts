import { redirect } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { auth } from './auth'
import { db } from '../db/client'
import { events } from '../db/schema'

export async function getSessionOrRedirect(headers: Headers) {
  const session = await auth.api.getSession({ headers })
  if (!session) throw redirect({ to: '/login' })
  return session
}

export async function requireAdmin(headers: Headers) {
  const session = await getSessionOrRedirect(headers)
  if (session.user.role !== 'admin') throw redirect({ to: '/dashboard' })
  return session
}

export async function requirePengantin(headers: Headers) {
  const session = await getSessionOrRedirect(headers)
  if (session.user.role !== 'pengantin' && session.user.role !== 'admin') throw redirect({ to: '/login' })
  return session
}

export async function requireEventOwner(headers: Headers, eventId: string) {
  const session = await requirePengantin(headers)
  if (session.user.role === 'admin') return session
  const [event] = await db.select().from(events).where(eq(events.id, eventId))
  if (!event || event.ownerId !== session.user.id) throw redirect({ to: '/dashboard' })
  return session
}
