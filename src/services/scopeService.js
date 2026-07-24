import { listVatikas } from './vatikaRepository.js'
import { listBlocks } from './blockRepository.js'
import { listUsers, updateUserRoleScope } from './userRepository.js'
import { ROLES } from '../models/index.js'

/** Expand a role scope ({level, ids}) into the concrete Vatika ids it covers. */
export async function expandScopeToVatikaIds(scope) {
  if (!scope) return []
  if (scope.level === 'vatika') return scope.ids
  const vatikas = await listVatikas()
  if (scope.level === 'block') {
    return vatikas.filter((v) => scope.ids.includes(v.blockId)).map((v) => v.id)
  }
  if (scope.level === 'district') {
    const blocks = await listBlocks()
    const blockIds = blocks.filter((b) => scope.ids.includes(b.districtId)).map((b) => b.id)
    return vatikas.filter((v) => blockIds.includes(v.blockId)).map((v) => v.id)
  }
  return []
}

/** Does this role scope reach a given Vatika? */
export async function scopeCoversVatika(scope, vatikaId) {
  if (!scope) return false
  if (scope.level === 'vatika') return scope.ids.includes(vatikaId)
  const vatikas = await listVatikas()
  const vatika = vatikas.find((v) => v.id === vatikaId)
  if (!vatika) return false
  if (scope.level === 'block') return scope.ids.includes(vatika.blockId)
  if (scope.level === 'district') {
    const blocks = await listBlocks()
    const block = blocks.find((b) => b.id === vatika.blockId)
    return block ? scope.ids.includes(block.districtId) : false
  }
  return false
}

/** Human-readable label for a scope, e.g. "District: Ranchi" or "3 Vatikas". */
export function scopeLabel(scope, { districts = [], blocks = [] } = {}) {
  if (!scope) return 'Unassigned'
  if (scope.level === 'vatika') return `${scope.ids.length} Vatika${scope.ids.length === 1 ? '' : 's'}`
  if (scope.level === 'block') {
    const names = scope.ids.map((id) => blocks.find((b) => b.id === id)?.name || id)
    return `Block: ${names.join(', ')}`
  }
  if (scope.level === 'district') {
    const names = scope.ids.map((id) => districts.find((d) => d.id === id)?.name || id)
    return `District: ${names.join(', ')}`
  }
  return 'Unassigned'
}

const DEFAULT_ROLES_BY_LEVEL = {
  district: [ROLES.DHAWAK],
  block: [ROLES.VASUKI, ROLES.VIDUSHI],
  vatika: [ROLES.SWSM, ROLES.MITRA],
}

/**
 * A brand-new District/Block/Vatika starts covered by nobody — as a simple
 * default (until a real per-location assignment picker exists), every
 * existing holder of the role(s) that operate at this level is given it
 * immediately, so nothing created from the Geography page is orphaned.
 * Admin can narrow individual coverage afterwards from Assignment policy.
 */
export async function assignNewLocationToDefaultRoles(level, locationId) {
  const roles = DEFAULT_ROLES_BY_LEVEL[level] || []
  if (roles.length === 0) return
  const users = await listUsers()
  await Promise.all(
    users.flatMap((u) =>
      roles
        .filter((role) => u.hasRole(role) && u.scopeFor(role) && !u.scopeFor(role).ids.includes(locationId))
        .map((role) => updateUserRoleScope(u.id, role, [...u.scopeFor(role).ids, locationId])),
    ),
  )
}
