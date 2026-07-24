import { getCollection, insert, update, nextId, simulateLatency } from './db.js'
import { Stage2Assessment } from '../models/index.js'

export async function getAssessment(vatikaId, productId) {
  await simulateLatency()
  const row = getCollection('stage2Assessments').find((a) => a.vatikaId === vatikaId && a.productId === productId)
  return row ? Stage2Assessment.fromJSON(row) : null
}

export async function listAssessmentsByVatika(vatikaId) {
  await simulateLatency()
  return getCollection('stage2Assessments')
    .filter((a) => a.vatikaId === vatikaId)
    .map(Stage2Assessment.fromJSON)
}

export async function saveAssessment(vatikaId, productId, patch) {
  await simulateLatency()
  const existing = getCollection('stage2Assessments').find((a) => a.vatikaId === vatikaId && a.productId === productId)
  if (existing) {
    const row = update('stage2Assessments', existing.id, patch)
    return Stage2Assessment.fromJSON(row)
  }
  const row = insert('stage2Assessments', { id: nextId('a'), vatikaId, productId, readiness: {}, externalSupportNeeded: [], ...patch })
  return Stage2Assessment.fromJSON(row)
}

/**
 * Final Product List for DDU Selection: order by priority, drop Criticality
 * failures, sample-ready products select directly, otherwise use readiness.
 */
export async function getFinalRanking(vatikaId) {
  await simulateLatency()
  const assessments = getCollection('stage2Assessments')
    .filter((a) => a.vatikaId === vatikaId)
    .map(Stage2Assessment.fromJSON)

  return assessments
    .map((a) => ({
      productId: a.productId,
      priorityLevel: a.priorityLevel,
      criticalPass: a.criticalPass,
      sampleAvailable: a.sampleAvailable,
      readinessScore: a.readinessScore,
      outcome: a.outcome,
    }))
    .sort((x, y) => {
      const px = x.priorityLevel ?? 99
      const py = y.priorityLevel ?? 99
      if (px !== py) return px - py
      const rx = x.readinessScore ?? -1
      const ry = y.readinessScore ?? -1
      return ry - rx
    })
}
