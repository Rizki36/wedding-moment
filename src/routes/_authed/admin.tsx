import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAdmin } from '../../server/auth/guards'

export const Route = createFileRoute('/_authed/admin')({
  beforeLoad: async () => {
    const session = await requireAdmin()
    return { session }
  },
  component: () => <Outlet />,
})
