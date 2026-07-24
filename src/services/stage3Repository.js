import { getCollection, insert, update, remove, nextId, simulateLatency } from './db.js'
import { Stage3Buyer, Stage3SupplierLine, Stage3Production, Stage3Money, Stage3Roles } from '../models/index.js'
import { singleVatikaGroupId } from '../models/DDUGroup.js'

// Kept for the common single-Vatika case, and for building the group's id
// before a DDUGroup record technically exists yet.
export const dduIdFor = singleVatikaGroupId

// ---- Buyers (Demand ledger) — shared across every Vatika in the group ----
export async function listBuyers(dduId) {
  await simulateLatency()
  return getCollection('stage3Buyers').filter((b) => b.dduId === dduId).map(Stage3Buyer.fromJSON)
}

export async function addBuyer(dduId, data) {
  await simulateLatency()
  const row = insert('stage3Buyers', { id: nextId('buy'), dduId, ...data })
  return Stage3Buyer.fromJSON(row)
}

export async function removeBuyer(id) {
  await simulateLatency()
  return remove('stage3Buyers', id)
}

// ---- Supplier & Cost ledger — shared across every Vatika in the group ----
export async function listSupplierLines(dduId) {
  await simulateLatency()
  return getCollection('stage3SupplierLines').filter((s) => s.dduId === dduId).map(Stage3SupplierLine.fromJSON)
}

export async function addSupplierLine(dduId, data) {
  await simulateLatency()
  const row = insert('stage3SupplierLines', { id: nextId('sup'), dduId, ...data })
  return Stage3SupplierLine.fromJSON(row)
}

export async function removeSupplierLine(id) {
  await simulateLatency()
  return remove('stage3SupplierLines', id)
}

// ---- Production — one row per contributing Vatika ----
export async function listProductionRows(dduId) {
  await simulateLatency()
  return getCollection('stage3Production').filter((p) => p.dduId === dduId).map(Stage3Production.fromJSON)
}

export async function getProductionForVatika(dduId, vatikaId) {
  await simulateLatency()
  const row = getCollection('stage3Production').find((p) => p.dduId === dduId && p.vatikaId === vatikaId)
  return row ? Stage3Production.fromJSON(row) : null
}

export async function saveProductionForVatika(dduId, vatikaId, data) {
  await simulateLatency()
  const existing = getCollection('stage3Production').find((p) => p.dduId === dduId && p.vatikaId === vatikaId)
  if (existing) return Stage3Production.fromJSON(update('stage3Production', existing.id, data))
  return Stage3Production.fromJSON(insert('stage3Production', { id: nextId('prod'), dduId, vatikaId, ...data }))
}

// ---- Money — shared across every Vatika in the group ----
export async function getMoney(dduId) {
  await simulateLatency()
  const row = getCollection('stage3Money').find((m) => m.dduId === dduId)
  return row ? Stage3Money.fromJSON(row) : null
}

export async function saveMoney(dduId, data) {
  await simulateLatency()
  const existing = getCollection('stage3Money').find((m) => m.dduId === dduId)
  if (existing) return Stage3Money.fromJSON(update('stage3Money', existing.id, data))
  return Stage3Money.fromJSON(insert('stage3Money', { id: nextId('mon'), dduId, ...data }))
}

// ---- Roles — one row per contributing Vatika (own Vasuki/Mitra/delivery each) ----
export async function listRolesRows(dduId) {
  await simulateLatency()
  return getCollection('stage3Roles').filter((r) => r.dduId === dduId).map(Stage3Roles.fromJSON)
}

export async function getRolesForVatika(dduId, vatikaId) {
  await simulateLatency()
  const row = getCollection('stage3Roles').find((r) => r.dduId === dduId && r.vatikaId === vatikaId)
  return row ? Stage3Roles.fromJSON(row) : null
}

export async function saveRolesForVatika(dduId, vatikaId, data) {
  await simulateLatency()
  const existing = getCollection('stage3Roles').find((r) => r.dduId === dduId && r.vatikaId === vatikaId)
  if (existing) return Stage3Roles.fromJSON(update('stage3Roles', existing.id, data))
  return Stage3Roles.fromJSON(insert('stage3Roles', { id: nextId('role'), dduId, vatikaId, ...data }))
}
