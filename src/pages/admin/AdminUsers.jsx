import { useEffect, useState } from 'react'
import { listUsers } from '../../services/userRepository.js'
import { listDistricts } from '../../services/districtRepository.js'
import { listBlocks } from '../../services/blockRepository.js'
import { scopeLabel } from '../../services/scopeService.js'
import { ROLES } from '../../models/index.js'

const ROLE_LEVEL = { Vasuki: 'Block', Vidushi: 'Block', SWSM: 'Village', Mitra: 'Village', Dhawak: 'District', Admin: '—' }

export function AdminUsers() {
  const [users, setUsers] = useState(null)
  const [districts, setDistricts] = useState([])
  const [blocks, setBlocks] = useState([])

  useEffect(() => {
    listUsers().then(setUsers)
    listDistricts().then(setDistricts)
    listBlocks().then(setBlocks)
  }, [])

  if (!users) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Registered field users</h1>
        <p className="text-sm text-inksoft">
          A person can hold more than one role, each at its own level — Dhawak (district), Vasuki/Vidushi (block), SWSM/Mitra (village).
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[10px] uppercase text-inkfaint">
              <th className="p-3">Name</th>
              <th className="p-3">Role · Level</th>
              <th className="p-3">Coverage</th>
              <th className="p-3">Phone</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="p-3 font-bold align-top">{u.name}</td>
                <td className="p-3">
                  <div className="flex flex-col gap-1">
                    {u.roles.map((r) => (
                      <span key={r} className="inline-flex w-fit items-center gap-1 rounded-full bg-accentsoft px-2 py-0.5 text-[11px] font-bold text-accentink">
                        {r} <span className="font-normal opacity-70">· {ROLE_LEVEL[r]}</span>
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-inksoft">
                  <div className="flex flex-col gap-1">
                    {u.roles.map((r) => (
                      <div key={r}>{r === ROLES.ADMIN ? 'Sees everything' : scopeLabel(u.scopeFor(r), { districts, blocks })}</div>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-inksoft align-top">{u.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
