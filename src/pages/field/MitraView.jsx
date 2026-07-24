import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { getAllDDUs } from '../../services/dduService.js'
import { expandScopeToVatikaIds } from '../../services/scopeService.js'
import { StatusChip } from '../../components/StatusChip.jsx'
import { SummaryStrip } from '../../components/SummaryStrip.jsx'
import { ROLES } from '../../models/index.js'

export function MitraView() {
  const { currentUser } = useAuth()
  const [ddus, setDdus] = useState(null)

  useEffect(() => {
    async function load() {
      const myVatikaIds = await expandScopeToVatikaIds(currentUser.scopeFor(ROLES.MITRA))
      const all = await getAllDDUs()
      const relevant = all.filter(
        (d) => d.rolesRows.some((r) => r.mitraId === currentUser.id) || d.vatikaIds.some((vid) => myVatikaIds.includes(vid)),
      )
      setDdus(relevant)
    }
    load()
  }, [currentUser])

  if (!ddus) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  const assignedCount = ddus.filter((d) => d.rolesRows.some((r) => r.mitraId === currentUser.id)).length
  const liveCount = ddus.filter((d) => d.isLive).length
  const supportCount = ddus.filter((d) => [...d.assessments.values()].filter(Boolean).some((a) => a.externalSupportNeeded.length > 0)).length

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-xl font-bold">My assigned DDUs</h1>
        <p className="text-sm text-inksoft">Read-only — support needs and activation status.</p>
      </div>

      <SummaryStrip
        items={[
          { label: 'Assigned to me', value: assignedCount, tone: 'accent' },
          { label: 'Live', value: liveCount, tone: 'good' },
          { label: 'Need support', value: supportCount, tone: 'warn' },
        ]}
      />

      <div className="flex flex-col gap-2">
        {ddus.map((d) => {
          const assignedToMe = d.rolesRows.some((r) => r.mitraId === currentUser.id)
          const supportNeeded = [...new Set([...d.assessments.values()].filter(Boolean).flatMap((a) => a.externalSupportNeeded))]
          return (
            <Link key={d.id} to={`/vatikas/${d.vatikaId}/products/${d.productId}`} className="rounded-xl border border-linestrong bg-surface p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold">{d.product?.icon} {d.product?.name}</div>
                  <div className="text-[11px] text-inksoft">{d.vatikas.map((v) => v.name).join(' + ')}</div>
                </div>
                <StatusChip status={assignedToMe ? 'done' : 'missing'}>{assignedToMe ? 'Assigned to me' : 'Unassigned'}</StatusChip>
              </div>
              {supportNeeded.length > 0 && (
                <div className="mt-2 text-[11px] text-inksoft">
                  Support needed: <span className="font-bold text-ink">{supportNeeded.join(', ')}</span>
                </div>
              )}
            </Link>
          )
        })}
        {ddus.length === 0 && <div className="text-sm text-inkfaint">Nothing assigned yet.</div>}
      </div>
    </div>
  )
}
