import { getCollection, insert, update, nextId, simulateLatency } from './db.js'
import { Block } from '../models/index.js'

export async function listBlocks() {
  await simulateLatency()
  return getCollection('blocks').map(Block.fromJSON)
}

export async function listBlocksByDistrict(districtId) {
  await simulateLatency()
  return getCollection('blocks')
    .filter((b) => b.districtId === districtId)
    .map(Block.fromJSON)
}

export async function getBlock(id) {
  await simulateLatency()
  const row = getCollection('blocks').find((b) => b.id === id)
  return row ? Block.fromJSON(row) : null
}

export async function createBlock(data) {
  await simulateLatency()
  const created = insert('blocks', { id: nextId('b'), ...data })
  return Block.fromJSON(created)
}

export async function updateBlock(id, patch) {
  await simulateLatency()
  const row = update('blocks', id, patch)
  return row ? Block.fromJSON(row) : null
}
