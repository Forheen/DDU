import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { listDistricts } from '../../services/districtRepository.js'
import { listBlocks } from '../../services/blockRepository.js'
import { scopeLabel } from '../../services/scopeService.js'

const ROLE_LEVEL = { Vasuki: 'Block level', Vidushi: 'Block level', SWSM: 'Village level', Mitra: 'Village level', Dhawak: 'District level' }

export function Me() {
  const { currentUser, activeRole, switchRole, logout } = useAuth()
  const [districts, setDistricts] = useState([])
  const [blocks, setBlocks] = useState([])

  useEffect(() => {
    listDistricts().then(setDistricts)
    listBlocks().then(setBlocks)
  }, [])

  if (!currentUser) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-linestrong bg-surface p-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accentsoft text-xl font-bold text-accentink">
          {currentUser.name[0]}
        </div>
        <div className="font-display mt-2 text-lg font-bold">{currentUser.name}</div>
        <div className="text-sm text-inksoft">{currentUser.phone}</div>
      </div>

      <div className="rounded-2xl border border-linestrong bg-surface p-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">Acting as</div>
        <div className="flex flex-wrap gap-2">
          {currentUser.roles.map((r) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={`rounded-full px-3 py-1.5 text-sm font-bold ${
                r === activeRole ? 'bg-accent text-accentink' : 'border border-linestrong text-inksoft'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        {currentUser.roles.length > 1 && (
          <p className="mt-2 text-[11px] text-inksoft">You hold more than one role — switch which hat you're wearing any time.</p>
        )}
      </div>

      <div className="rounded-2xl border border-linestrong bg-surface p-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">Coverage, per role</div>
        <div className="flex flex-col gap-2">
          {currentUser.roles.map((r) => (
            <div key={r} className="flex items-center justify-between text-sm">
              <span className="font-bold">{r} <span className="font-normal text-[11px] text-inkfaint">· {ROLE_LEVEL[r]}</span></span>
              <span className="text-inksoft">{scopeLabel(currentUser.scopeFor(r), { districts, blocks })}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={logout} className="rounded-xl border-2 border-crit/40 bg-critbg py-3 text-sm font-bold text-crit">
        Log out
      </button>
    </div>
  )
}
