import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getVatika } from '../../services/vatikaRepository.js'
import { getBlock } from '../../services/blockRepository.js'
import { getProductStatusBoard } from '../../services/dduService.js'
import { getRankedProducts } from '../../services/stage1Repository.js'
import { StatusChip } from '../../components/StatusChip.jsx'
import { CategoryTag } from '../../components/CategoryTag.jsx'

export function VatikaDetail() {
  const { vatikaId } = useParams()
  const [vatika, setVatika] = useState(null)
  const [block, setBlock] = useState(null)
  const [ddus, setDdus] = useState(null)
  const [ranked, setRanked] = useState(null)

  useEffect(() => {
    async function load() {
      const v = await getVatika(vatikaId)
      setVatika(v)
      setBlock(await getBlock(v.blockId))
      setDdus(await getProductStatusBoard(vatikaId))
      setRanked(await getRankedProducts(vatikaId))
    }
    load()
  }, [vatikaId])

  if (!vatika || !ddus) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold">{vatika.name}</h1>
        <p className="text-sm text-inksoft">{block?.name} · {vatika.region}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border border-line bg-surface p-3">
          <div className="text-lg font-bold tabular">{ddus.length}</div>
          <div className="text-[10px] font-bold text-inksoft">Products tracked</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3">
          <div className="text-lg font-bold tabular">{ddus.filter((d) => d.isLive).length}</div>
          <div className="text-[10px] font-bold text-inksoft">DDUs live</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Link to={`/vatikas/${vatikaId}/stage1/market/new`} className="flex-1 rounded-lg bg-accent px-3 py-2 text-center text-xs font-bold text-accentink">
          + Survey a shop
        </Link>
        <Link to={`/vatikas/${vatikaId}/stage1/institution/new`} className="flex-1 rounded-lg border-2 border-linestrong px-3 py-2 text-center text-xs font-bold text-inksoft">
          + Log institution
        </Link>
      </div>

      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">Products in this Vatika</div>
        <div className="flex flex-col gap-2">
          {ddus.map((d) => (
            <Link key={d.id} to={`/vatikas/${vatikaId}/products/${d.productId}`} className="rounded-xl border border-linestrong bg-surface p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold">
                    {d.product?.icon} {d.product?.name}
                  </div>
                  {d.product && <CategoryTag category={d.product.category} />}
                </div>
                <div className="flex gap-1">
                  <StatusChip status={d.stage1Status}>1</StatusChip>
                  <StatusChip status={d.stage2Status}>2</StatusChip>
                  <StatusChip status={d.stage3Status}>3</StatusChip>
                </div>
              </div>
            </Link>
          ))}
          {ddus.length === 0 && (
            <div className="rounded-xl border border-dashed border-linestrong p-4 text-center text-sm text-inkfaint">
              Nothing surveyed here yet — this Vatika isn't staffed with data yet.
            </div>
          )}
        </div>
      </div>

      {ranked && ranked.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">Stage 1 ranking (raw input for SWSM)</div>
          <div className="flex flex-col gap-1.5">
            {ranked.map((r, i) => (
              <div key={r.productId || r.productName} className="flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2 text-xs">
                <span className="font-bold">{i + 1}. {r.productName}</span>
                <span className="text-inksoft">{r.distinctShops} shop(s) · score {r.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
