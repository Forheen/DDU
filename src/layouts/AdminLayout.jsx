import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

const NAV = [
  { to: '/admin', label: 'All DDUs', end: true },
  { to: '/admin/blocks', label: 'Blocks & Vatikas' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/users', label: 'Users & roles' },
  { to: '/admin/assignments', label: 'Assignment policy' },
]

export function AdminLayout() {
  const { currentUser, logout } = useAuth()

  return (
    <div className="min-h-screen bg-bg md:flex">
      <aside className="border-b border-line bg-teal text-white md:block md:w-56 md:shrink-0 md:border-b-0 md:border-r md:px-4 md:py-5">
        <div className="flex items-center justify-between px-4 py-3 md:px-0 md:py-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🌾</span>
              <div className="font-display text-sm font-bold">AJA DDU Builder</div>
            </div>
            <div className="mt-0.5 text-[11px] opacity-75">Admin console · {currentUser?.name}</div>
          </div>
          <button onClick={logout} className="rounded-md border border-white/30 px-2.5 py-1.5 text-[11px] font-bold opacity-90 md:hidden">
            Log out
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 md:mt-6 md:flex-col md:gap-1 md:overflow-visible md:px-0 md:pb-0">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold md:text-sm ${isActive ? 'bg-white/15' : 'opacity-85 hover:opacity-100'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="hidden text-left text-xs font-bold opacity-75 md:mt-8 md:block md:px-0">
          Log out
        </button>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
