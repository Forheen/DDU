import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listBlocks, createBlock } from '../../services/blockRepository.js'
import { listDistricts, createDistrict } from '../../services/districtRepository.js'
import { listVatikasByBlock } from '../../services/vatikaRepository.js'
import { getAllDDUs } from '../../services/dduService.js'
import { assignNewLocationToDefaultRoles } from '../../services/scopeService.js'
import { TextField, Select, PrimaryButton, FieldLabel } from '../../components/FormControls.jsx'

function AddDistrictForm({ onCreated }) {
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('District name is required.')
      return
    }
    setError(null)
    const created = await createDistrict({ name: name.trim() })
    setName('')
    setOpen(false)
    onCreated(created)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-linestrong bg-surface p-3 text-sm font-bold text-teal sm:w-auto sm:px-6"
      >
        + Add a district
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-line bg-surface p-4">
      <FieldLabel>New district name</FieldLabel>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1"><TextField value={name} onChange={setName} placeholder="e.g. Gumla" /></div>
        <div className="flex gap-2">
          <PrimaryButton type="submit">Add district</PrimaryButton>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg border-2 border-linestrong px-4 py-2.5 text-sm font-bold text-inksoft">
            Cancel
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-[11px] font-bold text-crit">{error}</p>}
    </form>
  )
}

function AddBlockForm({ districtId, onCreated }) {
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Block name is required.')
      return
    }
    setError(null)
    const created = await createBlock({ name: name.trim(), districtId })
    setName('')
    setOpen(false)
    onCreated(created)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center rounded-xl border-2 border-dashed border-linestrong bg-surface p-4 text-sm font-bold text-teal"
      >
        + Add a Block here
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-line bg-surface p-4">
      <FieldLabel>New Block name</FieldLabel>
      <TextField value={name} onChange={setName} placeholder="e.g. Ranchi-North" />
      {error && <p className="mt-1 text-[11px] font-bold text-crit">{error}</p>}
      <div className="mt-2 flex gap-2">
        <PrimaryButton type="submit">Add Block</PrimaryButton>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border-2 border-linestrong px-4 py-2 text-sm font-bold text-inksoft">
          Cancel
        </button>
      </div>
    </form>
  )
}

export function AdminBlocks() {
  const [districts, setDistricts] = useState(null)
  const [rows, setRows] = useState(null)

  async function load() {
    const [blocks, districtList] = await Promise.all([listBlocks(), listDistricts()])
    const withStats = await Promise.all(
      blocks.map(async (b) => {
        const vatikas = await listVatikasByBlock(b.id)
        const ddus = await getAllDDUs({ blockId: b.id })
        return {
          block: b,
          vatikaCount: vatikas.length,
          productCount: ddus.length,
          liveCount: ddus.filter((d) => d.isLive).length,
        }
      }),
    )
    setDistricts(districtList)
    setRows(withStats)
  }

  useEffect(() => {
    load()
  }, [])

  // A brand-new district/Block has no children yet, so there's no need to
  // re-run the (expensive, whole-system) stats rollup just to show it —
  // append it straight to state instead of round-tripping through load().
  function handleDistrictCreated(district) {
    setDistricts((prev) => [...prev, district])
    assignNewLocationToDefaultRoles('district', district.id)
  }

  function handleBlockCreated(block) {
    setRows((prev) => [...prev, { block, vatikaCount: 0, productCount: 0, liveCount: 0 }])
    assignNewLocationToDefaultRoles('block', block.id)
  }

  if (!rows || !districts) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Geography — Districts, Blocks &amp; Vatikas</h1>
        <p className="text-sm text-inksoft">
          District → Block → Vatika, and a Vatika is always exactly one village. Add new units below; add Vatikas from inside a Block's
          page.
        </p>
      </div>

      {districts.map((district) => {
        const blockRows = rows.filter((r) => r.block.districtId === district.id)
        return (
          <div key={district.id}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-inkfaint">{district.name} district</h2>
              <span className="text-[11px] text-inksoft">{blockRows.length} Block{blockRows.length === 1 ? '' : 's'}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {blockRows.map(({ block, vatikaCount, productCount, liveCount }) => (
                <Link key={block.id} to={`/admin/blocks/${block.id}`} className="rounded-xl border border-line bg-surface p-4">
                  <div className="text-base font-bold">{block.name}</div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div><div className="text-lg font-bold tabular">{vatikaCount}</div><div className="text-[10px] text-inksoft">Vatikas</div></div>
                    <div><div className="text-lg font-bold tabular">{productCount}</div><div className="text-[10px] text-inksoft">Products</div></div>
                    <div><div className="text-lg font-bold tabular">{liveCount}</div><div className="text-[10px] text-inksoft">DDUs live</div></div>
                  </div>
                </Link>
              ))}
              <AddBlockForm districtId={district.id} onCreated={handleBlockCreated} />
            </div>
          </div>
        )
      })}

      <AddDistrictForm onCreated={handleDistrictCreated} />
    </div>
  )
}
