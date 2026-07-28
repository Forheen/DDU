import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { getAssessment, saveAssessment, getFinalRanking } from '../../services/stage2Repository.js'
import { listMarketEntries, listInstitutionEntries } from '../../services/stage1Repository.js'
import { getProduct } from '../../services/productRepository.js'
import { getVatika } from '../../services/vatikaRepository.js'
import { listUsers } from '../../services/userRepository.js'
import { Stage2Assessment, READINESS_FACTORS, EXTERNAL_SUPPORT_OPTIONS } from '../../models/index.js'
import { BigChoice, NumberField, TextField, YesNo, FieldLabel, PrimaryButton, GhostButton } from '../../components/FormControls.jsx'
import { Stage1Recap } from '../../components/StageRecaps.jsx'

const TABS = ['A · Basic', 'B · Priority', 'C · Critical', 'D · Sample', 'E · Ready']

const RAW_SOURCE_OPTIONS = [
  { value: 'producer', label: 'Producer / Farmer' },
  { value: 'local_market', label: 'Local market' },
  { value: 'outside', label: 'Outside market' },
]
const MARKET_OPTIONS = [
  { value: 'local', label: 'Local' },
  { value: 'outside', label: 'Outside' },
]

export function Stage2Wizard() {
  const { vatikaId, productId } = useParams()
  const { currentUser } = useAuth()
  const [product, setProduct] = useState(null)
  const [vatika, setVatika] = useState(null)
  const [form, setForm] = useState(null)
  const [tab, setTab] = useState(0)
  const [ranking, setRanking] = useState([])
  const [stage1, setStage1] = useState(null)
  const [usersById, setUsersById] = useState({})
  const [showStage1, setShowStage1] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      setProduct(await getProduct(productId))
      setVatika(await getVatika(vatikaId))
      const existing = await getAssessment(vatikaId, productId)
      setForm(
        existing ||
          new Stage2Assessment({
            id: null,
            vatikaId,
            productId,
            filledBy: currentUser.id,
            date: new Date().toISOString().slice(0, 10),
          }),
      )
      setRanking(await getFinalRanking(vatikaId))
      const [marketEntries, institutionEntries, users] = await Promise.all([
        listMarketEntries({ vatikaId, productId }),
        listInstitutionEntries({ vatikaId, productId }),
        listUsers(),
      ])
      setStage1({ marketEntries, institutionEntries })
      setUsersById(Object.fromEntries(users.map((u) => [u.id, u])))
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vatikaId, productId])

  async function patch(fields) {
    const merged = new Stage2Assessment({ ...form, ...fields })
    setForm(merged)
    await saveAssessment(vatikaId, productId, { ...fields, filledBy: currentUser.id })
    setRanking(await getFinalRanking(vatikaId))
  }

  function toggleSupport(opt) {
    const has = form.externalSupportNeeded.includes(opt)
    patch({ externalSupportNeeded: has ? form.externalSupportNeeded.filter((o) => o !== opt) : [...form.externalSupportNeeded, opt] })
  }

  function setReadiness(key, val) {
    patch({ readiness: { ...form.readiness, [key]: val } })
  }

  if (!form || !product) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  const showReadiness = form.sampleAvailable === false
  const effectiveTabs = showReadiness ? TABS : TABS.slice(0, 4)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-sm font-bold text-inksoft">{vatika?.name}</div>
        <h1 className="font-display text-xl font-bold">
          {product.icon} {product.name} — Stage 2
        </h1>
      </div>

      <div className="rounded-xl border border-line bg-surface p-3">
        <button className="flex w-full items-center justify-between text-left" onClick={() => setShowStage1((s) => !s)}>
          <span className="text-xs font-bold text-teal">
            📋 What Stage 1 found {stage1 ? `(${stage1.marketEntries.length + stage1.institutionEntries.length})` : ''}
          </span>
          <span className="text-xs text-inkfaint">{showStage1 ? '▾' : '▸'}</span>
        </button>
        {showStage1 && (
          <div className="mt-2 border-t border-line pt-2">
            <Stage1Recap marketEntries={stage1?.marketEntries} institutionEntries={stage1?.institutionEntries} usersById={usersById} />
          </div>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {effectiveTabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-bold ${
              tab === i ? 'bg-teal text-white' : 'bg-surface text-inkfaint border border-line'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-linestrong bg-surface p-4">
        {tab === 0 && (
          <div className="flex flex-col gap-3">
            <div>
              <FieldLabel>Demand confirmed by local market survey?</FieldLabel>
              <YesNo value={form.demandConfirmed} onChange={(v) => patch({ demandConfirmed: v })} />
            </div>
            <div>
              <FieldLabel>Main raw material needed</FieldLabel>
              <TextField value={form.rawMaterial} onChange={(v) => patch({ rawMaterial: v })} />
            </div>
            <div>
              <FieldLabel>Raw material available in-village / from local producer?</FieldLabel>
              <YesNo value={form.rawMaterialAvailableLocally} onChange={(v) => patch({ rawMaterialAvailableLocally: v })} />
            </div>
            <div>
              <FieldLabel>Training needed for quality?</FieldLabel>
              <YesNo value={form.trainingNeeded} onChange={(v) => patch({ trainingNeeded: v })} />
              {form.trainingNeeded && (
                <div className="mt-2">
                  <TextField value={form.trainingKind} onChange={(v) => patch({ trainingKind: v })} placeholder="What kind of training?" />
                </div>
              )}
            </div>
            <div>
              <FieldLabel>Trained women / Vaibhavis available?</FieldLabel>
              <YesNo value={form.trainedWomenAvailable} onChange={(v) => patch({ trainedWomenAvailable: v })} />
            </div>
            <div>
              <FieldLabel>External support needed</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {EXTERNAL_SUPPORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => toggleSupport(opt)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      form.externalSupportNeeded.includes(opt) ? 'bg-accent text-accentink' : 'border border-linestrong text-inksoft'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 1 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-inksoft">Priority is set by where the raw material comes from and where the product sells.</p>
            <div>
              <FieldLabel>Raw material source</FieldLabel>
              <BigChoice options={RAW_SOURCE_OPTIONS} value={form.rawSource} onChange={(v) => patch({ rawSource: v })} columns={1} />
            </div>
            <div>
              <FieldLabel>Market</FieldLabel>
              <BigChoice options={MARKET_OPTIONS} value={form.market} onChange={(v) => patch({ market: v })} />
            </div>
            <div className="rounded-lg bg-accentsoft px-3 py-2 text-center text-sm font-bold text-accentink">
              {form.priorityLevel ? `Priority ${form.priorityLevel}` : 'Choose both to see priority level'}
            </div>
          </div>
        )}

        {tab === 2 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-inksoft">Both must be Yes — a single No stops the product here, regardless of Priority.</p>
            <div>
              <FieldLabel>Packaging locally available / sourceable nearby?</FieldLabel>
              <YesNo value={form.packagingAvailable} onChange={(v) => patch({ packagingAvailable: v })} />
            </div>
            <div>
              <FieldLabel>Can this be produced in the village?</FieldLabel>
              <YesNo value={form.producibleInVillage} onChange={(v) => patch({ producibleInVillage: v })} />
            </div>
            {form.criticalPass !== null && (
              <div className={`rounded-lg px-3 py-2 text-center text-sm font-bold ${form.criticalPass ? 'bg-goodbg text-good' : 'bg-critbg text-crit'}`}>
                {form.criticalPass ? '✓ PROCEED NEXT' : '✕ DO NOT PROCEED — product dropped'}
              </div>
            )}
          </div>
        )}

        {tab === 3 && form.criticalPass !== false && (
          <div className="flex flex-col gap-3">
            <FieldLabel>Already produced locally &amp; sample available?</FieldLabel>
            <YesNo value={form.sampleAvailable} onChange={(v) => patch({ sampleAvailable: v })} />
            {form.sampleAvailable === true && (
              <div className="rounded-lg bg-goodbg px-3 py-2 text-xs font-bold text-good">
                Sample ready — skip Readiness, go straight to Cost Economics.
              </div>
            )}
            {form.sampleAvailable === false && (
              <div className="rounded-lg bg-tealsoft px-3 py-2 text-xs font-bold text-teal">No sample — continue to Part E, Readiness Check.</div>
            )}
          </div>
        )}

        {tab === 4 && showReadiness && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-inksoft">Score each factor 0 or 1.</p>
            {READINESS_FACTORS.map((f) => (
              <div key={f.key} className="flex items-center justify-between">
                <span className="text-sm">{f.label}</span>
                <div className="flex gap-1">
                  {[0, 1].map((v) => (
                    <button
                      key={v}
                      onClick={() => setReadiness(f.key, v)}
                      className={`h-8 w-8 rounded-lg border-2 text-xs font-bold ${
                        form.readiness[f.key] === v ? 'border-good bg-goodbg text-good' : 'border-linestrong text-inkfaint'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {form.readinessScore !== null && (
              <div className="rounded-lg bg-goodbg px-3 py-2 text-center text-sm font-bold text-good">
                Readiness: {form.readinessScore} / {READINESS_FACTORS.length}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {tab > 0 && <GhostButton onClick={() => setTab(tab - 1)}>Back</GhostButton>}
        {tab < effectiveTabs.length - 1 && <PrimaryButton onClick={() => setTab(tab + 1)}>Next</PrimaryButton>}
        {tab === effectiveTabs.length - 1 && form.outcome !== 'dropped' && (
          <PrimaryButton onClick={() => navigate(`/vatikas/${vatikaId}/products/${productId}/cost-economics`)}>
            Continue to Cost Economics →
          </PrimaryButton>
        )}
      </div>

      {ranking.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-inkfaint">Final ranking for {vatika?.name}</div>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-line bg-surface text-[10px] uppercase text-inkfaint">
                  <th className="p-2 text-left">Product</th>
                  <th className="p-2">Priority</th>
                  <th className="p-2">Critical</th>
                  <th className="p-2">Sample</th>
                  <th className="p-2">Readiness</th>
                  <th className="p-2">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => (
                  <tr key={r.productId} className="border-b border-line last:border-0">
                    <td className="p-2 font-bold">
                      <Link to={`/vatikas/${vatikaId}/products/${r.productId}`}>{r.productId}</Link>
                    </td>
                    <td className="p-2 text-center tabular">{r.priorityLevel ?? '—'}</td>
                    <td className="p-2 text-center">{r.criticalPass === null ? '—' : r.criticalPass ? 'Pass' : 'Fail'}</td>
                    <td className="p-2 text-center">{r.sampleAvailable === null ? '—' : r.sampleAvailable ? 'Yes' : 'No'}</td>
                    <td className="p-2 text-center tabular">{r.readinessScore ?? '—'}</td>
                    <td className="p-2 text-center capitalize">{r.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
