import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getBlock } from '../../services/blockRepository.js'
import { getDistrict } from '../../services/districtRepository.js'
import { listVatikasByBlock, createVatika } from '../../services/vatikaRepository.js'
import { getAllDDUs, getProductIdsForVatika, getBlockVatikaMatch } from '../../services/dduService.js'
import { listMergeCandidates, createMergedGroup } from '../../services/dduGroupRepository.js'
import { assignNewLocationToDefaultRoles } from '../../services/scopeService.js'
import { listProducts } from '../../services/productRepository.js'
import { StatusChip } from '../../components/StatusChip.jsx'
import { Select, PrimaryButton, TextField, FieldLabel } from '../../components/FormControls.jsx'

function AddVatikaForm({ blockId, onCreated }) {
  const [name, setName] = useState('')
  const [region, setRegion] = useState('')
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Vatika (village) name is required.')
      return
    }
    setError(null)
    const created = await createVatika({ name: name.trim(), blockId, region: region.trim() })
    setName('')
    setRegion('')
    setOpen(false)
    onCreated(created)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center rounded-lg border-2 border-dashed border-linestrong bg-surface p-3 text-sm font-bold text-teal"
      >
        + Add a Vatika (village)
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-line bg-surface p-3 sm:col-span-2 lg:col-span-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel>Village name</FieldLabel>
          <TextField value={name} onChange={setName} placeholder="e.g. Hesalong" />
        </div>
        <div>
          <FieldLabel>Region / landmark (optional)</FieldLabel>
          <TextField value={region} onChange={setRegion} placeholder="optional" />
        </div>
      </div>
      {error && <p className="mt-2 text-[11px] font-bold text-crit">{error}</p>}
      <div className="mt-2 flex gap-2">
        <PrimaryButton type="submit">Add Vatika</PrimaryButton>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border-2 border-linestrong px-4 py-2 text-sm font-bold text-inksoft">
          Cancel
        </button>
      </div>
    </form>
  )
}

function MergeBuilder({ blockId, vatikas, onCreated }) {
  const [products, setProducts] = useState([])
  const [productId, setProductId] = useState('')
  const [candidates, setCandidates] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    listProducts().then(setProducts)
  }, [])

  async function checkProduct(pid) {
    setProductId(pid)
    setSelected(new Set())
    if (!pid) {
      setCandidates(null)
      return
    }
    setCandidates(await listMergeCandidates(vatikas.map((v) => v.id), pid))
  }

  function toggle(vatikaId) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(vatikaId) ? next.delete(vatikaId) : next.add(vatikaId)
      return next
    })
  }

  async function create() {
    setCreating(true)
    const group = await createMergedGroup({ productId, vatikaIds: [...selected], blockId, name: '' })
    setCreating(false)
    onCreated?.()
    navigate(`/admin/ddu/${group.id}`)
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h2 className="mb-1 text-sm font-bold">Merge Vatikas into one DDU</h2>
      <p className="mb-3 text-xs text-inksoft">
        Pool two or more villages' Vaibhavis into one shared business unit for a product — useful when no single Vatika can meet
        demand alone. Only Vatikas that have already passed Stage 2 for this product, with no Stage 3 data started yet, are eligible.
      </p>
      <Select
        value={productId}
        onChange={checkProduct}
        options={products.map((p) => ({ value: p.id, label: `${p.icon} ${p.name}` }))}
        placeholder="Choose a product to merge…"
      />
      {candidates && (
        <div className="mt-3 flex flex-col gap-2">
          {candidates.map((c) => {
            const vatika = vatikas.find((v) => v.id === c.vatikaId)
            return (
              <label
                key={c.vatikaId}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                  c.eligible ? 'border-line' : 'border-dashed border-linestrong opacity-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <input type="checkbox" disabled={!c.eligible} checked={selected.has(c.vatikaId)} onChange={() => toggle(c.vatikaId)} />
                  {vatika?.name}
                </span>
                <span className="text-[11px] text-inksoft">
                  {c.eligible ? 'Eligible' : c.assessment ? 'Already has Stage 3 data or hasn’t passed Stage 2' : 'No passing Stage 2 assessment'}
                </span>
              </label>
            )
          })}
          <PrimaryButton onClick={create} disabled={selected.size < 2 || creating} className="mt-1 w-full sm:w-auto">
            {creating ? 'Creating…' : `Create merged DDU (${selected.size} Vatikas)`}
          </PrimaryButton>
          {selected.size < 2 && (
            <p className="text-[11px] font-bold text-warn">
              Select at least 2 eligible Vatikas to merge — {selected.size} selected so far.
            </p>
          )}
        </div>
      )}
      {candidates && candidates.every((c) => !c.eligible) && (
        <p className="mt-3 text-[11px] font-bold text-crit">No Vatika in this Block is eligible yet — each needs a passing Stage 2 assessment for this product first.</p>
      )}
    </div>
  )
}

export function AdminBlockDetail() {
  const { blockId } = useParams()
  const [block, setBlock] = useState(null)
  const [district, setDistrict] = useState(null)
  const [vatikas, setVatikas] = useState(null)
  const [ddus, setDdus] = useState([])
  const [match, setMatch] = useState([])

  async function load() {
    const [b, vs, all, m] = await Promise.all([
      getBlock(blockId),
      listVatikasByBlock(blockId),
      getAllDDUs({ blockId }),
      getBlockVatikaMatch(blockId),
    ])
    setBlock(b)
    setDistrict(b.districtId ? await getDistrict(b.districtId) : null)
    setVatikas(vs.map((v) => ({ vatika: v, productCount: getProductIdsForVatika(v.id).length })))
    setDdus(all)
    setMatch(m)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockId])

  // A brand-new Vatika has no Stage 1/2/3 data yet, so skip the (much more
  // expensive) full reload and just append it straight to state.
  function handleVatikaCreated(vatika) {
    setVatikas((prev) => [...prev, { vatika, productCount: 0 }])
    assignNewLocationToDefaultRoles('vatika', vatika.id)
  }

  if (!block || !vatikas) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{block.name}</h1>
        <p className="text-sm text-inksoft">{district?.name} district · {vatikas.length} Vatikas</p>
      </div>

      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">Vatikas (villages)</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {vatikas.map(({ vatika, productCount }) => (
            <div key={vatika.id} className="rounded-lg border border-line bg-surface p-3">
              <div className="text-sm font-bold">{vatika.name}</div>
              <div className="text-[11px] text-inksoft">{productCount} product{productCount === 1 ? '' : 's'}</div>
            </div>
          ))}
          <AddVatikaForm blockId={blockId} onCreated={handleVatikaCreated} />
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">Products &amp; DDUs in this Block</div>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[10px] uppercase text-inkfaint">
                <th className="p-3">Product</th>
                <th className="p-3">Vatika(s)</th>
                <th className="p-3">Stage 1</th>
                <th className="p-3">Stage 2</th>
                <th className="p-3">Cost econ.</th>
                <th className="p-3">Stage 3</th>
              </tr>
            </thead>
            <tbody>
              {ddus.map((d) => (
                <tr key={d.id} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <Link to={`/admin/ddu/${d.id}`} className="font-bold hover:underline">{d.product?.name}</Link>
                  </td>
                  <td className="p-3">
                    {d.vatikas.map((v) => v.name).join(' + ')}
                    {d.isMerged && <span className="ml-1 text-[10px] font-bold text-teal">🔗</span>}
                  </td>
                  <td className="p-3"><StatusChip status={d.stage1Status} /></td>
                  <td className="p-3"><StatusChip status={d.stage2Status} /></td>
                  <td className="p-3"><StatusChip status={d.costEconomicsStatus} /></td>
                  <td className="p-3"><StatusChip status={d.stage3Status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MergeBuilder blockId={blockId} vatikas={vatikas.map((v) => v.vatika)} onCreated={load} />

      {match.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">Block ↔ Vatika match</div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {match.map((m) => (
              <div key={m.productId} className="rounded-lg border border-line bg-surface p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{m.productName}</span>
                  <span className="text-xs font-bold text-teal">{m.matchPct}%</span>
                </div>
                <div className="text-[11px] text-inksoft">{m.blockFindings} Block finding(s) · {m.matchCount}/{m.totalVatikas} Vatikas</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
