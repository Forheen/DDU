import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { buildDDU } from '../../services/dduService.js'
import { PendingBanner } from '../../components/PendingBanner.jsx'
import { StatusChip } from '../../components/StatusChip.jsx'

const money = (n) => (n == null ? '—' : `₹${n.toFixed(0)}`)

function WaterfallBar({ label, value, total, color }) {
  const pct = total ? Math.max(2, (value / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 flex-shrink-0 font-bold text-inksoft">{label}</span>
      <div className="h-3.5 flex-1 overflow-hidden rounded bg-line">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-14 flex-shrink-0 text-right font-bold tabular">{money(value)}</span>
    </div>
  )
}

export function DDUSummary() {
  const { vatikaId, productId } = useParams()
  const [ddu, setDdu] = useState(null)

  useEffect(() => {
    buildDDU(vatikaId, productId).then(setDdu)
  }, [vatikaId, productId])

  if (!ddu) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  const wf = ddu.marginWaterfall

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-sm font-bold text-inksoft">{ddu.vatika?.name}</div>
        <h1 className="font-display text-xl font-bold">
          {ddu.product?.icon} {ddu.product?.name} — DDU Summary
        </h1>
      </div>

      <PendingBanner ddu={ddu} />

      <div className="grid grid-cols-2 gap-2">
        <StageMini label="Stage 1" status={ddu.stage1Status} />
        <StageMini label="Stage 2" status={ddu.stage2Status} />
        <StageMini label="Cost Economics" status={ddu.costEconomicsStatus} />
        <StageMini label="Stage 3" status={ddu.stage3Status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <Figure label="Monthly demand" value={ddu.totalMonthlyDemand} />
        <Figure label="Monthly capacity" value={ddu.monthlyCapacity} />
        <Figure label="Capacity used" value={ddu.capacityUtilisationPct != null ? `${ddu.capacityUtilisationPct.toFixed(0)}%` : '—'} raw />
        <Figure label="Monthly profit" value={ddu.monthlyProfit} money />
      </div>

      {wf && (
        <div className="rounded-2xl border border-linestrong bg-surface p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-inkfaint">Where the rupee goes</div>
          <div className="flex flex-col gap-2">
            <WaterfallBar label="Producer" value={wf.producer} total={wf.mrp} color="bg-accent" />
            <WaterfallBar label="Dhawak" value={wf.dhawakRs} total={wf.mrp} color="bg-good" />
            <WaterfallBar label="Vasuki" value={wf.vasukiRs} total={wf.mrp} color="bg-teal" />
            <WaterfallBar label="Retailer" value={wf.retailerRs} total={wf.mrp} color="bg-warn" />
            <div className="mt-1 flex justify-between border-t border-line pt-2 text-sm font-bold">
              <span>Retail MRP</span>
              <span className="tabular">{money(wf.mrp)}</span>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-[11px] text-inkfaint">All figures calculated for you — nothing here was typed in directly.</p>
    </div>
  )
}

function StageMini({ label, status }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2 text-xs font-bold">
      {label}
      <StatusChip status={status} />
    </div>
  )
}

function Figure({ label, value, money: isMoney, raw }) {
  const display = raw ? value : isMoney ? money(value) : value ?? '—'
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="text-lg font-bold tabular">{display}</div>
      <div className="text-[10px] font-bold text-inksoft">{label}</div>
    </div>
  )
}
