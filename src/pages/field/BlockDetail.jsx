import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBlock } from '../../services/blockRepository.js'
import { getDistrict } from '../../services/districtRepository.js'
import { listVatikasByBlock } from '../../services/vatikaRepository.js'
import { getProductIdsForVatika, getBlockVatikaMatch } from '../../services/dduService.js'

export function BlockDetail() {
  const { blockId } = useParams()
  const [block, setBlock] = useState(null)
  const [district, setDistrict] = useState(null)
  const [vatikas, setVatikas] = useState(null)
  const [match, setMatch] = useState(null)

  useEffect(() => {
    async function load() {
      const [b, vs, m] = await Promise.all([getBlock(blockId), listVatikasByBlock(blockId), getBlockVatikaMatch(blockId)])
      setBlock(b)
      setDistrict(b.districtId ? await getDistrict(b.districtId) : null)
      setVatikas(vs.map((v) => ({ vatika: v, productCount: getProductIdsForVatika(v.id).length })))
      setMatch(m)
    }
    load()
  }, [blockId])

  if (!block || !vatikas) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold">{block.name}</h1>
        <p className="text-sm text-inksoft">{district?.name} district · {vatikas.length} Vatikas</p>
      </div>

      <div className="flex gap-2">
        <Link to={`/blocks/${blockId}/stage1/market/new`} className="flex-1 rounded-lg bg-accent px-3 py-2 text-center text-xs font-bold text-accentink">
          + Block market survey
        </Link>
        <Link to={`/blocks/${blockId}/stage1/institution/new`} className="flex-1 rounded-lg border-2 border-linestrong px-3 py-2 text-center text-xs font-bold text-inksoft">
          + Block institution survey
        </Link>
      </div>

      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">Vatikas in this Block</div>
        <div className="flex flex-col gap-2">
          {vatikas.map(({ vatika, productCount }) => (
            <Link key={vatika.id} to={`/vatikas/${vatika.id}`} className="flex items-center justify-between rounded-xl border border-linestrong bg-surface p-3">
              <div>
                <div className="text-sm font-bold">{vatika.name}</div>
                <div className="text-[11px] text-inksoft">{vatika.region}</div>
              </div>
              <div className="text-xs font-bold text-teal">{productCount} product{productCount === 1 ? '' : 's'}</div>
            </Link>
          ))}
        </div>
      </div>

      {match && match.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">Block ↔ Vatika match</div>
          <p className="mb-2 text-[11px] text-inksoft">How many Vatikas in this Block already surveyed a product the Block-wide survey found — a high match is a candidate for one larger, shared DDU.</p>
          <div className="flex flex-col gap-2">
            {match.map((m) => (
              <div key={m.productId} className="rounded-xl border border-linestrong bg-surface p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold">{m.productName}</div>
                  <div className="text-xs font-bold text-teal">{m.matchPct}%</div>
                </div>
                <div className="text-[11px] text-inksoft">
                  {m.blockFindings} Block finding(s) · in {m.matchCount} of {m.totalVatikas} Vatikas
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
