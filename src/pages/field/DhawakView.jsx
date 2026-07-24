import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { getAllDDUs } from '../../services/dduService.js'
import { expandScopeToVatikaIds } from '../../services/scopeService.js'
import { SummaryStrip } from '../../components/SummaryStrip.jsx'
import { ROLES } from '../../models/index.js'

function DeliveryCard({ ddu, buyer, marginPct }) {
  return (
    <div className="rounded-xl border border-linestrong bg-surface p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold">
          {ddu.product?.icon} {ddu.product?.name} → {buyer.name}
        </div>
        <span className="rounded-full bg-goodbg px-2.5 py-1 text-[11px] font-bold text-good">{marginPct}% margin</span>
      </div>
      <div className="text-[11px] text-inksoft">
        {ddu.vatikas.map((v) => v.name).join(' + ')} · {buyer.howOften} · {buyer.qtyPerMonth} {ddu.product?.unit}/mo
      </div>
    </div>
  )
}

export function DhawakView() {
  const { currentUser } = useAuth()
  const [rows, setRows] = useState(null)
  const [stats, setStats] = useState({ tracked: 0, live: 0, blocked: 0 })
  const [groupBy, setGroupBy] = useState('vatika')

  useEffect(() => {
    async function load() {
      const myVatikaIds = await expandScopeToVatikaIds(currentUser.scopeFor(ROLES.DHAWAK))
      const all = await getAllDDUs()
      const mine = all.filter((d) => d.vatikaIds.some((vid) => myVatikaIds.includes(vid)))
      const deliveries = []
      for (const d of mine) {
        for (const b of d.buyers) {
          if (b.whoDelivers === 'Dhawak') {
            const marginPct = d.rolesRows[0]?.deliveryMarginPct ?? 0
            deliveries.push({ ddu: d, buyer: b, marginPct })
          }
        }
      }
      setRows(deliveries)
      setStats({ tracked: mine.length, live: mine.filter((d) => d.isLive).length, blocked: mine.filter((d) => d.isBlocked).length })
    }
    load()
  }, [currentUser])

  const groups = useMemo(() => {
    if (!rows) return []
    const map = new Map()
    for (const row of rows) {
      const key = groupBy === 'vatika' ? row.ddu.vatikas.map((v) => v.name).join(' + ') : row.ddu.product?.name
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(row)
    }
    return [...map.entries()]
  }, [rows, groupBy])

  if (!rows) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-xl font-bold">This week's pickups</h1>
        <p className="text-sm text-inksoft">Deliveries assigned to Dhawak, across your district.</p>
        <div className="mt-2 rounded-lg bg-accentsoft px-3 py-2 text-xs font-bold text-accentink">
          District level means more ways to slice the same list — not just a longer one.
        </div>
      </div>

      <SummaryStrip
        items={[
          { label: 'My deliveries', value: rows.length, tone: 'accent' },
          { label: 'Products tracked', value: stats.tracked, tone: 'neutral' },
          { label: 'Live DDUs', value: stats.live, tone: 'good' },
          { label: 'Blocked', value: stats.blocked, tone: 'warn' },
        ]}
      />

      <div className="flex gap-2 rounded-lg border border-linestrong bg-surface p-1">
        <button
          onClick={() => setGroupBy('vatika')}
          className={`flex-1 rounded-md py-2 text-xs font-bold ${groupBy === 'vatika' ? 'bg-teal text-white' : 'text-inksoft'}`}
        >
          By Vatika
        </button>
        <button
          onClick={() => setGroupBy('product')}
          className={`flex-1 rounded-md py-2 text-xs font-bold ${groupBy === 'product' ? 'bg-teal text-white' : 'text-inksoft'}`}
        >
          By Product
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {groups.map(([key, items]) => (
          <div key={key}>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">{key} · {items.length}</div>
            <div className="flex flex-col gap-2">
              {items.map(({ ddu, buyer, marginPct }) => (
                <DeliveryCard key={buyer.id} ddu={ddu} buyer={buyer} marginPct={marginPct} />
              ))}
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-sm text-inkfaint">No Dhawak deliveries recorded yet.</div>}
      </div>
    </div>
  )
}
