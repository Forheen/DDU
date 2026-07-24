// Shared enums / lookup tables used across models and UI.

export const ROLES = {
  VASUKI: 'Vasuki',
  VIDUSHI: 'Vidushi',
  SWSM: 'SWSM',
  MITRA: 'Mitra',
  DHAWAK: 'Dhawak',
  ADMIN: 'Admin',
}

export const FIELD_ROLES = [ROLES.VASUKI, ROLES.VIDUSHI, ROLES.SWSM, ROLES.MITRA, ROLES.DHAWAK]

export const PORTAL = {
  FIELD: 'field',
  ADMIN: 'admin',
}

export const SCOPE = {
  VATIKA: 'vatika',
  BLOCK: 'block',
}

export const SOURCE = {
  MARKET: 'market',
  INSTITUTION: 'institution',
}

export const PRODUCT_CATEGORY = {
  FOOD: 'food',
  TEXTILE: 'textile',
  OIL: 'oil',
  HYGIENE: 'hygiene',
  OTHER: 'other',
}

export const CATEGORY_LABEL = {
  [PRODUCT_CATEGORY.FOOD]: 'Food & preserve',
  [PRODUCT_CATEGORY.TEXTILE]: 'Textile',
  [PRODUCT_CATEGORY.OIL]: 'Oil & pressing',
  [PRODUCT_CATEGORY.HYGIENE]: 'Hygiene',
  [PRODUCT_CATEGORY.OTHER]: 'Other',
}

// Stage 2, Part B — priority is a lookup on (raw material source) x (market).
// Order below is priority rank, 1 = highest per the paper form.
export const PRIORITY_MATRIX = [
  { level: 1, rawSource: 'producer', market: 'local', label: 'Producer/Farmer · Local market' },
  { level: 2, rawSource: 'local_market', market: 'local', label: 'Local market · Local market' },
  { level: 3, rawSource: 'outside', market: 'local', label: 'Outside market · Local market' },
  { level: 4, rawSource: 'producer', market: 'outside', label: 'Producer/Farmer · Outside market' },
  { level: 5, rawSource: 'local_market', market: 'outside', label: 'Local market · Outside market' },
  { level: 6, rawSource: 'outside', market: 'outside', label: 'Outside market · Outside market' },
]

export function priorityLevelFor(rawSource, market) {
  const row = PRIORITY_MATRIX.find((r) => r.rawSource === rawSource && r.market === market)
  return row ? row.level : null
}

// Stage 2, Part E — readiness factors, each scored 0 or 1.
export const READINESS_FACTORS = [
  { key: 'costStability', label: 'Raw material cost stability' },
  { key: 'trainerAvailable', label: 'Trainer available' },
  { key: 'rawMaterialNow', label: 'Production / raw material available presently' },
  { key: 'workspace', label: 'Workspace available' },
  { key: 'electricity', label: 'Electricity required and available' },
  { key: 'water', label: 'Water available' },
  { key: 'storage', label: 'Storage required and available' },
]

export const EXTERNAL_SUPPORT_OPTIONS = ['Trainer', 'Branding', 'Certification', 'Licensing', 'Technical expert']

export const STAGE_STATUS = {
  MISSING: 'missing',
  PARTIAL: 'partial',
  DONE: 'done',
  BLOCKED: 'blocked', // e.g. dropped at Critical gate, or STOP at cost economics
}

export const DEFAULT_MARGINS = {
  retailerPct: 20,
  vasukiPct: 8,
  dhawakPct: 5,
  producerPct: 15,
  gstPct: 0,
  wastagePct: 2,
}
