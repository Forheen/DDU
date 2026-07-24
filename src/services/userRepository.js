import { getCollection, update, simulateLatency } from './db.js'
import { User } from '../models/index.js'

export async function listUsers() {
  await simulateLatency()
  return getCollection('users').map(User.fromJSON)
}

export async function getUser(id) {
  await simulateLatency()
  const row = getCollection('users').find((u) => u.id === id)
  return row ? User.fromJSON(row) : null
}

export async function listUsersByRole(role) {
  await simulateLatency()
  return getCollection('users')
    .filter((u) => u.roles.includes(role))
    .map(User.fromJSON)
}

/** Admin assignment policy — reassign which District/Block/Vatika ids a role's scope covers. Level itself is fixed per role. */
export async function updateUserRoleScope(userId, role, ids) {
  await simulateLatency()
  const row = getCollection('users').find((u) => u.id === userId)
  if (!row) return null
  const scopes = row.roleScopes || {}
  const current = scopes[role]
  const level = current ? current.level : null
  const updated = update('users', userId, { roleScopes: { ...scopes, [role]: { level, ids } } })
  return updated ? User.fromJSON(updated) : null
}
