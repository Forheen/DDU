import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { listProducts, findOrCreateProductByName, getProduct } from '../../services/productRepository.js'
import { createInstitutionEntry, listInstitutionEntries } from '../../services/stage1Repository.js'
import { getVatika } from '../../services/vatikaRepository.js'
import { getBlock } from '../../services/blockRepository.js'
import { BigChoice, NumberField, TextField, YesNo, FieldLabel, PrimaryButton } from '../../components/FormControls.jsx'

const TYPES = ['Hospital', 'School', 'Dhaba', 'Gym', 'Other']

const EMPTY = {
  productName: '',
  institutionName: '',
  institutionType: 'Hospital',
  contactName: '',
  contactNumber: '',
  location: '',
  brand: 'local',
  unit: '',
  volumeMin: '',
  volumeMax: '',
  buyingPrice: '',
  buyingFrequency: 'monthly',
  vendorSupplier: '',
  remarks: '',
  sakhyaOpportunity: false,
}

export function Stage1InstitutionForm({ scope }) {
  const { vatikaId, blockId } = useParams()
  const [searchParams] = useSearchParams()
  const presetProductId = searchParams.get('productId')
  const { currentUser } = useAuth()
  const [place, setPlace] = useState(null)
  const [presetProduct, setPresetProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [entries, setEntries] = useState([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  async function reload() {
    const filter = scope === 'block' ? { blockId } : { vatikaId }
    setEntries(await listInstitutionEntries(filter))
  }

  useEffect(() => {
    async function load() {
      setPlace(scope === 'block' ? await getBlock(blockId) : await getVatika(vatikaId))
      setProducts(await listProducts())
      if (presetProductId) {
        const p = await getProduct(presetProductId)
        setPresetProduct(p)
        if (p) setForm((f) => ({ ...f, productName: p.name }))
      }
      await reload()
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, vatikaId, blockId, presetProductId])

  function set(patch) {
    setForm((f) => ({ ...f, ...patch }))
    setErrors((e) => ({ ...e, ...Object.fromEntries(Object.keys(patch).map((k) => [k, null])) }))
  }

  function validate() {
    const next = {}
    if (!form.productName.trim()) next.productName = 'Product name is required.'
    if (!form.institutionName.trim()) next.institutionName = 'Institution name is required.'
    if (form.volumeMin !== '' && form.volumeMax !== '' && Number(form.volumeMin) > Number(form.volumeMax)) {
      next.volumeMax = 'Max volume can’t be less than min.'
    }
    if (form.buyingPrice !== '' && Number(form.buyingPrice) < 0) next.buyingPrice = 'Price can’t be negative.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const product = await findOrCreateProductByName(form.productName)
    await createInstitutionEntry({
      scope,
      vatikaId: scope === 'block' ? vatikaId || null : vatikaId,
      blockId: scope === 'block' ? blockId : null,
      productId: product.id,
      productName: product.name,
      institutionName: form.institutionName,
      institutionType: form.institutionType,
      contactName: form.contactName,
      contactNumber: form.contactNumber,
      location: form.location,
      brand: form.brand,
      unit: form.unit,
      volumeMin: Number(form.volumeMin) || 0,
      volumeMax: Number(form.volumeMax) || 0,
      buyingPrice: Number(form.buyingPrice) || 0,
      buyingFrequency: form.buyingFrequency,
      vendorSupplier: form.vendorSupplier,
      remarks: form.remarks,
      sakhyaOpportunity: scope === 'block' ? form.sakhyaOpportunity : false,
      filledBy: currentUser.id,
      date: new Date().toISOString().slice(0, 10),
    })
    setForm({ ...EMPTY, productName: presetProduct ? presetProduct.name : '' })
    await reload()
    setSaving(false)
  }

  const visibleEntries = presetProductId ? entries.filter((e) => e.productId === presetProductId) : entries

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold">Stage 1 · Institution survey</h1>
        <p className="text-sm text-inksoft">
          {place?.name} — hospitals, schools, dhabas and gyms are bulk buyers from local Vatikas.
        </p>
        {presetProduct && (
          <div className="mt-2 rounded-lg bg-tealsoft px-3 py-2 text-xs font-bold text-teal">
            📍 Logging another institution for {presetProduct.icon} {presetProduct.name} — already filled in below.
          </div>
        )}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-linestrong bg-surface p-4">
        <div>
          <FieldLabel>Institution name</FieldLabel>
          <TextField value={form.institutionName} onChange={(v) => set({ institutionName: v })} placeholder="e.g. Govt. School, Ratanpur" />
          {errors.institutionName && <p className="mt-1 text-[11px] font-bold text-crit">{errors.institutionName}</p>}
        </div>
        <div>
          <FieldLabel>Institution type</FieldLabel>
          <BigChoice options={TYPES} value={form.institutionType} onChange={(v) => set({ institutionType: v })} columns={3} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel>Contact name</FieldLabel>
            <TextField value={form.contactName} onChange={(v) => set({ contactName: v })} />
          </div>
          <div>
            <FieldLabel>Contact number</FieldLabel>
            <TextField value={form.contactNumber} onChange={(v) => set({ contactNumber: v })} />
          </div>
        </div>
        <div>
          <FieldLabel>Location</FieldLabel>
          <TextField value={form.location} onChange={(v) => set({ location: v })} />
        </div>
        <div>
          <FieldLabel>Product name</FieldLabel>
          {presetProduct ? (
            <div className="rounded-lg border-2 border-linestrong bg-surface px-3 py-2 text-sm font-bold">{presetProduct.icon} {presetProduct.name}</div>
          ) : (
            <TextField value={form.productName} onChange={(v) => set({ productName: v })} placeholder="Type product name" />
          )}
          {errors.productName && <p className="mt-1 text-[11px] font-bold text-crit">{errors.productName}</p>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel>Unit</FieldLabel>
            <TextField value={form.unit} onChange={(v) => set({ unit: v })} placeholder="pkt / kg / ltr / pcs" />
          </div>
          <div>
            <FieldLabel>Buying price (₹)</FieldLabel>
            <NumberField value={form.buyingPrice} onChange={(v) => set({ buyingPrice: v })} prefix="₹" />
            {errors.buyingPrice && <p className="mt-1 text-[11px] font-bold text-crit">{errors.buyingPrice}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel>Volume required — min</FieldLabel>
            <NumberField value={form.volumeMin} onChange={(v) => set({ volumeMin: v })} />
          </div>
          <div>
            <FieldLabel>Volume required — max</FieldLabel>
            <NumberField value={form.volumeMax} onChange={(v) => set({ volumeMax: v })} />
            {errors.volumeMax && <p className="mt-1 text-[11px] font-bold text-crit">{errors.volumeMax}</p>}
          </div>
        </div>
        <div>
          <FieldLabel>Buying frequency</FieldLabel>
          <BigChoice options={['monthly', 'yearly']} value={form.buyingFrequency} onChange={(v) => set({ buyingFrequency: v })} />
        </div>
        <div>
          <FieldLabel>Current vendor / supplier (if any)</FieldLabel>
          <TextField value={form.vendorSupplier} onChange={(v) => set({ vendorSupplier: v })} />
        </div>
        {scope === 'block' && (
          <div>
            <FieldLabel>Any Sakhya opportunity linked here?</FieldLabel>
            <YesNo value={form.sakhyaOpportunity} onChange={(v) => set({ sakhyaOpportunity: v })} />
          </div>
        )}
        <div>
          <FieldLabel>Remarks (optional)</FieldLabel>
          <TextField value={form.remarks} onChange={(v) => set({ remarks: v })} placeholder="Gaps / opportunities noticed" />
        </div>

        <PrimaryButton type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save & add another'}
        </PrimaryButton>
      </form>

      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">
          {presetProduct ? `${presetProduct.name} — logged so far` : 'Logged so far'} ({visibleEntries.length})
        </div>
        <div className="flex flex-col gap-2">
          {visibleEntries
            .slice()
            .reverse()
            .map((e) => (
              <div key={e.id} className="rounded-xl border border-line bg-surface p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{e.productName}</span>
                  <span className="tabular text-inksoft">₹{e.buyingPrice}</span>
                </div>
                <div className="text-[11px] text-inksoft">
                  {e.institutionName} ({e.institutionType}) · {e.volumeMin}-{e.volumeMax} {e.unit}/{e.buyingFrequency}
                  {e.sakhyaOpportunity && <span className="ml-1 font-bold text-teal">· Sakhya lead</span>}
                </div>
              </div>
            ))}
          {visibleEntries.length === 0 && <div className="text-sm text-inkfaint">Nothing logged yet.</div>}
        </div>
      </div>
    </div>
  )
}
