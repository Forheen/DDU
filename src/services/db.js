// A tiny in-memory "database" standing in for a real backend. Every
// repository in this folder talks to this file only — swapping in a real API
// later means rewriting this module (and the repositories' method bodies),
// never the UI.

import { seed } from '../mock/seed.js'

const STORAGE_KEY = 'aja-ddu-builder:db:v3'
const LATENCY_MS = 120

let store = null

function loadStore() {
  if (store) return store
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      store = JSON.parse(raw)
      return store
    }
  } catch {
    // fall through to seed
  }
  store = structuredClone(seed)
  persist()
  return store
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // localStorage unavailable (private mode, quota) — keep working in-memory
  }
}

export function simulateLatency(ms = LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function nextId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export function getCollection(name) {
  const db = loadStore()
  if (!db[name]) db[name] = []
  return db[name]
}

export function insert(name, item) {
  const col = getCollection(name)
  col.push(item)
  persist()
  return item
}

export function update(name, id, patch) {
  const col = getCollection(name)
  const idx = col.findIndex((r) => r.id === id)
  if (idx === -1) return null
  col[idx] = { ...col[idx], ...patch }
  persist()
  return col[idx]
}

export function upsert(name, item) {
  const col = getCollection(name)
  const idx = col.findIndex((r) => r.id === item.id)
  if (idx === -1) {
    col.push(item)
  } else {
    col[idx] = { ...col[idx], ...item }
  }
  persist()
  return col[idx === -1 ? col.length - 1 : idx]
}

export function remove(name, id) {
  const col = getCollection(name)
  const idx = col.findIndex((r) => r.id === id)
  if (idx === -1) return false
  col.splice(idx, 1)
  persist()
  return true
}

export function resetToSeed() {
  store = structuredClone(seed)
  persist()
}
