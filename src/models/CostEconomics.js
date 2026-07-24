import { DEFAULT_MARGINS } from './constants.js'

// Sits after Stage 2, before Stage 3. SWSM enters raw cost inputs and target
// prices; every downstream figure is computed — mirrors the shared pricing
// tool exactly (net production cost, producer price, retail/institution
// viability gap, traffic light, procurement decision).
export class CostEconomics {
  constructor({
    id,
    dduId, // the DDUGroup this pricing decision belongs to — shared if the group is merged
    margins = { ...DEFAULT_MARGINS }, // per-DDU override of the org defaults

    rawMaterialCost = 0,
    packagingCost = 0,
    directLabourCost = 0,
    manufacturingOverhead = 0,
    transportToHub = 0,
    otherCost = 0,

    competitorMRP = null,
    targetInstitutionPrice = null,

    filledBy = null, // userId of whoever last touched this — provenance for Admin overrides
    updatedAt = null, // ISO date string
  }) {
    this.id = id
    this.dduId = dduId
    this.margins = margins
    this.filledBy = filledBy
    this.updatedAt = updatedAt

    this.rawMaterialCost = rawMaterialCost
    this.packagingCost = packagingCost
    this.directLabourCost = directLabourCost
    this.manufacturingOverhead = manufacturingOverhead
    this.transportToHub = transportToHub
    this.otherCost = otherCost

    this.competitorMRP = competitorMRP
    this.targetInstitutionPrice = targetInstitutionPrice
  }

  get subtotalCost() {
    return (
      this.rawMaterialCost +
      this.packagingCost +
      this.directLabourCost +
      this.manufacturingOverhead +
      this.transportToHub +
      this.otherCost
    )
  }

  get netProductionCost() {
    return this.subtotalCost * (1 + this.margins.wastagePct / 100)
  }

  get producerMarginRs() {
    return this.netProductionCost * (this.margins.producerPct / 100)
  }

  get producerSellingPrice() {
    return this.netProductionCost + this.producerMarginRs
  }

  // ---- Retail channel ----
  get retailPurchasePriceTarget() {
    if (this.competitorMRP == null) return null
    return this.competitorMRP * (1 - this.margins.retailerPct / 100)
  }

  get maxProducerPriceRetail() {
    const target = this.retailPurchasePriceTarget
    if (target == null) return null
    return target / (1 + this.margins.vasukiPct / 100) / (1 + this.margins.dhawakPct / 100)
  }

  get viabilityGapRetail() {
    const max = this.maxProducerPriceRetail
    if (max == null) return null
    return max - this.producerSellingPrice
  }

  get retailRecommendation() {
    const gap = this.viabilityGapRetail
    if (gap == null) return null
    return gap >= 0 ? 'ONBOARD' : 'DO NOT ONBOARD'
  }

  // ---- Institution channel ----
  get maxProducerPriceInstitution() {
    if (this.targetInstitutionPrice == null) return null
    return (
      this.targetInstitutionPrice / (1 + this.margins.vasukiPct / 100) / (1 + this.margins.dhawakPct / 100)
    )
  }

  get viabilityGapInstitution() {
    const max = this.maxProducerPriceInstitution
    if (max == null) return null
    return max - this.producerSellingPrice
  }

  get institutionRecommendation() {
    const gap = this.viabilityGapInstitution
    if (gap == null) return null
    return gap >= 0 ? 'ACCEPT' : 'REJECT'
  }

  // ---- Procurement dashboard ----
  get producerSharePct() {
    if (!this.competitorMRP) return null
    return (this.producerSellingPrice / this.competitorMRP) * 100
  }

  /** 'go' | 'caution' | 'stop' | null (until both channels have an input) */
  get trafficLight() {
    const retailOk = this.retailRecommendation === 'ONBOARD'
    const instOk = this.institutionRecommendation === 'ACCEPT'
    const retailKnown = this.retailRecommendation !== null
    const instKnown = this.institutionRecommendation !== null
    if (!retailKnown && !instKnown) return null
    if ((retailKnown && retailOk) && (instKnown ? instOk : true)) return 'go'
    if ((retailKnown && !retailOk) && (instKnown && !instOk)) return 'stop'
    if (retailKnown && instKnown && retailOk !== instOk) return 'caution'
    return retailOk || instOk ? 'go' : 'stop'
  }

  get procurementDecision() {
    const light = this.trafficLight
    if (light === 'go') return 'PROCURE'
    if (light === 'caution') return 'PROCURE WITH CAUTION'
    if (light === 'stop') return 'DO NOT PROCURE'
    return null
  }

  static fromJSON(json) {
    return new CostEconomics(json)
  }
}
