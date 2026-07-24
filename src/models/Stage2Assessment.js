import { priorityLevelFor, READINESS_FACTORS } from './constants.js'

// One product assessment for one Vatika. Parts A-E per the paper form; the
// final decision is *derived*, never stored as a single flag someone picks.
export class Stage2Assessment {
  constructor({
    id,
    vatikaId,
    productId,
    filledBy = null,
    date = null,

    // Part A — Basic Information
    demandConfirmed = null, // bool
    rawMaterial = '',
    rawMaterialAvailableLocally = null, // bool
    trainingNeeded = null, // bool
    trainingKind = '',
    trainedWomenAvailable = null, // bool
    externalSupportNeeded = [], // array of strings

    // Part B — Priority Level
    rawSource = null, // 'producer' | 'local_market' | 'outside'
    market = null, // 'local' | 'outside'

    // Part C — Critical (mandatory gate)
    packagingAvailable = null, // bool
    producibleInVillage = null, // bool

    // Part D — Sample availability
    sampleAvailable = null, // bool

    // Part E — Readiness (only scored when sampleAvailable === false)
    readiness = {}, // { costStability: 0|1, trainerAvailable: 0|1, ... }
  }) {
    this.id = id
    this.vatikaId = vatikaId
    this.productId = productId
    this.filledBy = filledBy
    this.date = date

    this.demandConfirmed = demandConfirmed
    this.rawMaterial = rawMaterial
    this.rawMaterialAvailableLocally = rawMaterialAvailableLocally
    this.trainingNeeded = trainingNeeded
    this.trainingKind = trainingKind
    this.trainedWomenAvailable = trainedWomenAvailable
    this.externalSupportNeeded = externalSupportNeeded

    this.rawSource = rawSource
    this.market = market

    this.packagingAvailable = packagingAvailable
    this.producibleInVillage = producibleInVillage

    this.sampleAvailable = sampleAvailable

    this.readiness = readiness
  }

  /** Part B result — 1 (highest) to 6, or null until both inputs are set. */
  get priorityLevel() {
    if (!this.rawSource || !this.market) return null
    return priorityLevelFor(this.rawSource, this.market)
  }

  /** Part C result — both must be true. A single false is a hard stop. */
  get criticalPass() {
    if (this.packagingAvailable === null || this.producibleInVillage === null) return null
    return Boolean(this.packagingAvailable) && Boolean(this.producibleInVillage)
  }

  /** Part D — a ready sample skips Part E and proceeds straight to Stage 3. */
  get skipsReadiness() {
    return this.sampleAvailable === true
  }

  /** Part E result out of 7, or null if not yet (fully) scored. */
  get readinessScore() {
    const keys = READINESS_FACTORS.map((f) => f.key)
    const scored = keys.filter((k) => this.readiness[k] === 0 || this.readiness[k] === 1)
    if (scored.length < keys.length) return null
    return keys.reduce((sum, k) => sum + (this.readiness[k] || 0), 0)
  }

  /**
   * Overall assessment outcome, used everywhere a status chip is shown.
   * 'dropped'   — failed the Part C critical gate
   * 'fast-track'— sample ready, skip straight to Stage 3 / Cost Economics
   * 'ready'     — readiness fully scored
   * 'pending'   — still missing some part
   */
  get outcome() {
    if (this.criticalPass === false) return 'dropped'
    if (this.criticalPass === null) return 'pending'
    if (this.skipsReadiness) return 'fast-track'
    if (this.readinessScore !== null) return 'ready'
    return 'pending'
  }

  static fromJSON(json) {
    return new Stage2Assessment(json)
  }
}
