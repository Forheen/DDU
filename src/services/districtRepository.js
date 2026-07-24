import { getCollection, insert, update, nextId, simulateLatency } from './db.js'
import { District } from '../models/index.js'

export async function listDistricts() {
  await simulateLatency()
  return getCollection('districts').map(District.fromJSON)
}

export async function getDistrict(id) {
  await simulateLatency()
  const row = getCollection('districts').find((d) => d.id === id)
  return row ? District.fromJSON(row) : null
}

export async function createDistrict(data) {
  await simulateLatency()
  const created = insert('districts', { id: nextId('d'), ...data })
  return District.fromJSON(created)
}

export async function updateDistrict(id, patch) {
  await simulateLatency()
  const row = update('districts', id, patch)
  return row ? District.fromJSON(row) : null
}
