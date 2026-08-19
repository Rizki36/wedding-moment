import { createFileRoute, Link } from '@tanstack/react-router'
import { listPengantinFn } from '../../../server/functions/users'

export const Route = createFileRoute('/_authed/admin/')({
  loader: async () => listPengantinFn(),
  component: AdminHome,
})

function AdminHome() {
  const pengantinList = Route.useLoaderData()
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-(--font-display) text-3xl text-(--color-fg)">Akun Pengantin</h1>
        <Link to="/admin/pengantin/new" className="rounded-full bg-(--color-fg) text-white px-4 py-2">
          Buat Akun
        </Link>
      </div>
      <ul className="grid gap-2">
        {pengantinList.map((p) => (
          <li key={p.id}>
            <Link to="/admin/pengantin/$id" params={{ id: p.id }}>
              {p.name} — {p.email}
            </Link>
          </li>
        ))}
      </ul>
      {pengantinList.length === 0 && <p className="text-(--color-fg-muted)">Belum ada akun pengantin.</p>}
    </div>
  )
}
