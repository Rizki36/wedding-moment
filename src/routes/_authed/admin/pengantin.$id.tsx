import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/admin/pengantin/$id')({
  component: () => <Outlet />,
})
