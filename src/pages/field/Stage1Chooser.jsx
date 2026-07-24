import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { expandScopeToVatikaIds } from '../../services/scopeService.js'
import { getVatika } from '../../services/vatikaRepository.js'
import { getBlock } from '../../services/blockRepository.js'
import { ROLES, SCOPE, SOURCE } from '../../models/index.js'
import { Select, PrimaryButton } from '../../components/FormControls.jsx'

const INSTRUCTIONS = {
  [`${SCOPE.VATIKA}:${SOURCE.MARKET}`]: 'Vatika-Market: visit at least 3 Category B shops. Priority: local brand + volume + willing shopkeeper.',
  [`${SCOPE.VATIKA}:${SOURCE.INSTITUTION}`]: 'Vatika-Institution: hospitals, schools, dhabas and gyms nearby — bulk buyers from this Vatika.',
  [`${SCOPE.BLOCK}:${SOURCE.MARKET}`]: 'Block-Market: map businesses across the whole Block — this is how larger, shared DDUs get found.',
  [`${SCOPE.BLOCK}:${SOURCE.INSTITUTION}`]: 'Block-Institution: same, but for institutions Block-wide — also flags Sakhya-opportunity leads.',
}

export function Stage1Chooser() {
  const { currentUser, activeRole } = useAuth()
  const navigate = useNavigate()
  const [scope, setScope] = useState(SCOPE.VATIKA)
  const [source, setSource] = useState(SOURCE.MARKET)
  const [vatikaOptions, setVatikaOptions] = useState([])
  const [blockOptions, setBlockOptions] = useState([])
  const [vatikaId, setVatikaId] = useState('')
  const [blockId, setBlockId] = useState('')

  useEffect(() => {
    async function load() {
      const roleScope = currentUser.scopeFor(activeRole)
      const vatikaIds = await expandScopeToVatikaIds(roleScope)
      const vatikas = await Promise.all(vatikaIds.map(getVatika))
      setVatikaOptions(vatikas)
      if (vatikas[0]) setVatikaId(vatikas[0].id)

      const blockIds = [...new Set(vatikas.map((v) => v.blockId))]
      const blocks = await Promise.all(blockIds.map(getBlock))
      setBlockOptions(blocks)
      if (blocks[0]) setBlockId(blocks[0].id)
    }
    load()
  }, [currentUser, activeRole])

  function start() {
    const id = scope === SCOPE.VATIKA ? vatikaId : blockId
    if (!id) return
    const base = scope === SCOPE.VATIKA ? `/vatikas/${id}` : `/blocks/${id}`
    navigate(`${base}/stage1/${source}/new`)
  }

  const canStart = scope === SCOPE.VATIKA ? Boolean(vatikaId) : Boolean(blockId)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold">Stage 1 · Start a survey</h1>
        <p className="text-sm text-inksoft">Where and what kind?</p>
      </div>

      <div>
        <div className="mb-1.5 text-xs font-bold text-inksoft">Scope</div>
        <div className="flex gap-2">
          <button
            onClick={() => setScope(SCOPE.VATIKA)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold ${scope === SCOPE.VATIKA ? 'bg-teal text-white' : 'border-2 border-linestrong text-inksoft'}`}
          >
            Vatika
          </button>
          <button
            onClick={() => setScope(SCOPE.BLOCK)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold ${scope === SCOPE.BLOCK ? 'bg-teal text-white' : 'border-2 border-linestrong text-inksoft'}`}
          >
            Whole Block
          </button>
        </div>
      </div>

      {scope === SCOPE.VATIKA ? (
        <Select value={vatikaId} onChange={setVatikaId} options={vatikaOptions.map((v) => ({ value: v.id, label: v.name }))} placeholder="Choose a Vatika…" />
      ) : (
        <Select value={blockId} onChange={setBlockId} options={blockOptions.map((b) => ({ value: b.id, label: b.name }))} placeholder="Choose a Block…" />
      )}

      <div>
        <div className="mb-1.5 text-xs font-bold text-inksoft">Source</div>
        <div className="flex gap-2">
          <button
            onClick={() => setSource(SOURCE.MARKET)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold ${source === SOURCE.MARKET ? 'bg-teal text-white' : 'border-2 border-linestrong text-inksoft'}`}
          >
            Market visit
          </button>
          <button
            onClick={() => setSource(SOURCE.INSTITUTION)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold ${source === SOURCE.INSTITUTION ? 'bg-teal text-white' : 'border-2 border-linestrong text-inksoft'}`}
          >
            Institution
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-linestrong bg-surface p-3 text-xs text-inksoft">
        {INSTRUCTIONS[`${scope}:${source}`]}
      </div>

      <div className="flex-1" />
      <PrimaryButton onClick={start} disabled={!canStart}>
        Start logging shops
      </PrimaryButton>
      {vatikaOptions.length === 0 && scope === SCOPE.VATIKA && (
        <p className="text-center text-[11px] text-crit">No Vatika assigned to you yet — ask Admin to check your assignment.</p>
      )}
    </div>
  )
}
