import { getCollection, insert, nextId, simulateLatency } from './db.js'
import { Stage1MarketEntry, Stage1InstitutionEntry } from '../models/index.js'

const SHOP_COUNT_SCORE = { '1': 1, '2-3': 2, '4-6': 3, '7+': 4 }

export async function createMarketEntry(data) {
  await simulateLatency()
  const row = insert('stage1MarketEntries', { id: nextId('m'), ...data })
  return Stage1MarketEntry.fromJSON(row)
}

export async function createInstitutionEntry(data) {
  await simulateLatency()
  const row = insert('stage1InstitutionEntries', { id: nextId('i'), ...data })
  return Stage1InstitutionEntry.fromJSON(row)
}

export async function listMarketEntries({ vatikaId, blockId, productId } = {}) {
  await simulateLatency()
  return getCollection('stage1MarketEntries')
    .filter((e) => (vatikaId ? e.vatikaId === vatikaId : true))
    .filter((e) => (blockId ? e.blockId === blockId : true))
    .filter((e) => (productId ? e.productId === productId : true))
    .map(Stage1MarketEntry.fromJSON)
}

export async function listInstitutionEntries({ vatikaId, blockId, productId } = {}) {
  await simulateLatency()
  return getCollection('stage1InstitutionEntries')
    .filter((e) => (vatikaId ? e.vatikaId === vatikaId : true))
    .filter((e) => (blockId ? e.blockId === blockId : true))
    .filter((e) => (productId ? e.productId === productId : true))
    .map(Stage1InstitutionEntry.fromJSON)
}

/**
 * Backend logic — Stage 1: tally every submission by product within a
 * Vatika, combining shop-count score with distinct-shop count into one
 * ranking. Informational only; it does not gate Stage 2.
 */
export async function getRankedProducts(vatikaId) {
  await simulateLatency()
  const entries = getCollection('stage1MarketEntries').filter((e) => e.vatikaId === vatikaId)
  const byProduct = new Map()
  for (const e of entries) {
    const key = e.productId || e.productName
    if (!byProduct.has(key)) {
      byProduct.set(key, { productId: e.productId, productName: e.productName, shopNames: new Set(), score: 0 })
    }
    const bucket = byProduct.get(key)
    bucket.shopNames.add(e.shopName)
    bucket.score += SHOP_COUNT_SCORE[e.shopsSelling] || 1
  }
  return [...byProduct.values()]
    .map((b) => ({ productId: b.productId, productName: b.productName, distinctShops: b.shopNames.size, score: b.score }))
    .sort((a, b) => b.score - a.score)
}
