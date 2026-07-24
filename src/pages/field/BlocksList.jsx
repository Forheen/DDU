import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listBlocks } from '../../services/blockRepository.js'
import { listDistricts } from '../../services/districtRepository.js'
import { listVatikasByBlock } from '../../services/vatikaRepository.js'

export function BlocksList() {
  const [rows, setRows] = useState(null)

  useEffect(() => {
    async function load() {
      const [blocks, districts] = await Promise.all([listBlocks(), listDistricts()])
      const withCounts = await Promise.all(
        blocks.map(async (b) => ({
          block: b,
          districtName: districts.find((d) => d.id === b.districtId)?.name || '',
          vatikas: await listVatikasByBlock(b.id),
        })),
      )
      setRows(withCounts)
    }
    load()
  }, [])

  if (!rows) return <div className="py-10 text-center text-sm text-inkfaint">Loading Blocks…</div>

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-xl font-bold">Blocks</h1>
        <p className="text-sm text-inksoft">A Block holds several Vatikas — larger DDUs live here.</p>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map(({ block, districtName, vatikas }) => (
          <Link key={block.id} to={`/blocks/${block.id}`} className="rounded-xl border border-linestrong bg-surface p-4">
            <div className="text-sm font-bold">{block.name}</div>
            <div className="text-[11px] text-inksoft">{districtName} district</div>
            <div className="mt-1 text-[11px] font-bold text-teal">{vatikas.length} Vatikas</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
