import { getCollection, insert, update, nextId, simulateLatency } from './db.js'
import { Vatika } from '../models/index.js'

export async function listVatikas() {
  await simulateLatency()
  return getCollection('vatikas').map(Vatika.fromJSON)
}

export async function listVatikasByBlock(blockId) {
  await simulateLatency()
  return getCollection('vatikas')
    .filter((v) => v.blockId === blockId)
    .map(Vatika.fromJSON)
}

export async function getVatika(id) {
  await simulateLatency()
  const row = getCollection('vatikas').find((v) => v.id === id)
  return row ? Vatika.fromJSON(row) : null
}

export async function createVatika(data) {
  await simulateLatency()
  const created = insert('vatikas', { id: nextId('v'), region: '', ...data })
  return Vatika.fromJSON(created)
}

export async function updateVatika(id, patch) {
  await simulateLatency()
  const row = update('vatikas', id, patch)
  return row ? Vatika.fromJSON(row) : null
}
