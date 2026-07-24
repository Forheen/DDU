import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { getCostEconomics, saveCostEconomics } from '../../services/costEconomicsRepository.js'
import { getProduct } from '../../services/productRepository.js'
import { getVatika } from '../../services/vatikaRepository.js'
import { getOrCreateSingleVatikaGroup } from '../../services/dduGroupRepository.js'
import { CostEconomics, DEFAULT_MARGINS } from '../../models/index.js'
import { NumberField, FieldLabel, PrimaryButton } from '../../components/FormControls.jsx'

const money = (n) => (n == null ? '—' : `₹${n.toFixed(2)}`)
const NON_NEGATIVE_FIELDS = ['rawMaterialCost', 'packagingCost', 'directLabourCost', 'manufacturingOverhead', 'transportToHub', 'otherCost']
const POSITIVE_FIELDS = ['competitorMRP', 'targetInstitutionPrice']

function TrafficLight({ light }) {
  if (!light) return null
  const styles = {
    go: 'bg-goodbg text-good',
    caution: 'bg-warnbg text-warn',
    stop: 'bg-critbg text-crit',
  }
  const label = { go: 'GO — PROCURE', caution: 'PROCEED WITH CAUTION', stop: 'STOP — DO NOT PROCURE' }
  return <div className={`rounded-lg px-3 py-2 text-center text-sm font-bold ${styles[light]}`}>⬤ {label[light]}</div>
}

export function CostEconomicsPage() {
  const { vatikaId, productId } = useParams()
  const [product, setProduct] = useState(null)
  const [vatika, setVatika] = useState(null)
  const [group, setGroup] = useState(null)
  const [otherVatikaNames, setOtherVatikaNames] = useState([])
  const [form, setForm] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      setProduct(await getProduct(productId))
      setVatika(await getVatika(vatikaId))
      const g = await getOrCreateSingleVatikaGroup(vatikaId, productId)
      setGroup(g)
      if (g.isMerged) {
        const others = await Promise.all(g.vatikaIds.filter((v) => v !== vatikaId).map(getVatika))
        setOtherVatikaNames(others.map((v) => v.name))
      }
      const existing = await getCostEconomics(g.id)
      setForm(existing || new CostEconomics({ id: null, dduId: g.id, margins: { ...DEFAULT_MARGINS } }))
    }
    load()
  }, [vatikaId, productId])

  async function patch(fields) {
    const errs = {}
    for (const [k, v] of Object.entries(fields)) {
      if (NON_NEGATIVE_FIELDS.includes(k) && v !== null && v !== '' && Number(v) < 0) errs[k] = 'Can’t be negative.'
      if (POSITIVE_FIELDS.includes(k) && v !== null && v !== '' && Number(v) <= 0) errs[k] = 'Must be more than 0.'
    }
    setFieldErrors((e) => ({ ...e, ...Object.fromEntries(Object.keys(fields).map((k) => [k, null])), ...errs }))
    const stamped = { ...fields, filledBy: currentUser.id, updatedAt: new Date().toISOString().slice(0, 10) }
    const merged = new CostEconomics({ ...form, ...stamped, margins: { ...form.margins, ...(fields.margins || {}) } })
    setForm(merged)
    await saveCostEconomics(group.id, { ...stamped, margins: merged.margins })
  }

  if (!form || !product) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-sm font-bold text-inksoft">{vatika?.name}</div>
        <h1 className="font-display text-xl font-bold">
          {product.icon} {product.name} — Cost Economics
        </h1>
        <p className="text-sm text-inksoft">What price actually works, in retail and in institutions?</p>
        {group?.isMerged && (
          <div className="mt-2 rounded-lg bg-tealsoft px-3 py-2 text-xs font-bold text-teal">
            🔗 Merged DDU — shared with {otherVatikaNames.join(', ')}. One price decision for the whole pooled production.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-linestrong bg-surface p-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">Margins (defaults, override if needed)</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['retailerPct', 'Retailer %'],
            ['vasukiPct', 'Vasuki %'],
            ['dhawakPct', 'Dhawak %'],
            ['producerPct', 'Producer %'],
            ['gstPct', 'GST %'],
            ['wastagePct', 'Wastage %'],
          ].map(([key, label]) => (
            <div key={key}>
              <FieldLabel>{label}</FieldLabel>
              <NumberField value={form.margins[key]} onChange={(v) => patch({ margins: { [key]: v === '' ? 0 : v } })} suffix="%" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-linestrong bg-surface p-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">Product cost, per unit</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['rawMaterialCost', 'Raw material'],
            ['packagingCost', 'Packaging'],
            ['directLabourCost', 'Direct labour'],
            ['manufacturingOverhead', 'Manufacturing OH'],
            ['transportToHub', 'Transport to hub'],
            ['otherCost', 'Other cost'],
          ].map(([key, label]) => (
            <div key={key}>
              <FieldLabel>{label}</FieldLabel>
              <NumberField value={form[key]} onChange={(v) => patch({ [key]: v === '' ? 0 : v })} prefix="₹" />
              {fieldErrors[key] && <p className="mt-1 text-[11px] font-bold text-crit">{fieldErrors[key]}</p>}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-1 rounded-lg bg-bg p-3 text-sm">
          <div className="flex justify-between"><span className="text-inksoft">Net production cost</span><span className="tabular font-bold">{money(form.netProductionCost)}</span></div>
          <div className="flex justify-between"><span className="text-inksoft">Producer margin ₹</span><span className="tabular font-bold">{money(form.producerMarginRs)}</span></div>
          <div className="flex justify-between border-t border-line pt-1"><span className="font-bold">Producer selling price</span><span className="tabular font-bold">{money(form.producerSellingPrice)}</span></div>
        </div>
      </div>

      <div className="rounded-2xl border border-linestrong bg-surface p-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">Retail channel</div>
        <FieldLabel>Competitor MRP</FieldLabel>
        <NumberField value={form.competitorMRP} onChange={(v) => patch({ competitorMRP: v === '' ? null : v })} prefix="₹" />
        {fieldErrors.competitorMRP && <p className="mt-1 text-[11px] font-bold text-crit">{fieldErrors.competitorMRP}</p>}
        <div className="mt-3 flex flex-col gap-1 rounded-lg bg-bg p-3 text-sm">
          <div className="flex justify-between"><span className="text-inksoft">Retail purchase price target</span><span className="tabular">{money(form.retailPurchasePriceTarget)}</span></div>
          <div className="flex justify-between"><span className="text-inksoft">Maximum producer price</span><span className="tabular">{money(form.maxProducerPriceRetail)}</span></div>
          <div className="flex justify-between"><span className="text-inksoft">Viability gap</span><span className={`tabular font-bold ${form.viabilityGapRetail >= 0 ? 'text-good' : 'text-crit'}`}>{money(form.viabilityGapRetail)}</span></div>
        </div>
        {form.retailRecommendation && <div className="mt-2"><TrafficLight light={form.retailRecommendation === 'ONBOARD' ? 'go' : 'stop'} /></div>}
      </div>

      <div className="rounded-2xl border border-linestrong bg-surface p-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">Institution channel</div>
        <FieldLabel>Target institution price</FieldLabel>
        <NumberField value={form.targetInstitutionPrice} onChange={(v) => patch({ targetInstitutionPrice: v === '' ? null : v })} prefix="₹" />
        {fieldErrors.targetInstitutionPrice && <p className="mt-1 text-[11px] font-bold text-crit">{fieldErrors.targetInstitutionPrice}</p>}
        <div className="mt-3 flex flex-col gap-1 rounded-lg bg-bg p-3 text-sm">
          <div className="flex justify-between"><span className="text-inksoft">Maximum producer price</span><span className="tabular">{money(form.maxProducerPriceInstitution)}</span></div>
          <div className="flex justify-between"><span className="text-inksoft">Viability gap</span><span className={`tabular font-bold ${form.viabilityGapInstitution >= 0 ? 'text-good' : 'text-crit'}`}>{money(form.viabilityGapInstitution)}</span></div>
        </div>
        {form.institutionRecommendation && <div className="mt-2"><TrafficLight light={form.institutionRecommendation === 'ACCEPT' ? 'go' : 'stop'} /></div>}
      </div>

      <div className="rounded-2xl border-2 border-linestrong bg-surface p-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">Procurement dashboard</div>
        <div className="mb-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-bg p-2"><div className="text-lg font-bold tabular">{form.producerSharePct ? `${form.producerSharePct.toFixed(0)}%` : '—'}</div><div className="text-[10px] text-inksoft">Producer share of MRP</div></div>
          <div className="rounded-lg bg-bg p-2"><div className="text-lg font-bold">{form.procurementDecision || '—'}</div><div className="text-[10px] text-inksoft">Decision</div></div>
        </div>
        <TrafficLight light={form.trafficLight} />
        {form.trafficLight === 'go' && (
          <PrimaryButton className="mt-3" onClick={() => navigate(`/vatikas/${vatikaId}/products/${productId}/stage3`)}>
            Open Stage 3 →
          </PrimaryButton>
        )}
        {form.trafficLight === 'stop' && (
          <p className="mt-3 text-xs text-inksoft">Stage 3 stays closed on a STOP. Renegotiate cost inputs or find a higher-paying buyer, then revisit.</p>
        )}
      </div>
    </div>
  )
}
