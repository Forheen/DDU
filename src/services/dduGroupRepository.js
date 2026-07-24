import { getCollection, insert, nextId, simulateLatency } from './db.js'
import { DDUGroup, singleVatikaGroupId } from '../models/index.js'
import { getAssessment } from './stage2Repository.js'

export async function getGroup(groupId) {
  await simulateLatency()
  const row = getCollection('dduGroups').find((g) => g.id === groupId)
  return row ? DDUGroup.fromJSON(row) : null
}

/** The group a given Vatika+product currently belongs to, if any (merged or single). */
export async function findGroupForVatikaProduct(vatikaId, productId) {
  await simulateLatency()
  const row = getCollection('dduGroups').find((g) => g.productId === productId && g.vatikaIds.includes(vatikaId))
  return row ? DDUGroup.fromJSON(row) : null
}

/**
 * Resolve the group for a (Vatika, product) pair, creating an implicit
 * single-Vatika group the first time anyone touches it. This is what keeps
 * the common "one Vatika, one product" case working with zero extra steps —
 * merging is an explicit, separate action.
 */
export async function getOrCreateSingleVatikaGroup(vatikaId, productId) {
  const existing = await findGroupForVatikaProduct(vatikaId, productId)
  if (existing) return existing
  await simulateLatency()
  const row = insert('dduGroups', {
    id: singleVatikaGroupId(vatikaId, productId),
    productId,
    vatikaIds: [vatikaId],
    blockId: null,
    name: '',
  })
  return DDUGroup.fromJSON(row)
}

export async function listGroupsForVatika(vatikaId) {
  await simulateLatency()
  return getCollection('dduGroups')
    .filter((g) => g.vatikaIds.includes(vatikaId))
    .map(DDUGroup.fromJSON)
}

export async function listAllGroups() {
  await simulateLatency()
  return getCollection('dduGroups').map(DDUGroup.fromJSON)
}

/**
 * A Vatika is eligible to join a merged Block DDU for a product only if it
 * has already passed Stage 2 for that product, and isn't already committed
 * to a group (single or merged) with Stage 3 data started — merging pools
 * villages together *before* DDU design, not after.
 */
export async function listMergeCandidates(blockVatikaIds, productId) {
  const results = []
  for (const vatikaId of blockVatikaIds) {
    const assessment = await getAssessment(vatikaId, productId)
    const passed = assessment && assessment.criticalPass === true && assessment.outcome !== 'pending'
    const existingGroup = await findGroupForVatikaProduct(vatikaId, productId)
    const hasStage3Data = existingGroup ? hasAnyStage3Data(existingGroup.id) : false
    results.push({ vatikaId, eligible: Boolean(passed) && !hasStage3Data, assessment })
  }
  return results
}

function hasAnyStage3Data(dduId) {
  return (
    getCollection('stage3Buyers').some((r) => r.dduId === dduId) ||
    getCollection('stage3SupplierLines').some((r) => r.dduId === dduId) ||
    getCollection('stage3Production').some((r) => r.dduId === dduId) ||
    getCollection('stage3Roles').some((r) => r.dduId === dduId)
  )
}

export async function createMergedGroup({ productId, vatikaIds, blockId, name = '' }) {
  await simulateLatency()
  // Drop any pre-existing implicit single-Vatika groups for these Vatikas/product —
  // safe because listMergeCandidates only allows merging Vatikas with no Stage 3 data yet.
  const db = getCollection('dduGroups')
  for (const vatikaId of vatikaIds) {
    const idx = db.findIndex((g) => g.productId === productId && g.vatikaIds.includes(vatikaId))
    if (idx !== -1) db.splice(idx, 1)
  }
  const row = insert('dduGroups', { id: nextId('grp'), productId, vatikaIds, blockId, name })
  return DDUGroup.fromJSON(row)
}
