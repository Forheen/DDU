import { getCollection } from './db.js'
import { DDU, DDUGroup, singleVatikaGroupId } from './../models/index.js'
import { getVatika } from './vatikaRepository.js'
import { getProduct, listProducts } from './productRepository.js'
import { listMarketEntries, listInstitutionEntries } from './stage1Repository.js'
import { getAssessment } from './stage2Repository.js'
import { getCostEconomics } from './costEconomicsRepository.js'
import { listBuyers, listSupplierLines, listProductionRows, getMoney, listRolesRows } from './stage3Repository.js'
import { getGroup, findGroupForVatikaProduct, listGroupsForVatika } from './dduGroupRepository.js'

/** Every distinct productId touched by this Vatika, across every stage — sync, for quick counts on listing pages. */
export function getProductIdsForVatika(vatikaId) {
  const ids = new Set()
  getCollection('stage1MarketEntries').forEach((e) => e.vatikaId === vatikaId && e.productId && ids.add(e.productId))
  getCollection('stage1InstitutionEntries').forEach((e) => e.vatikaId === vatikaId && e.productId && ids.add(e.productId))
  getCollection('stage2Assessments').forEach((a) => a.vatikaId === vatikaId && ids.add(a.productId))
  getCollection('dduGroups').forEach((g) => g.vatikaIds.includes(vatikaId) && ids.add(g.productId))
  return [...ids]
}

/** Resolve the group for a (Vatika, product) pair for READS — synthesizes a virtual, non-persisted single-Vatika group if none exists yet. */
async function resolveGroup(vatikaId, productId) {
  const existing = await findGroupForVatikaProduct(vatikaId, productId)
  if (existing) return existing
  return new DDUGroup({ id: singleVatikaGroupId(vatikaId, productId), productId, vatikaIds: [vatikaId], blockId: null, name: '' })
}

export async function buildDDUFromGroup(group) {
  const [product, vatikas] = await Promise.all([getProduct(group.productId), Promise.all(group.vatikaIds.map(getVatika))])

  const marketEntries = (
    await Promise.all(group.vatikaIds.map((vid) => listMarketEntries({ vatikaId: vid, productId: group.productId })))
  ).flat()
  const institutionEntries = (
    await Promise.all(group.vatikaIds.map((vid) => listInstitutionEntries({ vatikaId: vid, productId: group.productId })))
  ).flat()

  const assessmentPairs = await Promise.all(group.vatikaIds.map(async (vid) => [vid, await getAssessment(vid, group.productId)]))
  const assessments = new Map(assessmentPairs)

  const [costEconomics, buyers, supplierLines, productionRows, money, rolesRows] = await Promise.all([
    getCostEconomics(group.id),
    listBuyers(group.id),
    listSupplierLines(group.id),
    listProductionRows(group.id),
    getMoney(group.id),
    listRolesRows(group.id),
  ])

  return new DDU({ group, product, vatikas, marketEntries, institutionEntries, assessments, costEconomics, buyers, supplierLines, productionRows, money, rolesRows })
}

/** Build a DDU for a single Vatika + product — the common-case entry point every existing screen uses. */
export async function buildDDU(vatikaId, productId) {
  const group = await resolveGroup(vatikaId, productId)
  return buildDDUFromGroup(group)
}

export async function buildDDUByGroupId(groupId) {
  const group = await getGroup(groupId)
  if (!group) throw new Error(`Unknown DDU group ${groupId}`)
  return buildDDUFromGroup(group)
}

/** Every group (real or virtual single-Vatika) that touches this Vatika, deduped. */
async function getGroupsTouchingVatika(vatikaId) {
  const real = await listGroupsForVatika(vatikaId)
  const covered = new Set(real.map((g) => g.productId))
  const virtualProductIds = new Set(getProductIdsForVatika(vatikaId).filter((pid) => !covered.has(pid)))
  const virtual = [...virtualProductIds].map(
    (pid) => new DDUGroup({ id: singleVatikaGroupId(vatikaId, pid), productId: pid, vatikaIds: [vatikaId], blockId: null, name: '' }),
  )
  return [...real, ...virtual]
}

export async function getProductStatusBoard(vatikaId) {
  const groups = await getGroupsTouchingVatika(vatikaId)
  return Promise.all(groups.map((g) => buildDDUFromGroup(g)))
}

export async function getAllDDUs({ blockId = null, vatikaId = null } = {}) {
  const vatikas = getCollection('vatikas').filter((v) => {
    if (vatikaId) return v.id === vatikaId
    if (blockId) return v.blockId === blockId
    return true
  })
  // Fetch every Vatika's groups in parallel, not one at a time — with a
  // few dozen Vatikas the sequential version visibly stalled the Admin home page.
  const groupLists = await Promise.all(vatikas.map((v) => getGroupsTouchingVatika(v.id)))
  const seen = new Set()
  const groups = []
  for (const list of groupLists) {
    for (const g of list) {
      if (seen.has(g.id)) continue
      seen.add(g.id)
      groups.push(g)
    }
  }
  return Promise.all(groups.map((g) => buildDDUFromGroup(g)))
}

/**
 * Every OTHER DDU group priced for the same product — so Admin never
 * overrides a Cost Economics record without seeing how this product is
 * priced elsewhere first.
 */
export async function getSameProductPricing(productId, excludeGroupId) {
  const groups = getCollection('dduGroups').filter((g) => g.productId === productId && g.id !== excludeGroupId)
  const results = []
  for (const g of groups) {
    const group = DDUGroup.fromJSON(g)
    const [vatikas, costEconomics] = await Promise.all([
      Promise.all(group.vatikaIds.map(getVatika)),
      getCostEconomics(group.id),
    ])
    results.push({ group, vatikas, costEconomics })
  }
  return results
}

/** Catalog products never touched (no Stage 1/2/3 data anywhere) across a set of Vatikas — the "new DDU" opportunity list. */
export async function getUnstartedProducts(vatikaIds) {
  const touched = new Set(vatikaIds.flatMap((vid) => getProductIdsForVatika(vid)))
  const products = await listProducts()
  return products.filter((p) => !touched.has(p.id))
}

/** How many products found at Block level also show up in a Vatika's own Stage 1 data. */
export async function getBlockVatikaMatch(blockId) {
  const vatikas = getCollection('vatikas').filter((v) => v.blockId === blockId)
  const blockEntries = [
    ...getCollection('stage1MarketEntries').filter((e) => e.scope === 'block' && e.blockId === blockId),
    ...getCollection('stage1InstitutionEntries').filter((e) => e.scope === 'block' && e.blockId === blockId),
  ]
  const byProduct = new Map()
  for (const e of blockEntries) {
    const key = e.productId
    if (!byProduct.has(key)) byProduct.set(key, { productId: key, productName: e.productName, blockFindings: 0, matchingVatikas: new Set() })
    byProduct.get(key).blockFindings += 1
  }
  for (const v of vatikas) {
    const vatikaProductIds = new Set(getProductIdsForVatika(v.id))
    for (const bucket of byProduct.values()) {
      if (vatikaProductIds.has(bucket.productId)) bucket.matchingVatikas.add(v.id)
    }
  }
  return [...byProduct.values()].map((b) => ({
    productId: b.productId,
    productName: b.productName,
    blockFindings: b.blockFindings,
    matchCount: b.matchingVatikas.size,
    totalVatikas: vatikas.length,
    matchPct: vatikas.length ? Math.round((b.matchingVatikas.size / vatikas.length) * 100) : 0,
  }))
}
