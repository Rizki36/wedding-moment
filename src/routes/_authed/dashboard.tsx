import { createFileRoute, Outlet } from '@tanstack/react-router'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { requirePengantin } from '../../server/auth/guards'

export const Route = createFileRoute('/_authed/dashboard')({
  beforeLoad: async () => {
    const session = await requirePengantin(getRequestHeaders())
    return { session }
  },
  component: () => <Outlet />,
})
