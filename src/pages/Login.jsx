import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { listUsers } from '../services/userRepository.js'
import { listDistricts } from '../services/districtRepository.js'
import { listBlocks } from '../services/blockRepository.js'
import { scopeLabel } from '../services/scopeService.js'
import { FIELD_ROLES, PORTAL, ROLES } from '../models/index.js'

const ROLE_ICON = {
  Vasuki: '👩🏽',
  Vidushi: '👩🏽‍🦱',
  SWSM: '🧑🏽‍💼',
  Mitra: '🧑🏽‍🌾',
  Dhawak: '🚲',
  Admin: '🧑🏽‍💻',
}

export function Login() {
  const [portal, setPortal] = useState(PORTAL.FIELD)
  const [users, setUsers] = useState([])
  const [districts, setDistricts] = useState([])
  const [blocks, setBlocks] = useState([])
  const [pending, setPending] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    listUsers().then(setUsers)
    listDistricts().then(setDistricts)
    listBlocks().then(setBlocks)
  }, [])

  const fieldRows = useMemo(() => {
    const rows = []
    for (const role of FIELD_ROLES) {
      for (const u of users) {
        if (u.hasRole(role)) rows.push({ user: u, role })
      }
    }
    return rows
  }, [users])

  const adminRows = useMemo(() => users.filter((u) => u.hasRole(ROLES.ADMIN)).map((u) => ({ user: u, role: ROLES.ADMIN })), [users])

  const rows = portal === PORTAL.FIELD ? fieldRows : adminRows

  async function choose(row) {
    setPending(`${row.user.id}:${row.role}`)
    await login(row.user.id, row.role)
    navigate(portal === PORTAL.ADMIN ? '/admin' : '/')
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5 py-10">
      <div className="mb-6 text-center">
        <div className="text-3xl">🌾</div>
        <h1 className="font-display mt-2 text-xl font-bold">AJA DDU Builder</h1>
        <p className="mt-1 text-sm text-inksoft">Who is signing in, and as what?</p>
        <a
          href="/design.html"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-linestrong bg-surface px-3 py-1.5 text-[11px] font-bold text-teal"
        >
          📄 View the design artifact
        </a>
      </div>

      <div className="mb-5 flex gap-2 rounded-xl border border-linestrong bg-surface p-1">
        <button
          onClick={() => setPortal(PORTAL.FIELD)}
          className={`flex-1 rounded-lg py-2 text-sm font-bold ${portal === PORTAL.FIELD ? 'bg-accent text-accentink' : 'text-inksoft'}`}
        >
          Field App
        </button>
        <button
          onClick={() => setPortal(PORTAL.ADMIN)}
          className={`flex-1 rounded-lg py-2 text-sm font-bold ${portal === PORTAL.ADMIN ? 'bg-teal text-white' : 'text-inksoft'}`}
        >
          Admin Console
        </button>
      </div>

      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-inkfaint">
        {portal === PORTAL.FIELD ? 'Every row shows the role you would act as' : 'Backend / operations sign-in'}
      </p>

      <div className="flex flex-col gap-2">
        {rows.map((row) => {
          const key = `${row.user.id}:${row.role}`
          return (
            <button
              key={key}
              onClick={() => choose(row)}
              disabled={pending === key}
              className="flex items-center justify-between rounded-xl border border-linestrong bg-surface px-4 py-3 text-left disabled:opacity-50"
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">{ROLE_ICON[row.role] || '👤'}</span>
                <span>
                  <span className="block text-sm font-bold text-ink">{row.user.name}</span>
                  <span className="block text-[11px] text-inksoft">
                    {row.role === ROLES.ADMIN ? 'Sees everything' : scopeLabel(row.user.scopeFor(row.role), { districts, blocks })}
                  </span>
                </span>
              </span>
              <span className="rounded-full bg-accentsoft px-2.5 py-1 text-[11px] font-bold text-accentink">{row.role}</span>
            </button>
          )
        })}
        {rows.length === 0 && <div className="text-center text-sm text-inkfaint">Loading users…</div>}
      </div>
    </div>
  )
}
