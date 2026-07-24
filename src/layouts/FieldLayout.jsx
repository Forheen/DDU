import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

const TABS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/blocks', label: 'Blocks', icon: '🏘️' },
  { to: '/me', label: 'Me', icon: '👤' },
]

export function FieldLayout() {
  const { currentUser, activeRole, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌾</span>
          <div>
            <div className="font-display text-sm font-bold leading-tight">AJA DDU Builder</div>
            <div className="text-[11px] leading-tight text-inksoft">Field app</div>
          </div>
        </div>
        <button
          onClick={() => navigate('/me')}
          className="flex items-center gap-2 rounded-full border border-linestrong bg-surface px-2.5 py-1"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accentsoft text-[11px] font-bold text-accentink">
            {currentUser?.name?.[0] || '?'}
          </span>
          <span className="text-xs font-bold">{activeRole}</span>
        </button>
      </header>

      <main className="mx-auto max-w-md px-4 pb-24 pt-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-line bg-surface">
        <div className="mx-auto flex max-w-md">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${
                  isActive ? 'text-accentink' : 'text-inkfaint'
                }`
              }
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </NavLink>
          ))}
          <button onClick={logout} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-bold text-inkfaint">
            <span className="text-lg">🚪</span>
            Log out
          </button>
        </div>
      </nav>
    </div>
  )
}
