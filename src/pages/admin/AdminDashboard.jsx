import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllDDUs } from '../../services/dduService.js'
import { listBlocks } from '../../services/blockRepository.js'
import { StatusChip } from '../../components/StatusChip.jsx'
import { SummaryStrip } from '../../components/SummaryStrip.jsx'

function overallStatus(ddu) {
  if (ddu.isLive) return 'live'
  if (ddu.isBlocked) return 'blocked'
  if (ddu.stage3Status !== 'missing') return 'in-progress'
  if (ddu.costEconomicsStatus !== 'missing') return 'in-progress'
  if (ddu.stage2Status !== 'missing') return 'in-progress'
  return 'new'
}

const STATUS_LABEL = { live: 'Live', blocked: 'Blocked', 'in-progress': 'In progress', new: 'New' }

export function AdminDashboard() {
  const [blocks, setBlocks] = useState([])
  const [ddus, setDdus] = useState(null)
  const [blockFilter, setBlockFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    listBlocks().then(setBlocks)
    getAllDDUs().then(setDdus)
  }, [])

  const filtered = useMemo(() => {
    if (!ddus) return []
    return ddus.filter((d) => {
      if (blockFilter !== 'all' && !d.vatikas.some((v) => v.blockId === blockFilter)) return false
      if (statusFilter !== 'all' && overallStatus(d) !== statusFilter) return false
      return true
    })
  }, [ddus, blockFilter, statusFilter])

  if (!ddus) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold">All DDUs, every Block, every Vatika</h1>
        <p className="text-sm text-inksoft">One flat list — {ddus.length} product/DDU records total.</p>
      </div>

      <SummaryStrip
        items={[
          { label: 'Live', value: ddus.filter((d) => overallStatus(d) === 'live').length, tone: 'good' },
          { label: 'In progress', value: ddus.filter((d) => overallStatus(d) === 'in-progress').length, tone: 'accent' },
          { label: 'Blocked', value: ddus.filter((d) => overallStatus(d) === 'blocked').length, tone: 'warn' },
          { label: 'New / untouched', value: ddus.filter((d) => overallStatus(d) === 'new').length, tone: 'neutral' },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <FilterChip active={blockFilter === 'all'} onClick={() => setBlockFilter('all')}>All Blocks</FilterChip>
        {blocks.map((b) => (
          <FilterChip key={b.id} active={blockFilter === b.id} onClick={() => setBlockFilter(b.id)}>{b.name}</FilterChip>
        ))}
        <span className="mx-2 self-center text-inkfaint">|</span>
        {['all', 'live', 'in-progress', 'blocked', 'new'].map((s) => (
          <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s === 'all' ? 'All statuses' : STATUS_LABEL[s]}</FilterChip>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[10px] uppercase text-inkfaint">
              <th className="p-3">Product / DDU</th>
              <th className="p-3">Vatika</th>
              <th className="p-3">Block</th>
              <th className="p-3">Stage reached</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Monthly profit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-line last:border-0 hover:bg-bg">
                <td className="p-3">
                  <Link to={`/admin/ddu/${d.id}`} className="font-bold text-ink hover:underline">
                    {d.product?.icon} {d.product?.name}
                  </Link>
                </td>
                <td className="p-3">
                  {d.vatikas.map((v) => v.name).join(' + ')}
                  {d.isMerged && <span className="ml-1 text-[10px] font-bold text-teal">🔗</span>}
                </td>
                <td className="p-3 text-inksoft">{blocks.find((b) => b.id === d.vatika?.blockId)?.name}</td>
                <td className="p-3 tabular">{d.stageReached} / 4</td>
                <td className="p-3">
                  <StatusChip status={overallStatus(d) === 'live' ? 'done' : overallStatus(d) === 'blocked' ? 'blocked' : overallStatus(d) === 'new' ? 'missing' : 'partial'}>
                    {STATUS_LABEL[overallStatus(d)]}
                  </StatusChip>
                </td>
                <td className="p-3 text-right tabular">{d.monthlyProfit != null ? `₹${d.monthlyProfit.toFixed(0)}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-6 text-center text-sm text-inkfaint">No DDUs match this filter.</div>}
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-bold ${active ? 'bg-teal text-white' : 'border border-linestrong text-inksoft'}`}
    >
      {children}
    </button>
  )
}
