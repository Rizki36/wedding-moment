import { createFileRoute, Outlet } from '@tanstack/react-router'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { getSessionOrRedirect } from '../server/auth/guards'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const session = await getSessionOrRedirect(getRequestHeaders())
    return { session }
  },
  component: () => <Outlet />,
})
