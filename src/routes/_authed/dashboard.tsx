import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requirePengantin } from '../../server/auth/guards'

export const Route = createFileRoute('/_authed/dashboard')({
  beforeLoad: async () => {
    const session = await requirePengantin()
    return { session }
  },
  component: () => <Outlet />,
})
