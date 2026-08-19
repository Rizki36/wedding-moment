import { createFileRoute, Outlet } from '@tanstack/react-router'
import { getSessionOrRedirectFn } from '../server/auth/guards'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const session = await getSessionOrRedirectFn()
    return { session }
  },
  component: () => <Outlet />,
})
