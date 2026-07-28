import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { listDistricts } from '../../services/districtRepository.js'
import { listBlocks } from '../../services/blockRepository.js'
import { getProductStatusBoard, getUnstartedProducts } from '../../services/dduService.js'
import { expandScopeToVatikaIds, scopeLabel } from '../../services/scopeService.js'
import { StatusChip } from '../../components/StatusChip.jsx'
import { CategoryTag } from '../../components/CategoryTag.jsx'
import { SummaryStrip } from '../../components/SummaryStrip.jsx'
import { ROLES } from '../../models/index.js'
import { MitraView } from './MitraView.jsx'
import { DhawakView } from './DhawakView.jsx'

const KRA_TEXT = {
  [ROLES.VASUKI]: 'Your KRA: survey new products (Stage 1) and build the DDU plan (Stage 3) once SWSM clears the price.',
  [ROLES.VIDUSHI]: 'Your KRA: survey new products (Stage 1) and build the DDU plan (Stage 3) once SWSM clears the price.',
  [ROLES.SWSM]: 'Your KRA: run the production assessment (Stage 2) and the price check (Cost Economics) for your villages.',
}

/** The single most useful real fact about this DDU right now — what's actually been filled, not just a status chip. */
function recapLine(ddu) {
  if (ddu.stage3Status !== 'missing') {
    const cap = ddu.monthlyCapacity != null ? `${ddu.monthlyCapacity}/mo capacity` : 'capacity not set'
    return `${ddu.totalMonthlyDemand} demand/mo · ${cap}${ddu.monthlyProfit != null ? ` · ₹${ddu.monthlyProfit.toFixed(0)} profit/mo` : ''}`
  }
  if (ddu.costEconomics) {
    return `${ddu.costEconomics.procurementDecision || 'Pricing in progress'} · producer ₹${ddu.costEconomics.producerSellingPrice.toFixed(2)}`
  }
  const doneAssessments = ddu.stage2ByVatika.filter((v) => v.assessment)
  if (doneAssessments.length > 0) {
    return doneAssessments
      .map((v) => {
        const a = v.assessment
        return `Priority ${a.priorityLevel ?? '—'} · ${a.criticalPass === null ? 'Critical pending' : a.criticalPass ? 'Critical pass' : 'Critical fail'}`
      })
      .join(' · ')
  }
  if (ddu.stage1Status !== 'missing') {
    return `${ddu.marketEntries.length} market row(s) · ${ddu.institutionEntries.length} institution row(s) logged`
  }
  return null
}

function DDURow({ ddu, dim }) {
  const recap = recapLine(ddu)
  return (
    <Link
      to={`/vatikas/${ddu.vatikaId}/products/${ddu.productId}`}
      className={`block rounded-xl border border-linestrong bg-surface p-3 ${dim ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold">
            {ddu.product?.icon} {ddu.product?.name}
          </div>
          <div className="text-[11px] text-inksoft">{ddu.vatikas.map((v) => v.name).join(' + ')}</div>
          {ddu.product && <CategoryTag category={ddu.product.category} />}
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusChip status={ddu.stage1Status}>1</StatusChip>
          <StatusChip status={ddu.stage2Status}>2</StatusChip>
          <StatusChip status={ddu.costEconomicsStatus}>₹</StatusChip>
          <StatusChip status={ddu.stage3Status}>3</StatusChip>
        </div>
      </div>
      {recap && <div className="mt-1.5 text-[11px] text-inksoft">{recap}</div>}
      {ddu.pendingOn && (
        <div className="mt-2 rounded-lg bg-warnbg px-2.5 py-1.5 text-[11px] font-bold text-warn">
          ⏳ Waiting on {ddu.pendingOn.role} — {ddu.pendingOn.what}
        </div>
      )}
      {ddu.isBlocked && (
        <div className="mt-2 rounded-lg bg-critbg px-2.5 py-1.5 text-[11px] font-bold text-crit">⛔ Blocked, no action pending</div>
      )}
      {ddu.isLive && <div className="mt-2 rounded-lg bg-goodbg px-2.5 py-1.5 text-[11px] font-bold text-good">✅ Live DDU</div>}
    </Link>
  )
}

function ProductBoardDashboard() {
  const { currentUser, activeRole } = useAuth()
  const [ddus, setDdus] = useState(null)
  const [unstarted, setUnstarted] = useState([])
  const [scopeText, setScopeText] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      const scope = currentUser.scopeFor(activeRole)
      const [vatikaIds, districts, blocks] = await Promise.all([expandScopeToVatikaIds(scope), listDistricts(), listBlocks()])
      const [boards, notStarted] = await Promise.all([
        Promise.all(vatikaIds.map((vid) => getProductStatusBoard(vid))),
        getUnstartedProducts(vatikaIds),
      ])
      // A merged DDU touches more than one Vatika, so it shows up in more than
      // one board here — dedupe by group id before rendering.
      const seen = new Set()
      const deduped = boards.flat().filter((d) => (seen.has(d.id) ? false : (seen.add(d.id), true)))
      if (!cancelled) {
        setDdus(deduped)
        setUnstarted(notStarted)
        setScopeText(scopeLabel(scope, { districts, blocks }))
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [currentUser, activeRole])

  if (!ddus) return <div className="py-10 text-center text-sm text-inkfaint">Loading your Vatikas…</div>

  const needsYou = ddus.filter((d) => d.pendingOn && d.pendingOn.role.includes(activeRole))
  const others = ddus.filter((d) => !needsYou.includes(d))
  const live = ddus.filter((d) => d.isLive)
  const canSurvey = activeRole === ROLES.VASUKI || activeRole === ROLES.VIDUSHI

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold">Hi, {currentUser.name}</h1>
        <p className="text-sm text-inksoft">
          Signed in as {activeRole}. {scopeText}.
        </p>
        {KRA_TEXT[activeRole] && (
          <div className="mt-2 rounded-lg bg-accentsoft px-3 py-2 text-xs font-bold text-accentink">{KRA_TEXT[activeRole]}</div>
        )}
      </div>

      <SummaryStrip
        items={[
          { label: 'Needs you', value: needsYou.length, tone: 'warn' },
          { label: 'Live DDUs', value: live.length, tone: 'good' },
          { label: 'For awareness', value: others.length - live.length, tone: 'neutral' },
          { label: 'Not started', value: unstarted.length, tone: 'accent' },
        ]}
      />

      {canSurvey && (
        <Link to="/stage1/start" className="rounded-lg bg-accent px-4 py-3 text-center text-sm font-bold text-accentink">
          + Start a survey
        </Link>
      )}

      {needsYou.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-warn">Needs you — {needsYou.length}</div>
          <div className="flex flex-col gap-2">
            {needsYou.map((d) => (
              <DDURow key={d.id} ddu={d} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wide text-inkfaint">For your awareness — not yours to edit</div>
          <Link to="/blocks" className="text-xs font-bold text-teal">Browse Blocks →</Link>
        </div>
        <div className="flex flex-col gap-2">
          {others.map((d) => (
            <DDURow key={d.id} ddu={d} dim />
          ))}
          {ddus.length === 0 && <div className="text-sm text-inkfaint">Nothing logged yet for your Vatikas.</div>}
        </div>
      </div>

      {unstarted.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">
            New DDU opportunities — not surveyed anywhere in your area yet
          </div>
          <div className="flex flex-wrap gap-2">
            {unstarted.map((p) => (
              <Link
                key={p.id}
                to={canSurvey ? `/stage1/start` : '#'}
                className={`rounded-full border border-linestrong bg-surface px-3 py-1.5 text-xs font-bold text-inksoft ${!canSurvey ? 'pointer-events-none opacity-70' : ''}`}
              >
                {p.icon} {p.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** Home routes to the right view for whichever hat is currently worn. */
export function Dashboard() {
  const { activeRole } = useAuth()
  if (activeRole === ROLES.MITRA) return <MitraView />
  if (activeRole === ROLES.DHAWAK) return <DhawakView />
  return <ProductBoardDashboard />
}
