import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { buildDDUByGroupId, getSameProductPricing } from '../../services/dduService.js'
import { listUsersByRole, getUser } from '../../services/userRepository.js'
import { saveRolesForVatika } from '../../services/stage3Repository.js'
import { saveCostEconomics } from '../../services/costEconomicsRepository.js'
import { ROLES } from '../../models/index.js'
import { NumberField, Select, FieldLabel, PrimaryButton } from '../../components/FormControls.jsx'
import { StatusChip } from '../../components/StatusChip.jsx'
import { PendingBanner } from '../../components/PendingBanner.jsx'

const money = (n) => (n == null ? '—' : `₹${n.toFixed(2)}`)

function RoleReassignForm({ vatika, initial, vasukis, mitras, onSave }) {
  const [form, setForm] = useState(initial || { deliveryBy: 'Vaibhavi', deliveryMarginPct: 0, vasukiId: '', vasukiMarginPct: 8, mitraId: '' })
  async function submit(e) {
    e.preventDefault()
    await onSave(vatika.id, form)
  }
  return (
    <form onSubmit={submit} className="rounded-lg border border-line bg-bg p-3">
      <div className="mb-2 text-xs font-bold text-teal">{vatika.name}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><FieldLabel>Vasuki</FieldLabel><Select value={form.vasukiId || ''} onChange={(v) => setForm((f) => ({ ...f, vasukiId: v }))} options={vasukis.map((u) => ({ value: u.id, label: u.name }))} placeholder="Unassigned" /></div>
        <div><FieldLabel>Mitra</FieldLabel><Select value={form.mitraId || ''} onChange={(v) => setForm((f) => ({ ...f, mitraId: v }))} options={mitras.map((u) => ({ value: u.id, label: u.name }))} placeholder="Unassigned" /></div>
      </div>
      <div className="mt-2"><PrimaryButton type="submit" className="w-full sm:w-auto">Save — {vatika.name}</PrimaryButton></div>
    </form>
  )
}

export function AdminDDUDetail() {
  const { groupId } = useParams()
  const { currentUser } = useAuth()
  const [ddu, setDdu] = useState(null)
  const [vasukis, setVasukis] = useState([])
  const [mitras, setMitras] = useState([])
  const [ceForm, setCeForm] = useState(null)
  const [filledByUser, setFilledByUser] = useState(null)
  const [elsewhere, setElsewhere] = useState([])

  async function reload() {
    const d = await buildDDUByGroupId(groupId)
    setDdu(d)
    setCeForm(d.costEconomics ? { ...d.costEconomics, margins: { ...d.costEconomics.margins } } : null)
    setFilledByUser(d.costEconomics?.filledBy ? await getUser(d.costEconomics.filledBy) : null)
    setElsewhere(await getSameProductPricing(d.productId, d.id))
  }

  useEffect(() => {
    Promise.all([listUsersByRole(ROLES.VASUKI), listUsersByRole(ROLES.VIDUSHI)]).then(([vasukiUsers, vidushiUsers]) =>
      setVasukis([...vasukiUsers, ...vidushiUsers.filter((u) => !vasukiUsers.some((v) => v.id === u.id))]),
    )
    listUsersByRole(ROLES.MITRA).then(setMitras)
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  async function saveRole(vatikaId, data) {
    await saveRolesForVatika(groupId, vatikaId, { ...data, deliveryMarginPct: Number(data.deliveryMarginPct) || 0, vasukiMarginPct: Number(data.vasukiMarginPct) || 0 })
    await reload()
  }

  async function submitCostOverride(e) {
    e.preventDefault()
    await saveCostEconomics(groupId, { ...ceForm, filledBy: currentUser.id, updatedAt: new Date().toISOString().slice(0, 10) })
    await reload()
  }

  if (!ddu) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-sm font-bold text-inksoft">{ddu.vatikas.map((v) => v.name).join(' + ')}</div>
        <h1 className="font-display text-2xl font-bold">{ddu.product?.icon} {ddu.product?.name}</h1>
        {ddu.isMerged && <div className="mt-1 inline-block rounded-full bg-tealsoft px-3 py-1 text-xs font-bold text-teal">🔗 Merged Block DDU</div>}
      </div>

      <PendingBanner ddu={ddu} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <h2 className="mb-3 text-sm font-bold">Stage status</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><span>Stage 1</span><StatusChip status={ddu.stage1Status} /></div>
            <div className="flex justify-between"><span>Stage 2</span><StatusChip status={ddu.stage2Status} /></div>
            <div className="flex justify-between"><span>Cost Economics</span><StatusChip status={ddu.costEconomicsStatus} /></div>
            <div className="flex justify-between"><span>Stage 3</span><StatusChip status={ddu.stage3Status} /></div>
          </div>
          <div className="mt-3 flex flex-col gap-1 border-t border-line pt-3 text-xs text-inksoft">
            {ddu.stage2ByVatika.map((v) => (
              <div key={v.vatikaId}>
                {ddu.vatikas.find((x) => x.id === v.vatikaId)?.name}: Priority {v.assessment?.priorityLevel ?? '—'} · Critical{' '}
                {v.assessment?.criticalPass === null || v.assessment?.criticalPass === undefined ? '—' : v.assessment.criticalPass ? 'Pass' : 'Fail'} · Readiness{' '}
                {v.assessment?.readinessScore ?? '—'}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <h2 className="mb-3 text-sm font-bold">Computed summary</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><span className="text-inksoft">Monthly demand</span><span className="tabular font-bold">{ddu.totalMonthlyDemand}</span></div>
            <div className="flex justify-between"><span className="text-inksoft">Monthly capacity</span><span className="tabular font-bold">{ddu.monthlyCapacity ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-inksoft">Monthly profit</span><span className="tabular font-bold">{money(ddu.monthlyProfit)}</span></div>
          </div>
          {ddu.isMerged && (
            <div className="mt-3 border-t border-line pt-3 text-xs text-inksoft">
              {ddu.productionRows.map((p) => (
                <div key={p.vatikaId} className="flex justify-between">
                  <span>{ddu.vatikas.find((v) => v.id === p.vatikaId)?.name}</span>
                  <span className="tabular">{p.monthlyCapacity} / mo</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <h2 className="mb-3 text-sm font-bold">Reassign roles {ddu.isMerged && <span className="font-normal text-inksoft">— one per Vatika</span>}</h2>
        <div className="flex flex-col gap-3">
          {ddu.vatikas.map((v) => (
            <RoleReassignForm
              key={v.id}
              vatika={v}
              initial={ddu.rolesRows.find((r) => r.vatikaId === v.id)}
              vasukis={vasukis}
              mitras={mitras}
              onSave={saveRole}
            />
          ))}
        </div>
      </div>

      {ceForm && (
        <div className="rounded-xl border border-line bg-surface p-4">
          <h2 className="mb-1 text-sm font-bold">Cost Economics {ddu.isMerged && <span className="font-normal text-inksoft">— shared across the merge</span>}</h2>
          <p className="mb-3 text-xs text-inksoft">
            {ddu.costEconomics?.filledBy ? (
              <>Last set by <b className="text-ink">{filledByUser?.name || ddu.costEconomics.filledBy}</b> on <b className="text-ink">{ddu.costEconomics.updatedAt}</b> — know who and when before you override it.</>
            ) : (
              'Never filled in yet.'
            )}
          </p>

          {elsewhere.length > 0 && (
            <div className="mb-4 rounded-lg border border-line bg-bg p-3">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">
                {ddu.product?.name} is also priced in {elsewhere.length} other DDU{elsewhere.length === 1 ? '' : 's'} — check before you change this one
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-xs">
                  <thead>
                    <tr className="text-left text-[10px] uppercase text-inkfaint">
                      <th className="pb-1">Vatika(s)</th>
                      <th className="pb-1 text-right">Producer price</th>
                      <th className="pb-1 text-right">Competitor MRP</th>
                      <th className="pb-1 text-right">Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elsewhere.map(({ group, vatikas, costEconomics }) => (
                      <tr key={group.id} className="border-t border-line">
                        <td className="py-1">{vatikas.map((v) => v.name).join(' + ')}</td>
                        <td className="py-1 text-right tabular">{costEconomics ? money(costEconomics.producerSellingPrice) : '—'}</td>
                        <td className="py-1 text-right tabular">{costEconomics?.competitorMRP != null ? money(costEconomics.competitorMRP) : '—'}</td>
                        <td className="py-1 text-right">{costEconomics?.procurementDecision || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <form onSubmit={submitCostOverride}>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><FieldLabel>Competitor MRP</FieldLabel><NumberField value={ceForm.competitorMRP} onChange={(v) => setCeForm((f) => ({ ...f, competitorMRP: v === '' ? null : v }))} prefix="₹" /></div>
              <div><FieldLabel>Target institution price</FieldLabel><NumberField value={ceForm.targetInstitutionPrice} onChange={(v) => setCeForm((f) => ({ ...f, targetInstitutionPrice: v === '' ? null : v }))} prefix="₹" /></div>
              <div><FieldLabel>Raw material cost</FieldLabel><NumberField value={ceForm.rawMaterialCost} onChange={(v) => setCeForm((f) => ({ ...f, rawMaterialCost: v === '' ? 0 : v }))} prefix="₹" /></div>
            </div>
            <div className="mt-3"><PrimaryButton type="submit" className="w-full sm:w-auto">Save override &amp; recompute</PrimaryButton></div>
            {ddu.costEconomics && (
              <p className="mt-2 text-xs text-inksoft">Current verdict: <b>{ddu.costEconomics.procurementDecision || 'not yet computed'}</b></p>
            )}
          </form>
        </div>
      )}
    </div>
  )
}
