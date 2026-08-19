import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requirePengantinFn } from '../../server/auth/guards'

export const Route = createFileRoute('/_authed/dashboard')({
  beforeLoad: async () => {
    const session = await requirePengantinFn()
    return { session }
  },
  component: () => <Outlet />,
})
