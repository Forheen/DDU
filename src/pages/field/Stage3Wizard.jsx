import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProduct } from '../../services/productRepository.js'
import { getVatika } from '../../services/vatikaRepository.js'
import { getCostEconomics } from '../../services/costEconomicsRepository.js'
import { listUsersByRole, listUsers } from '../../services/userRepository.js'
import { getOrCreateSingleVatikaGroup } from '../../services/dduGroupRepository.js'
import { scopeCoversVatika } from '../../services/scopeService.js'
import { getAssessment } from '../../services/stage2Repository.js'
import {
  listBuyers, addBuyer,
  listSupplierLines, addSupplierLine,
  getProductionForVatika, saveProductionForVatika,
  getMoney, saveMoney,
  getRolesForVatika, saveRolesForVatika,
} from '../../services/stage3Repository.js'
import { ROLES } from '../../models/index.js'
import { BigChoice, NumberField, TextField, Select, FieldLabel, PrimaryButton } from '../../components/FormControls.jsx'
import { Stage2Recap, CostEconomicsRecap } from '../../components/StageRecaps.jsx'

const TABS = ['1 Demand', '2 Supplier', '3 Production', '4 Money', '5 Roles']
const BUYER_TYPES = ['Retail shop', 'Institution', 'Household', 'Other']
const FREQUENCY = ['weekly', 'fortnightly', 'monthly']
const DELIVERERS = ['Vaibhavi', 'Dhawak', 'Buyer picks up', 'Vasuki']

function ProductionForm({ vatika, initial, onSave }) {
  const [form, setForm] = useState(initial || { womenCount: '', unitsPerWomanPerDay: '', workingDaysPerMonth: '' })
  const [errors, setErrors] = useState({})

  function set(patch) {
    setForm((f) => ({ ...f, ...patch }))
    setErrors((e) => ({ ...e, ...Object.fromEntries(Object.keys(patch).map((k) => [k, null])) }))
  }

  async function submit(e) {
    e.preventDefault()
    const next = {}
    if (!(Number(form.womenCount) > 0)) next.womenCount = 'Must be at least 1.'
    if (!(Number(form.unitsPerWomanPerDay) > 0)) next.unitsPerWomanPerDay = 'Must be more than 0.'
    if (!(Number(form.workingDaysPerMonth) > 0 && Number(form.workingDaysPerMonth) <= 31)) next.workingDaysPerMonth = 'Enter 1–31 days.'
    setErrors(next)
    if (Object.keys(next).length) return
    await onSave(vatika.id, {
      womenCount: Number(form.womenCount) || 0,
      unitsPerWomanPerDay: Number(form.unitsPerWomanPerDay) || 0,
      workingDaysPerMonth: Number(form.workingDaysPerMonth) || 0,
    })
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-linestrong bg-surface p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-teal">{vatika.name}</div>
      <FieldLabel>How many women will produce?</FieldLabel>
      <NumberField value={form.womenCount} onChange={(v) => set({ womenCount: v })} />
      {errors.womenCount && <p className="text-[11px] font-bold text-crit">{errors.womenCount}</p>}
      <FieldLabel>Units one woman makes per day?</FieldLabel>
      <NumberField value={form.unitsPerWomanPerDay} onChange={(v) => set({ unitsPerWomanPerDay: v })} />
      {errors.unitsPerWomanPerDay && <p className="text-[11px] font-bold text-crit">{errors.unitsPerWomanPerDay}</p>}
      <FieldLabel>Working days per month?</FieldLabel>
      <NumberField value={form.workingDaysPerMonth} onChange={(v) => set({ workingDaysPerMonth: v })} />
      {errors.workingDaysPerMonth && <p className="text-[11px] font-bold text-crit">{errors.workingDaysPerMonth}</p>}
      <PrimaryButton type="submit">Save Production — {vatika.name}</PrimaryButton>
    </form>
  )
}

function RolesForm({ vatika, initial, vasukis, mitras, onSave }) {
  const [form, setForm] = useState(
    initial || { deliveryBy: 'Vaibhavi', deliveryMarginPct: 0, vasukiId: '', vasukiMarginPct: 8, mitraId: '' },
  )
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    const d = Number(form.deliveryMarginPct)
    const v = Number(form.vasukiMarginPct)
    if (d < 0 || d > 100 || v < 0 || v > 100) {
      setError('Margins must be between 0 and 100%.')
      return
    }
    setError(null)
    await onSave(vatika.id, { ...form, deliveryMarginPct: d || 0, vasukiMarginPct: v || 0 })
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-linestrong bg-surface p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-teal">{vatika.name}</div>
      <FieldLabel>Who delivers?</FieldLabel>
      <BigChoice options={DELIVERERS} value={form.deliveryBy} onChange={(v) => setForm((f) => ({ ...f, deliveryBy: v }))} />
      <FieldLabel>Delivery margin %</FieldLabel>
      <NumberField value={form.deliveryMarginPct} onChange={(v) => setForm((f) => ({ ...f, deliveryMarginPct: v }))} suffix="%" />
      <FieldLabel>Vasuki (market connector)</FieldLabel>
      <Select value={form.vasukiId} onChange={(v) => setForm((f) => ({ ...f, vasukiId: v }))} options={vasukis.map((u) => ({ value: u.id, label: u.name }))} placeholder="Unassigned" />
      <FieldLabel>Vasuki margin %</FieldLabel>
      <NumberField value={form.vasukiMarginPct} onChange={(v) => setForm((f) => ({ ...f, vasukiMarginPct: v }))} suffix="%" />
      <FieldLabel>Mitra (village activator)</FieldLabel>
      <Select value={form.mitraId} onChange={(v) => setForm((f) => ({ ...f, mitraId: v }))} options={mitras.map((u) => ({ value: u.id, label: u.name }))} placeholder="Unassigned" />
      {error && <p className="text-[11px] font-bold text-crit">{error}</p>}
      <PrimaryButton type="submit">Save Roles — {vatika.name}</PrimaryButton>
    </form>
  )
}

export function Stage3Wizard() {
  const { vatikaId, productId } = useParams()
  const [tab, setTab] = useState(0)
  const [product, setProduct] = useState(null)
  const [vatika, setVatika] = useState(null)
  const [group, setGroup] = useState(null)
  const [groupVatikas, setGroupVatikas] = useState([])
  const [costEconomics, setCostEconomics] = useState(null)
  const [buyers, setBuyers] = useState([])
  const [supplierLines, setSupplierLines] = useState([])
  const [productionByVatika, setProductionByVatika] = useState({})
  const [moneyForm, setMoneyForm] = useState(null)
  const [rolesByVatika, setRolesByVatika] = useState({})
  const [vasukisByVatika, setVasukisByVatika] = useState({})
  const [mitrasByVatika, setMitrasByVatika] = useState({})
  const [stage2Rows, setStage2Rows] = useState([])
  const [usersById, setUsersById] = useState({})
  const [showEarlier, setShowEarlier] = useState(false)
  const [ready, setReady] = useState(false)

  const dduId = group?.id

  async function reloadShared(gId) {
    setBuyers(await listBuyers(gId))
    setSupplierLines(await listSupplierLines(gId))
    const money = await getMoney(gId)
    const ce = await getCostEconomics(gId)
    setCostEconomics(ce)
    setMoneyForm(
      money || {
        toolsToStartRs: '',
        rawMaterialPackagingMonthlyRs: '',
        unitCostRs: ce ? Number(ce.netProductionCost.toFixed(2)) : '',
        vaibhaviSellingPriceRs: ce ? Number(ce.producerSellingPrice.toFixed(2)) : '',
      },
    )
  }

  useEffect(() => {
    async function load() {
      setProduct(await getProduct(productId))
      setVatika(await getVatika(vatikaId))
      const g = await getOrCreateSingleVatikaGroup(vatikaId, productId)
      setGroup(g)
      const vatikas = await Promise.all(g.vatikaIds.map(getVatika))
      setGroupVatikas(vatikas)

      const [vasukiRoleUsers, vidushiRoleUsers, mitras] = await Promise.all([
        listUsersByRole(ROLES.VASUKI),
        listUsersByRole(ROLES.VIDUSHI),
        listUsersByRole(ROLES.MITRA),
      ])
      const marketConnectors = [...vasukiRoleUsers, ...vidushiRoleUsers.filter((u) => !vasukiRoleUsers.some((v) => v.id === u.id))]

      const vasukiMap = {}
      const mitraMap = {}
      for (const vid of g.vatikaIds) {
        const vOk = await Promise.all(
          marketConnectors.map((u) => scopeCoversVatika(u.scopeFor(ROLES.VASUKI) || u.scopeFor(ROLES.VIDUSHI), vid)),
        )
        vasukiMap[vid] = marketConnectors.filter((_, i) => vOk[i])
        const mOk = await Promise.all(mitras.map((u) => scopeCoversVatika(u.scopeFor(ROLES.MITRA), vid)))
        mitraMap[vid] = mitras.filter((_, i) => mOk[i])
      }
      setVasukisByVatika(vasukiMap)
      setMitrasByVatika(mitraMap)

      await reloadShared(g.id)

      const productionEntries = await Promise.all(g.vatikaIds.map((vid) => getProductionForVatika(g.id, vid)))
      setProductionByVatika(Object.fromEntries(g.vatikaIds.map((vid, i) => [vid, productionEntries[i]])))
      const rolesEntries = await Promise.all(g.vatikaIds.map((vid) => getRolesForVatika(g.id, vid)))
      setRolesByVatika(Object.fromEntries(g.vatikaIds.map((vid, i) => [vid, rolesEntries[i]])))

      const assessments = await Promise.all(g.vatikaIds.map((vid) => getAssessment(vid, productId)))
      setStage2Rows(g.vatikaIds.map((vid, i) => ({ vatikaId: vid, vatikaName: vatikas[i]?.name, assessment: assessments[i] })))
      const users = await listUsers()
      setUsersById(Object.fromEntries(users.map((u) => [u.id, u])))

      setReady(true)
    }
    setReady(false)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vatikaId, productId])

  const [buyerForm, setBuyerForm] = useState({ buyerType: 'Retail shop', name: '', contactNo: '', location: '', moq: '', qtyPerMonth: '', pricePerUnit: '', howOften: 'monthly', whoDelivers: 'Vaibhavi', poAttachmentName: '' })
  const [supplierForm, setSupplierForm] = useState({ materialName: '', supplierName: '', contactNo: '', location: '', moq: '', pricePerUnit: '', totalQtyRequiredMonthly: '', howOftenRequired: 'monthly', whoDelivers: '', storedWhere: '' })
  const [buyerErrors, setBuyerErrors] = useState({})
  const [supplierErrors, setSupplierErrors] = useState({})
  const [moneyErrors, setMoneyErrors] = useState({})

  function setBuyerField(patch) {
    setBuyerForm((f) => ({ ...f, ...patch }))
    setBuyerErrors((e) => ({ ...e, ...Object.fromEntries(Object.keys(patch).map((k) => [k, null])) }))
  }

  function setSupplierField(patch) {
    setSupplierForm((f) => ({ ...f, ...patch }))
    setSupplierErrors((e) => ({ ...e, ...Object.fromEntries(Object.keys(patch).map((k) => [k, null])) }))
  }

  async function submitBuyer(e) {
    e.preventDefault()
    const next = {}
    if (!buyerForm.name.trim()) next.name = 'Buyer name is required.'
    if (!(Number(buyerForm.qtyPerMonth) > 0)) next.qtyPerMonth = 'Must be more than 0.'
    if (!(Number(buyerForm.pricePerUnit) > 0)) next.pricePerUnit = 'Must be more than 0.'
    setBuyerErrors(next)
    if (Object.keys(next).length) return
    await addBuyer(dduId, { ...buyerForm, moq: Number(buyerForm.moq) || 0, qtyPerMonth: Number(buyerForm.qtyPerMonth) || 0, pricePerUnit: Number(buyerForm.pricePerUnit) || 0 })
    setBuyerForm((f) => ({ ...f, name: '', contactNo: '', location: '', moq: '', qtyPerMonth: '', pricePerUnit: '', poAttachmentName: '' }))
    setBuyers(await listBuyers(dduId))
  }

  async function submitSupplier(e) {
    e.preventDefault()
    const next = {}
    if (!supplierForm.materialName.trim()) next.materialName = 'Material name is required.'
    if (!(Number(supplierForm.pricePerUnit) > 0)) next.pricePerUnit = 'Must be more than 0.'
    if (!(Number(supplierForm.totalQtyRequiredMonthly) > 0)) next.totalQtyRequiredMonthly = 'Must be more than 0.'
    setSupplierErrors(next)
    if (Object.keys(next).length) return
    await addSupplierLine(dduId, { ...supplierForm, moq: Number(supplierForm.moq) || 0, pricePerUnit: Number(supplierForm.pricePerUnit) || 0, totalQtyRequiredMonthly: Number(supplierForm.totalQtyRequiredMonthly) || 0 })
    setSupplierForm({ materialName: '', supplierName: '', contactNo: '', location: '', moq: '', pricePerUnit: '', totalQtyRequiredMonthly: '', howOftenRequired: 'monthly', whoDelivers: '', storedWhere: '' })
    setSupplierLines(await listSupplierLines(dduId))
  }

  async function saveProduction(vid, data) {
    await saveProductionForVatika(dduId, vid, data)
    const updated = await getProductionForVatika(dduId, vid)
    setProductionByVatika((prev) => ({ ...prev, [vid]: updated }))
  }

  async function submitMoney(e) {
    e.preventDefault()
    const next = {}
    if (Number(moneyForm.toolsToStartRs) < 0) next.toolsToStartRs = 'Can’t be negative.'
    if (Number(moneyForm.rawMaterialPackagingMonthlyRs) < 0) next.rawMaterialPackagingMonthlyRs = 'Can’t be negative.'
    if (!(Number(moneyForm.unitCostRs) > 0)) next.unitCostRs = 'Must be more than 0.'
    if (!(Number(moneyForm.vaibhaviSellingPriceRs) > 0)) next.vaibhaviSellingPriceRs = 'Must be more than 0.'
    if (Number(moneyForm.vaibhaviSellingPriceRs) > 0 && Number(moneyForm.unitCostRs) > 0 && Number(moneyForm.vaibhaviSellingPriceRs) < Number(moneyForm.unitCostRs)) {
      next.vaibhaviSellingPriceRs = 'Selling below cost — double check this.'
    }
    setMoneyErrors(next)
    if (Object.keys(next).length) return
    await saveMoney(dduId, {
      toolsToStartRs: Number(moneyForm.toolsToStartRs) || 0,
      rawMaterialPackagingMonthlyRs: Number(moneyForm.rawMaterialPackagingMonthlyRs) || 0,
      unitCostRs: Number(moneyForm.unitCostRs) || 0,
      vaibhaviSellingPriceRs: Number(moneyForm.vaibhaviSellingPriceRs) || 0,
    })
  }

  async function saveRoles(vid, data) {
    await saveRolesForVatika(dduId, vid, data)
    const updated = await getRolesForVatika(dduId, vid)
    setRolesByVatika((prev) => ({ ...prev, [vid]: updated }))
  }

  if (!ready || !product || !group) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-sm font-bold text-inksoft">{vatika?.name}</div>
        <h1 className="font-display text-xl font-bold">
          {product.icon} {product.name} — Stage 3
        </h1>
        {group.isMerged && (
          <div className="mt-2 rounded-lg bg-tealsoft px-3 py-2 text-xs font-bold text-teal">
            🔗 Merged DDU — {groupVatikas.map((v) => v.name).join(' + ')} pool production for this one shared plan.
          </div>
        )}
      </div>

      <div className="rounded-xl border border-line bg-surface p-3">
        <button className="flex w-full items-center justify-between text-left" onClick={() => setShowEarlier((s) => !s)}>
          <span className="text-xs font-bold text-teal">📋 Why this is here — Stage 2 &amp; Cost Economics</span>
          <span className="text-xs text-inkfaint">{showEarlier ? '▾' : '▸'}</span>
        </button>
        {showEarlier && (
          <div className="mt-2 flex flex-col gap-2 border-t border-line pt-2">
            {stage2Rows.map((r) => (
              <Stage2Recap key={r.vatikaId} assessment={r.assessment} vatikaName={group.isMerged ? r.vatikaName : null} usersById={usersById} />
            ))}
            <CostEconomicsRecap costEconomics={costEconomics} usersById={usersById} />
          </div>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-bold ${tab === i ? 'bg-teal text-white' : 'bg-surface text-inkfaint border border-line'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="flex flex-col gap-4">
          <form onSubmit={submitBuyer} className="flex flex-col gap-2 rounded-2xl border border-linestrong bg-surface p-4">
            <FieldLabel>Buyer type</FieldLabel>
            <BigChoice options={BUYER_TYPES} value={buyerForm.buyerType} onChange={(v) => setBuyerForm((f) => ({ ...f, buyerType: v }))} />
            <FieldLabel>Buyer name</FieldLabel>
            <TextField value={buyerForm.name} onChange={(v) => setBuyerField({ name: v })} />
            {buyerErrors.name && <p className="text-[11px] font-bold text-crit">{buyerErrors.name}</p>}
            <div className="grid grid-cols-2 gap-2">
              <div><FieldLabel>Contact no.</FieldLabel><TextField value={buyerForm.contactNo} onChange={(v) => setBuyerField({ contactNo: v })} /></div>
              <div><FieldLabel>Location</FieldLabel><TextField value={buyerForm.location} onChange={(v) => setBuyerField({ location: v })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><FieldLabel>MoQ</FieldLabel><NumberField value={buyerForm.moq} onChange={(v) => setBuyerField({ moq: v })} /></div>
              <div>
                <FieldLabel>Qty / month</FieldLabel><NumberField value={buyerForm.qtyPerMonth} onChange={(v) => setBuyerField({ qtyPerMonth: v })} />
                {buyerErrors.qtyPerMonth && <p className="text-[11px] font-bold text-crit">{buyerErrors.qtyPerMonth}</p>}
              </div>
              <div>
                <FieldLabel>Price / unit</FieldLabel><NumberField value={buyerForm.pricePerUnit} onChange={(v) => setBuyerField({ pricePerUnit: v })} prefix="₹" />
                {buyerErrors.pricePerUnit && <p className="text-[11px] font-bold text-crit">{buyerErrors.pricePerUnit}</p>}
              </div>
            </div>
            <FieldLabel>How often</FieldLabel>
            <BigChoice options={FREQUENCY} value={buyerForm.howOften} onChange={(v) => setBuyerForm((f) => ({ ...f, howOften: v }))} columns={3} />
            <FieldLabel>Who delivers</FieldLabel>
            <BigChoice options={DELIVERERS} value={buyerForm.whoDelivers} onChange={(v) => setBuyerForm((f) => ({ ...f, whoDelivers: v }))} />
            <FieldLabel>Purchase Order (photo filename, optional)</FieldLabel>
            <TextField value={buyerForm.poAttachmentName} onChange={(v) => setBuyerForm((f) => ({ ...f, poAttachmentName: v }))} placeholder="e.g. PO_SharmaKirana.jpg" />
            <PrimaryButton type="submit">+ Add buyer</PrimaryButton>
          </form>
          <div className="flex flex-col gap-2">
            {buyers.map((b) => (
              <div key={b.id} className="rounded-xl border border-line bg-surface p-3 text-sm">
                <div className="flex justify-between"><span className="font-bold">{b.name}</span><span className="tabular text-inksoft">{b.qtyPerMonth} × ₹{b.pricePerUnit}</span></div>
                <div className="text-[11px] text-inksoft">{b.buyerType} · MoQ {b.moq} · {b.howOften} · {b.whoDelivers} delivers</div>
                {b.poAttachmentName && <div className="mt-1 rounded border border-dashed border-linestrong px-2 py-1 text-[10px] text-inksoft">📎 {b.poAttachmentName}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="flex flex-col gap-4">
          <form onSubmit={submitSupplier} className="flex flex-col gap-2 rounded-2xl border border-linestrong bg-surface p-4">
            <FieldLabel>Raw material / packaging material</FieldLabel>
            <TextField value={supplierForm.materialName} onChange={(v) => setSupplierField({ materialName: v })} />
            {supplierErrors.materialName && <p className="text-[11px] font-bold text-crit">{supplierErrors.materialName}</p>}
            <div className="grid grid-cols-2 gap-2">
              <div><FieldLabel>Supplier name</FieldLabel><TextField value={supplierForm.supplierName} onChange={(v) => setSupplierField({ supplierName: v })} /></div>
              <div><FieldLabel>Location</FieldLabel><TextField value={supplierForm.location} onChange={(v) => setSupplierField({ location: v })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><FieldLabel>MoQ</FieldLabel><NumberField value={supplierForm.moq} onChange={(v) => setSupplierField({ moq: v })} /></div>
              <div>
                <FieldLabel>Price / unit</FieldLabel><NumberField value={supplierForm.pricePerUnit} onChange={(v) => setSupplierField({ pricePerUnit: v })} prefix="₹" />
                {supplierErrors.pricePerUnit && <p className="text-[11px] font-bold text-crit">{supplierErrors.pricePerUnit}</p>}
              </div>
              <div>
                <FieldLabel>Qty / month</FieldLabel><NumberField value={supplierForm.totalQtyRequiredMonthly} onChange={(v) => setSupplierField({ totalQtyRequiredMonthly: v })} />
                {supplierErrors.totalQtyRequiredMonthly && <p className="text-[11px] font-bold text-crit">{supplierErrors.totalQtyRequiredMonthly}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><FieldLabel>Who delivers</FieldLabel><TextField value={supplierForm.whoDelivers} onChange={(v) => setSupplierForm((f) => ({ ...f, whoDelivers: v }))} /></div>
              <div><FieldLabel>Stored where</FieldLabel><TextField value={supplierForm.storedWhere} onChange={(v) => setSupplierForm((f) => ({ ...f, storedWhere: v }))} /></div>
            </div>
            <PrimaryButton type="submit">+ Add material</PrimaryButton>
          </form>
          <div className="flex flex-col gap-2">
            {supplierLines.map((s) => (
              <div key={s.id} className="rounded-xl border border-line bg-surface p-3 text-sm">
                <div className="flex justify-between"><span className="font-bold">{s.materialName}</span><span className="tabular text-inksoft">₹{s.pricePerUnit} × {s.totalQtyRequiredMonthly}</span></div>
                <div className="text-[11px] text-inksoft">{s.supplierName} · {s.storedWhere || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="flex flex-col gap-4">
          {group.isMerged && <p className="text-xs text-inksoft">Each contributing Vatika enters its own production — capacity sums across all of them.</p>}
          {groupVatikas.map((v) => (
            <ProductionForm key={v.id} vatika={v} initial={productionByVatika[v.id]} onSave={saveProduction} />
          ))}
        </div>
      )}

      {tab === 3 && moneyForm && (
        <form onSubmit={submitMoney} className="flex flex-col gap-3 rounded-2xl border border-linestrong bg-surface p-4">
          <FieldLabel>Tools to start (machines) ₹</FieldLabel>
          <NumberField value={moneyForm.toolsToStartRs} onChange={(v) => setMoneyForm((f) => ({ ...f, toolsToStartRs: v }))} prefix="₹" />
          {moneyErrors.toolsToStartRs && <p className="text-[11px] font-bold text-crit">{moneyErrors.toolsToStartRs}</p>}
          <FieldLabel>Raw material + packaging cost, one month ₹</FieldLabel>
          <NumberField value={moneyForm.rawMaterialPackagingMonthlyRs} onChange={(v) => setMoneyForm((f) => ({ ...f, rawMaterialPackagingMonthlyRs: v }))} prefix="₹" />
          {moneyErrors.rawMaterialPackagingMonthlyRs && <p className="text-[11px] font-bold text-crit">{moneyErrors.rawMaterialPackagingMonthlyRs}</p>}
          <FieldLabel>Cost to make ONE unit ₹</FieldLabel>
          <NumberField value={moneyForm.unitCostRs} onChange={(v) => setMoneyForm((f) => ({ ...f, unitCostRs: v }))} prefix="₹" />
          {moneyErrors.unitCostRs && <p className="text-[11px] font-bold text-crit">{moneyErrors.unitCostRs}</p>}
          <FieldLabel>Vaibhavi selling price per unit ₹</FieldLabel>
          <NumberField value={moneyForm.vaibhaviSellingPriceRs} onChange={(v) => setMoneyForm((f) => ({ ...f, vaibhaviSellingPriceRs: v }))} prefix="₹" />
          {moneyErrors.vaibhaviSellingPriceRs && <p className="text-[11px] font-bold text-crit">{moneyErrors.vaibhaviSellingPriceRs}</p>}
          {costEconomics && (
            <p className="text-[11px] text-inksoft">Pre-filled from Cost Economics (₹{costEconomics.producerSellingPrice.toFixed(2)}) — edit if the real deal differs.</p>
          )}
          <PrimaryButton type="submit">Save Money</PrimaryButton>
        </form>
      )}

      {tab === 4 && (
        <div className="flex flex-col gap-4">
          {group.isMerged && <p className="text-xs text-inksoft">Each Vatika keeps its own Vasuki, Mitra and delivery arrangement.</p>}
          {groupVatikas.map((v) => (
            <RolesForm
              key={v.id}
              vatika={v}
              initial={rolesByVatika[v.id]}
              vasukis={vasukisByVatika[v.id] || []}
              mitras={mitrasByVatika[v.id] || []}
              onSave={saveRoles}
            />
          ))}
          <p className="text-[11px] text-inksoft">Totals, profit and capacity are calculated back at office — see the DDU Summary.</p>
        </div>
      )}

      <Link to={`/vatikas/${vatikaId}/products/${productId}/summary`} className="rounded-lg bg-teal px-4 py-2.5 text-center text-sm font-bold text-white">
        View DDU Summary →
      </Link>
    </div>
  )
}
