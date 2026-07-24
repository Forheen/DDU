import { getCollection, insert, update, nextId, simulateLatency } from './db.js'
import { CostEconomics, DEFAULT_MARGINS } from '../models/index.js'

// Cost Economics is shared across every Vatika in a DDU group — one price
// decision for the pooled product, keyed by the group's id (dduId).
export async function getCostEconomics(dduId) {
  await simulateLatency()
  const row = getCollection('costEconomics').find((c) => c.dduId === dduId)
  return row ? CostEconomics.fromJSON(row) : null
}

export async function saveCostEconomics(dduId, patch) {
  await simulateLatency()
  const existing = getCollection('costEconomics').find((c) => c.dduId === dduId)
  if (existing) {
    const row = update('costEconomics', existing.id, patch)
    return CostEconomics.fromJSON(row)
  }
  const row = insert('costEconomics', {
    id: nextId('c'),
    dduId,
    margins: { ...DEFAULT_MARGINS },
    rawMaterialCost: 0,
    packagingCost: 0,
    directLabourCost: 0,
    manufacturingOverhead: 0,
    transportToHub: 0,
    otherCost: 0,
    competitorMRP: null,
    targetInstitutionPrice: null,
    ...patch,
  })
  return CostEconomics.fromJSON(row)
}

export async function getDefaultMargins() {
  await simulateLatency()
  return { ...DEFAULT_MARGINS }
}
