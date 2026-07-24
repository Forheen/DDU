import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { buildDDU } from '../../services/dduService.js'
import { StatusChip } from '../../components/StatusChip.jsx'
import { CategoryTag } from '../../components/CategoryTag.jsx'
import { PendingBanner } from '../../components/PendingBanner.jsx'

function Row({ to, title, status, meta, secondary }) {
  return (
    <div className="rounded-xl border border-linestrong bg-surface p-3">
      <Link to={to} className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold">{title}</div>
          <div className="text-[11px] text-inksoft">{meta}</div>
        </div>
        <StatusChip status={status} />
      </Link>
      {secondary && (
        <Link to={secondary.to} className="mt-1.5 inline-block text-[11px] font-bold text-teal">
          {secondary.label} →
        </Link>
      )}
    </div>
  )
}

export function ProductProfile() {
  const { vatikaId, productId } = useParams()
  const [ddu, setDdu] = useState(null)

  async function reload() {
    setDdu(await buildDDU(vatikaId, productId))
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vatikaId, productId])

  if (!ddu) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  const base = `/vatikas/${vatikaId}/products/${productId}`
  const stage2Summary = ddu.stage2ByVatika
    .map((v) => `${ddu.vatikas.find((x) => x.id === v.vatikaId)?.name}: ${v.assessment ? v.status : 'not started'}`)
    .join(' · ')

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-sm font-bold text-inksoft">{ddu.vatika?.name}</div>
        <h1 className="font-display text-xl font-bold">
          {ddu.product?.icon} {ddu.product?.name}
        </h1>
        {ddu.product && <CategoryTag category={ddu.product.category} />}
        {ddu.isMerged && (
          <div className="mt-2 rounded-lg bg-tealsoft px-3 py-2 text-xs font-bold text-teal">
            🔗 Merged DDU across {ddu.vatikas.map((v) => v.name).join(' + ')}
          </div>
        )}
      </div>

      <PendingBanner ddu={ddu} />

      <div className="flex flex-col gap-2">
        <Row
          to={`/vatikas/${vatikaId}/stage1/market/new?productId=${productId}`}
          title="Stage 1 · Opportunity Mapping"
          status={ddu.stage1Status}
          meta={`${ddu.marketEntries.length} market row(s) · ${ddu.institutionEntries.length} institution row(s)`}
          secondary={{ to: `/vatikas/${vatikaId}/stage1/institution/new?productId=${productId}`, label: 'Log an institution instead' }}
        />
        <Row to={`${base}/stage2`} title="Stage 2 · Production Assessment" status={ddu.stage2Status} meta={stage2Summary} />
        <Row
          to={`${base}/cost-economics`}
          title="Cost Economics"
          status={ddu.costEconomicsStatus}
          meta={ddu.costEconomics ? (ddu.costEconomics.procurementDecision || 'Awaiting prices') : 'Not started'}
        />
        <Row
          to={`${base}/stage3`}
          title="Stage 3 · DDU Design"
          status={ddu.stage3Status}
          meta={`${ddu.buyers.length} buyer(s) · ${ddu.supplierLines.length} supplier(s)`}
        />
        <Row to={`${base}/summary`} title="DDU Summary" status={ddu.isLive ? 'done' : 'partial'} meta="Auto-calculated, read only" />
      </div>
    </div>
  )
}
