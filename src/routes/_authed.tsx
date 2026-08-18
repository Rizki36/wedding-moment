import { createFileRoute, Outlet } from '@tanstack/react-router'
import { getSessionOrRedirect } from '../server/auth/guards'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const session = await getSessionOrRedirect()
    return { session }
  },
  component: () => <Outlet />,
})
