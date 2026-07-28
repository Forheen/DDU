import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { buildDDU } from '../../services/dduService.js'
import { listUsers } from '../../services/userRepository.js'
import { StatusChip } from '../../components/StatusChip.jsx'
import { CategoryTag } from '../../components/CategoryTag.jsx'
import { PendingBanner } from '../../components/PendingBanner.jsx'
import { Stage1Recap, Stage2Recap, CostEconomicsRecap, Stage3Recap } from '../../components/StageRecaps.jsx'

function StageSection({ to, title, status, secondary, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-linestrong bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <button className="flex flex-1 items-center justify-between text-left" onClick={() => setOpen((o) => !o)}>
          <div className="text-sm font-bold">{title}</div>
          <div className="flex items-center gap-2">
            <StatusChip status={status} />
            <span className="text-xs text-inkfaint">{open ? '▾' : '▸'}</span>
          </div>
        </button>
      </div>
      {open && (
        <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
          {children}
          <div className="mt-1 flex flex-wrap gap-3">
            <Link to={to} className="text-[11px] font-bold text-teal">
              Open / edit →
            </Link>
            {secondary && (
              <Link to={secondary.to} className="text-[11px] font-bold text-teal">
                {secondary.label} →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function ProductProfile() {
  const { vatikaId, productId } = useParams()
  const [ddu, setDdu] = useState(null)
  const [usersById, setUsersById] = useState({})

  async function reload() {
    setDdu(await buildDDU(vatikaId, productId))
    const users = await listUsers()
    setUsersById(Object.fromEntries(users.map((u) => [u.id, u])))
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vatikaId, productId])

  if (!ddu) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  const base = `/vatikas/${vatikaId}/products/${productId}`

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

      <p className="text-[11px] text-inkfaint">
        Tap any section to see exactly what's been filled so far, by whom — everyone can see this, even sections you can't edit.
      </p>

      <div className="flex flex-col gap-2">
        <StageSection
          to={`/vatikas/${vatikaId}/stage1/market/new?productId=${productId}`}
          secondary={{ to: `/vatikas/${vatikaId}/stage1/institution/new?productId=${productId}`, label: 'Log an institution instead' }}
          title="Stage 1 · Opportunity Mapping"
          status={ddu.stage1Status}
          defaultOpen={ddu.stage1Status !== 'missing'}
        >
          <Stage1Recap marketEntries={ddu.marketEntries} institutionEntries={ddu.institutionEntries} usersById={usersById} />
        </StageSection>

        <StageSection to={`${base}/stage2`} title="Stage 2 · Production Assessment" status={ddu.stage2Status} defaultOpen={ddu.stage2Status !== 'missing'}>
          <div className="flex flex-col gap-2">
            {ddu.stage2ByVatika.map(({ vatikaId: vid, assessment }) => (
              <Stage2Recap
                key={vid}
                assessment={assessment}
                vatikaName={ddu.isMerged ? ddu.vatikas.find((v) => v.id === vid)?.name : null}
                usersById={usersById}
              />
            ))}
          </div>
        </StageSection>

        <StageSection to={`${base}/cost-economics`} title="Cost Economics" status={ddu.costEconomicsStatus} defaultOpen={ddu.costEconomicsStatus !== 'missing'}>
          <CostEconomicsRecap costEconomics={ddu.costEconomics} usersById={usersById} />
        </StageSection>

        <StageSection to={`${base}/stage3`} title="Stage 3 · DDU Design" status={ddu.stage3Status} defaultOpen={ddu.stage3Status !== 'missing'}>
          <Stage3Recap ddu={ddu} usersById={usersById} />
        </StageSection>

        <StageSection to={`${base}/summary`} title="DDU Summary" status={ddu.isLive ? 'done' : 'partial'} defaultOpen={false}>
          <div className="text-xs text-inkfaint">Auto-calculated overview — demand, capacity, profit and margin split.</div>
        </StageSection>
      </div>
    </div>
  )
}
