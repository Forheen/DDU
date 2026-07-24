import { useEffect, useState } from 'react'
import { listUsers, updateUserRoleScope } from '../../services/userRepository.js'
import { listDistricts } from '../../services/districtRepository.js'
import { listBlocks } from '../../services/blockRepository.js'
import { listVatikas } from '../../services/vatikaRepository.js'
import { ROLES } from '../../models/index.js'

// Level is fixed per role — Admin assigns WHICH districts/blocks/Vatikas, never the level itself.
const LEVEL_BY_ROLE = { [ROLES.DHAWAK]: 'district', [ROLES.VASUKI]: 'block', [ROLES.VIDUSHI]: 'block', [ROLES.SWSM]: 'vatika', [ROLES.MITRA]: 'vatika' }

function MultiCheck({ options, selected, onChange }) {
  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => toggle(o.id)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
            selected.includes(o.id) ? 'bg-accent text-accentink' : 'border border-linestrong text-inksoft'
          }`}
        >
          {o.name}
        </button>
      ))}
      {options.length === 0 && <span className="text-[11px] text-inkfaint">Nothing to assign at this level.</span>}
    </div>
  )
}

// Saves immediately on every toggle — no separate Save step to forget, same
// live-update pattern as Cost Economics elsewhere in the app.
function RoleAssignmentRow({ user, role, districts, blocks, vatikas, onSave }) {
  const level = LEVEL_BY_ROLE[role]
  const scope = user.scopeFor(role)
  const [ids, setIds] = useState(scope?.ids || [])
  const [status, setStatus] = useState('idle') // idle | saving | saved

  const options = level === 'district' ? districts : level === 'block' ? blocks : vatikas

  async function change(nextIds) {
    setIds(nextIds)
    setStatus('saving')
    await onSave(user.id, role, nextIds)
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 1200)
  }

  return (
    <div className="rounded-lg border border-line bg-bg p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-teal">
          {role} <span className="font-normal text-inkfaint">· {level} level</span>
        </span>
        <span className="text-[10px] font-bold text-good">{status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : ''}</span>
      </div>
      <MultiCheck options={options} selected={ids} onChange={change} />
    </div>
  )
}

export function AdminAssignments() {
  const [users, setUsers] = useState(null)
  const [districts, setDistricts] = useState([])
  const [blocks, setBlocks] = useState([])
  const [vatikas, setVatikas] = useState([])

  async function reload() {
    setUsers(await listUsers())
  }

  useEffect(() => {
    reload()
    listDistricts().then(setDistricts)
    listBlocks().then(setBlocks)
    listVatikas().then(setVatikas)
  }, [])

  async function saveScope(userId, role, ids) {
    await updateUserRoleScope(userId, role, ids)
  }

  if (!users) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Assignment policy</h1>
        <p className="text-sm text-inksoft">
          Who covers what, per role. The level is fixed by role (Dhawak: district, Vasuki/Vidushi: block, SWSM/Mitra: village) — you
          choose which specific ones. A person can cover more than one — a second Block for a Vasuki, an extra village for a Mitra.
          Every tap here saves immediately.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {users
          .filter((u) => u.roles.some((r) => LEVEL_BY_ROLE[r]))
          .map((u) => (
            <div key={u.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="mb-3 text-sm font-bold">{u.name}</div>
              <div className="flex flex-col gap-2">
                {u.roles
                  .filter((r) => LEVEL_BY_ROLE[r])
                  .map((r) => (
                    <RoleAssignmentRow key={r} user={u} role={r} districts={districts} blocks={blocks} vatikas={vatikas} onSave={saveScope} />
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
