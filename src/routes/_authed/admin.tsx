import { createFileRoute, Outlet } from '@tanstack/react-router'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { requireAdmin } from '../../server/auth/guards'

export const Route = createFileRoute('/_authed/admin')({
  beforeLoad: async () => {
    const session = await requireAdmin(getRequestHeaders())
    return { session }
  },
  component: () => <Outlet />,
})
