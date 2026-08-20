import { Link, useLocation } from '@tanstack/react-router'

type SidebarProps = {
  role: 'admin' | 'pengantin'
  open: boolean
  onNavigate: () => void
}

const dashboardLinks = [{ to: '/dashboard', label: 'Acara Saya' } as const]
const adminLinks = [{ to: '/admin', label: 'Akun Pengantin' } as const]

export function Sidebar({ role, open, onNavigate }: SidebarProps) {
  const pathname = useLocation({ select: (l) => l.pathname })
  const isAdminSection = pathname.startsWith('/admin')
  const links = isAdminSection ? adminLinks : dashboardLinks

  return (
    <>
      {open && (
        <button
          aria-label="Tutup menu"
          onClick={onNavigate}
          className="fixed inset-0 z-20 bg-(--color-fg)/40 md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-(--color-fg)/10 bg-(--color-bg) p-6 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link to="/" className="font-(--font-display) text-xl text-(--color-fg)">
          Wedding Moment
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {links.map((link) => {
            const active = pathname === link.to || pathname.startsWith(`${link.to}/`)
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onNavigate}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active ? 'bg-(--color-fg) text-(--color-bg)' : 'text-(--color-fg-muted) hover:bg-(--color-fg)/5'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          {role === 'admin' && !isAdminSection && (
            <Link
              to="/admin"
              onClick={onNavigate}
              className="mt-4 rounded-full px-4 py-2 text-sm font-medium text-(--color-fg-muted) hover:bg-(--color-fg)/5"
            >
              Buka Panel Admin
            </Link>
          )}
          {role === 'admin' && isAdminSection && (
            <Link
              to="/dashboard"
              onClick={onNavigate}
              className="mt-4 rounded-full px-4 py-2 text-sm font-medium text-(--color-fg-muted) hover:bg-(--color-fg)/5"
            >
              Kembali ke Dashboard
            </Link>
          )}
        </nav>
      </aside>
    </>
  )
}
