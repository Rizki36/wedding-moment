import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

type DashboardShellProps = {
  userName: string
  role: 'admin' | 'pengantin'
  children: ReactNode
}

export function DashboardShell({ userName, role, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="md:flex">
      <Sidebar role={role} open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar userName={userName} role={role} onMenuClick={() => setSidebarOpen(true)} />
        {/* a plain div, not <main> — src/styles.css has a global `main` selector (42rem centered column) meant for marketing pages, which would clobber this full-width layout */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
