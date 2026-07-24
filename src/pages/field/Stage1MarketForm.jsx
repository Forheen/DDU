import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { listProducts, findOrCreateProductByName, getProduct } from '../../services/productRepository.js'
import { createMarketEntry, listMarketEntries } from '../../services/stage1Repository.js'
import { getVatika } from '../../services/vatikaRepository.js'
import { getBlock } from '../../services/blockRepository.js'
import { BigChoice, NumberField, TextField, Select, YesNo, FieldLabel, PrimaryButton } from '../../components/FormControls.jsx'

const SHOPS_SELLING = ['1', '2-3', '4-6', '7+']
const FREQUENCY = ['weekly', 'fortnightly', 'monthly']

const EMPTY = {
  productName: '',
  shopName: '',
  shopContact: '',
  shopLocation: '',
  brand: 'local',
  unit: '',
  mrp: '',
  buyingFrequency: 'monthly',
  volumeEstimate: '',
  shopsSelling: '2-3',
  seasonal: false,
  remarks: '',
}

export function Stage1MarketForm({ scope }) {
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
    setEntries(await listMarketEntries(filter))
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
    if (!form.shopName.trim()) next.shopName = 'Shop name is required.'
    if (form.mrp !== '' && Number(form.mrp) < 0) next.mrp = 'MRP can’t be negative.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const product = await findOrCreateProductByName(form.productName)
    await createMarketEntry({
      scope,
      vatikaId: scope === 'block' ? null : vatikaId,
      blockId: scope === 'block' ? blockId : null,
      productId: product.id,
      productName: product.name,
      shopName: form.shopName,
      shopContact: form.shopContact,
      shopLocation: form.shopLocation,
      brand: form.brand,
      unit: form.unit,
      mrp: Number(form.mrp) || 0,
      buyingFrequency: form.buyingFrequency,
      volumeEstimate: form.volumeEstimate,
      shopsSelling: form.shopsSelling,
      seasonal: form.seasonal,
      remarks: form.remarks,
      filledBy: currentUser.id,
      date: new Date().toISOString().slice(0, 10),
    })
    setForm((f) => ({
      ...EMPTY,
      shopName: f.shopName,
      shopContact: f.shopContact,
      shopLocation: f.shopLocation,
      productName: presetProduct ? presetProduct.name : '',
    }))
    await reload()
    setSaving(false)
  }

  const visibleEntries = presetProductId ? entries.filter((e) => e.productId === presetProductId) : entries

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold">Stage 1 · Market survey</h1>
        <p className="text-sm text-inksoft">
          {scope === 'block' ? 'Block-wide business mapping' : 'Vatika-level RRP survey'} — {place?.name}. Visit at least 3
          Category B shops; fill one row per product you see being sold.
        </p>
        {presetProduct && (
          <div className="mt-2 rounded-lg bg-tealsoft px-3 py-2 text-xs font-bold text-teal">
            📍 Adding another observation for {presetProduct.icon} {presetProduct.name} — already filled in below, change it if you're logging something else.
          </div>
        )}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-linestrong bg-surface p-4">
        <div>
          <FieldLabel>Shop name</FieldLabel>
          <TextField value={form.shopName} onChange={(v) => set({ shopName: v })} placeholder="e.g. Sharma Kirana" />
          {errors.shopName && <p className="mt-1 text-[11px] font-bold text-crit">{errors.shopName}</p>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel>Contact no.</FieldLabel>
            <TextField value={form.shopContact} onChange={(v) => set({ shopContact: v })} />
          </div>
          <div>
            <FieldLabel>Village / location</FieldLabel>
            <TextField value={form.shopLocation} onChange={(v) => set({ shopLocation: v })} />
          </div>
        </div>

        <div>
          <FieldLabel>Product name</FieldLabel>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                value={products.some((p) => p.name === form.productName) ? form.productName : ''}
                onChange={(v) => set({ productName: v })}
                options={products.map((p) => ({ value: p.name, label: `${p.icon} ${p.name}` }))}
                placeholder="Choose from list…"
              />
            </div>
          </div>
          <div className="mt-1.5">
            <TextField value={form.productName} onChange={(v) => set({ productName: v })} placeholder="…or type a new product name" />
          </div>
          {errors.productName && <p className="mt-1 text-[11px] font-bold text-crit">{errors.productName}</p>}
        </div>

        <div>
          <FieldLabel>Brand</FieldLabel>
          <BigChoice options={[{ value: 'local', label: 'Local' }, { value: 'branded', label: 'Branded' }]} value={form.brand} onChange={(v) => set({ brand: v })} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel>Unit</FieldLabel>
            <TextField value={form.unit} onChange={(v) => set({ unit: v })} placeholder="pkt / kg / ltr / pcs" />
          </div>
          <div>
            <FieldLabel>MRP (₹)</FieldLabel>
            <NumberField value={form.mrp} onChange={(v) => set({ mrp: v })} prefix="₹" />
            {errors.mrp && <p className="mt-1 text-[11px] font-bold text-crit">{errors.mrp}</p>}
          </div>
        </div>

        <div>
          <FieldLabel>Buying frequency</FieldLabel>
          <BigChoice options={FREQUENCY} value={form.buyingFrequency} onChange={(v) => set({ buyingFrequency: v })} columns={3} />
        </div>

        <div>
          <FieldLabel>Roughly how much sells per week/month</FieldLabel>
          <TextField value={form.volumeEstimate} onChange={(v) => set({ volumeEstimate: v })} placeholder="e.g. 30-100/week" />
        </div>

        <div>
          <FieldLabel>How many shops sell this</FieldLabel>
          <BigChoice options={SHOPS_SELLING} value={form.shopsSelling} onChange={(v) => set({ shopsSelling: v })} columns={4} />
        </div>

        <div>
          <FieldLabel>Seasonal sale?</FieldLabel>
          <YesNo value={form.seasonal} onChange={(v) => set({ seasonal: v })} />
        </div>

        <div>
          <FieldLabel>Remarks (optional)</FieldLabel>
          <TextField value={form.remarks} onChange={(v) => set({ remarks: v })} placeholder="Gaps / opportunities noticed" />
        </div>

        <PrimaryButton type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save & add another product'}
        </PrimaryButton>
      </form>

      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">
          {presetProduct ? `${presetProduct.name} — logged so far` : `This visit — ${entries.length} product(s) logged`} ({visibleEntries.length})
        </div>
        <div className="flex flex-col gap-2">
          {visibleEntries
            .slice()
            .reverse()
            .map((e) => (
              <div key={e.id} className="rounded-xl border border-line bg-surface p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{e.productName}</span>
                  <span className="tabular text-inksoft">₹{e.mrp}</span>
                </div>
                <div className="text-[11px] text-inksoft">
                  {e.shopName} · {e.shopsSelling} shops selling · {e.volumeEstimate || '—'}
                </div>
              </div>
            ))}
          {visibleEntries.length === 0 && <div className="text-sm text-inkfaint">Nothing logged yet.</div>}
        </div>
      </div>
    </div>
  )
}
