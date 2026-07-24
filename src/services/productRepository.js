import { getCollection, insert, update, nextId, simulateLatency } from './db.js'
import { Product } from '../models/index.js'

export async function listProducts() {
  await simulateLatency()
  return getCollection('products').map(Product.fromJSON)
}

export async function getProduct(id) {
  await simulateLatency()
  const row = getCollection('products').find((p) => p.id === id)
  return row ? Product.fromJSON(row) : null
}

export async function findOrCreateProductByName(name) {
  await simulateLatency()
  const existing = getCollection('products').find((p) => p.name.toLowerCase() === name.toLowerCase())
  if (existing) return Product.fromJSON(existing)
  const created = insert('products', { id: nextId('p'), name, category: 'other', unit: 'pcs', icon: '📦' })
  return Product.fromJSON(created)
}

/** Admin entry point #2 — create a product directly, with a real category/icon/unit from the start. */
export async function createProduct(data) {
  await simulateLatency()
  const created = insert('products', { id: nextId('p'), category: 'other', unit: 'pcs', icon: '📦', ...data })
  return Product.fromJSON(created)
}

export async function updateProduct(id, patch) {
  await simulateLatency()
  const row = update('products', id, patch)
  return row ? Product.fromJSON(row) : null
}
