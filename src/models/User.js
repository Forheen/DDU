// Each role a person holds has its own operating level in the org hierarchy —
// a person can be, say, a block-level Vasuki AND a village-level Mitra at the
// same time, so scope is keyed per role, not one flat list for the whole user.
//
//   Dhawak            -> district level (a delivery network spans a district)
//   Vasuki / Vidushi   -> block level   (market connectors work across a Block)
//   SWSM               -> village level (assigned to specific Vatikas)
//   Mitra              -> village level (assigned to specific Vatikas)
//   Admin              -> no scope — sees everything
//
// roleScopes: { [role]: { level: 'district'|'block'|'vatika', ids: string[] } }
export class User {
  constructor({ id, name, phone = '', roles = [], roleScopes = {} }) {
    this.id = id
    this.name = name
    this.phone = phone
    this.roles = roles
    this.roleScopes = roleScopes
  }

  hasRole(role) {
    return this.roles.includes(role)
  }

  scopeFor(role) {
    return this.roleScopes[role] || null
  }

  static fromJSON(json) {
    return new User(json)
  }
}
