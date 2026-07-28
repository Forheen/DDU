// Read-only recaps of what earlier stages actually contain — every role can
// see this for context (full transparency), even though only the owning
// role's wizard can edit it (boundaried KRA).

const money = (n) => (n == null ? '—' : `₹${Number(n).toFixed(2)}`)
const who = (usersById, id) => (id ? usersById?.[id]?.name || id : null)

export function ProvenanceLine({ usersById, filledBy, date, updatedAt, verb = 'Filled' }) {
  const name = who(usersById, filledBy)
  const when = date || updatedAt
  if (!name && !when) return null
  return (
    <div className="text-[10px] text-inkfaint">
      {verb} by {name || 'someone'}
      {when ? ` on ${when}` : ''}
    </div>
  )
}

export function Stage1Recap({ marketEntries = [], institutionEntries = [], usersById }) {
  if (marketEntries.length === 0 && institutionEntries.length === 0) {
    return <div className="text-xs text-inkfaint">Nothing logged yet.</div>
  }
  return (
    <div className="flex flex-col gap-2">
      {marketEntries.map((e) => (
        <div key={e.id} className="rounded-lg border border-line bg-bg p-2.5 text-xs">
          <div className="flex justify-between gap-2">
            <span className="font-bold">{e.shopName || 'Shop'}</span>
            <span className="tabular text-inksoft">₹{e.mrp}</span>
          </div>
          <div className="text-inksoft">
            {e.brand} · {e.unit} · {e.shopsSelling} shop(s) selling · {e.volumeEstimate || '—'}
          </div>
          <ProvenanceLine usersById={usersById} filledBy={e.filledBy} date={e.date} verb="Logged" />
        </div>
      ))}
      {institutionEntries.map((e) => (
        <div key={e.id} className="rounded-lg border border-line bg-bg p-2.5 text-xs">
          <div className="flex justify-between gap-2">
            <span className="font-bold">{e.institutionName || 'Institution'}</span>
            <span className="tabular text-inksoft">₹{e.buyingPrice}</span>
          </div>
          <div className="text-inksoft">
            {e.institutionType} · {e.volumeMin}–{e.volumeMax} {e.unit}/{e.buyingFrequency}
            {e.sakhyaOpportunity ? ' · Sakhya opportunity' : ''}
          </div>
          <ProvenanceLine usersById={usersById} filledBy={e.filledBy} date={e.date} verb="Logged" />
        </div>
      ))}
    </div>
  )
}

export function Stage2Recap({ assessment, vatikaName, usersById }) {
  if (!assessment) {
    return <div className="text-xs text-inkfaint">{vatikaName ? `${vatikaName}: ` : ''}Not started yet.</div>
  }
  const a = assessment
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-line bg-bg p-2.5 text-xs">
      {vatikaName && <div className="text-xs font-bold text-teal">{vatikaName}</div>}
      <div className="flex justify-between"><span className="text-inksoft">Demand confirmed</span><span>{a.demandConfirmed === null ? '—' : a.demandConfirmed ? 'Yes' : 'No'}</span></div>
      <div className="flex justify-between"><span className="text-inksoft">Raw material</span><span>{a.rawMaterial || '—'}</span></div>
      <div className="flex justify-between"><span className="text-inksoft">Priority</span><span>{a.priorityLevel ?? '—'}</span></div>
      <div className="flex justify-between"><span className="text-inksoft">Critical check</span><span>{a.criticalPass === null ? '—' : a.criticalPass ? 'Pass' : 'Fail'}</span></div>
      <div className="flex justify-between"><span className="text-inksoft">Sample ready</span><span>{a.sampleAvailable === null ? '—' : a.sampleAvailable ? 'Yes' : 'No'}</span></div>
      {a.sampleAvailable === false && (
        <div className="flex justify-between"><span className="text-inksoft">Readiness</span><span>{a.readinessScore ?? '—'} / 7</span></div>
      )}
      {a.externalSupportNeeded.length > 0 && (
        <div className="flex justify-between"><span className="text-inksoft">Support needed</span><span>{a.externalSupportNeeded.join(', ')}</span></div>
      )}
      <div className="flex justify-between border-t border-line pt-1"><span className="font-bold">Outcome</span><span className="font-bold capitalize">{a.outcome}</span></div>
      <ProvenanceLine usersById={usersById} filledBy={a.filledBy} date={a.date} verb="Assessed" />
    </div>
  )
}

export function CostEconomicsRecap({ costEconomics, usersById }) {
  if (!costEconomics) return <div className="text-xs text-inkfaint">Not started yet.</div>
  const c = costEconomics
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-line bg-bg p-2.5 text-xs">
      <div className="flex justify-between"><span className="text-inksoft">Net production cost</span><span className="tabular">{money(c.netProductionCost)}</span></div>
      <div className="flex justify-between"><span className="font-bold">Producer selling price</span><span className="tabular font-bold">{money(c.producerSellingPrice)}</span></div>
      <div className="flex justify-between"><span className="text-inksoft">Competitor MRP</span><span className="tabular">{money(c.competitorMRP)}</span></div>
      <div className="flex justify-between"><span className="text-inksoft">Target institution price</span><span className="tabular">{money(c.targetInstitutionPrice)}</span></div>
      <div className="flex justify-between border-t border-line pt-1"><span className="font-bold">Decision</span><span className="font-bold">{c.procurementDecision || 'Not yet computed'}</span></div>
      <ProvenanceLine usersById={usersById} filledBy={c.filledBy} updatedAt={c.updatedAt} verb="Set" />
    </div>
  )
}

export function Stage3Recap({ ddu, usersById }) {
  const { buyers, supplierLines, productionRows, money: moneyRow, rolesRows, vatikas } = ddu
  const vatikaName = (vid) => vatikas.find((v) => v.id === vid)?.name || vid
  return (
    <div className="flex flex-col gap-3 text-xs">
      <div>
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-inkfaint">Demand ({buyers.length})</div>
        {buyers.length === 0 && <div className="text-inkfaint">No buyers yet.</div>}
        {buyers.map((b) => (
          <div key={b.id} className="flex justify-between gap-2 border-b border-line py-1 last:border-0">
            <span>{b.name} · {b.buyerType}</span>
            <span className="tabular whitespace-nowrap">{b.qtyPerMonth} × ₹{b.pricePerUnit}</span>
          </div>
        ))}
      </div>
      <div>
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-inkfaint">Suppliers ({supplierLines.length})</div>
        {supplierLines.length === 0 && <div className="text-inkfaint">No suppliers yet.</div>}
        {supplierLines.map((s) => (
          <div key={s.id} className="flex justify-between gap-2 border-b border-line py-1 last:border-0">
            <span>{s.materialName} · {s.supplierName || '—'}</span>
            <span className="tabular whitespace-nowrap">₹{s.pricePerUnit} × {s.totalQtyRequiredMonthly}</span>
          </div>
        ))}
      </div>
      <div>
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-inkfaint">Production</div>
        {productionRows.length === 0 && <div className="text-inkfaint">Not filled yet.</div>}
        {productionRows.map((p) => (
          <div key={p.id} className="flex justify-between border-b border-line py-1 last:border-0">
            <span>{vatikaName(p.vatikaId)}</span>
            <span className="tabular">{p.monthlyCapacity}/mo</span>
          </div>
        ))}
      </div>
      {moneyRow && (
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-inkfaint">Money</div>
          <div className="flex justify-between"><span className="text-inksoft">Unit cost</span><span className="tabular">{money(moneyRow.unitCostRs)}</span></div>
          <div className="flex justify-between"><span className="text-inksoft">Selling price</span><span className="tabular">{money(moneyRow.vaibhaviSellingPriceRs)}</span></div>
        </div>
      )}
      <div>
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-inkfaint">Roles</div>
        {rolesRows.length === 0 && <div className="text-inkfaint">Not assigned yet.</div>}
        {rolesRows.map((r) => (
          <div key={r.id} className="border-b border-line py-1 last:border-0">
            <div className="font-bold">{vatikaName(r.vatikaId)}</div>
            <div className="text-inksoft">
              Delivery: {r.deliveryBy} ({r.deliveryMarginPct}%) · Vasuki: {who(usersById, r.vasukiId) || '—'} ({r.vasukiMarginPct}%) · Mitra:{' '}
              {who(usersById, r.mitraId) || '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
