import { ROLES } from './constants.js'

function perVatikaStage2Status(assessment) {
  if (!assessment) return 'missing'
  const outcome = assessment.outcome
  if (outcome === 'dropped') return 'blocked'
  if (outcome === 'pending') return 'partial'
  return 'done' // 'ready' or 'fast-track'
}

/**
 * DDU is a *read-model*, not a locked pipeline record. It represents a
 * DDUGroup — one Vatika in the common case, or several Vatikas pooling
 * Vaibhavis into one merged Block DDU for the same product. It's assembled
 * from whatever Stage 1/2/3 + Cost Economics pieces currently exist — any
 * piece may be missing, for any contributing Vatika, and the rest still
 * render. Nothing here assumes a fixed fill order or a single village.
 */
export class DDU {
  constructor({
    group, // DDUGroup
    product = null,
    vatikas = [], // Vatika[], same order as group.vatikaIds
    marketEntries = [],
    institutionEntries = [],
    assessments = new Map(), // vatikaId -> Stage2Assessment | null
    costEconomics = null, // CostEconomics | null — shared across the group
    buyers = [], // Stage3Buyer[] — shared
    supplierLines = [], // Stage3SupplierLine[] — shared
    productionRows = [], // Stage3Production[] — one per contributing Vatika
    rolesRows = [], // Stage3Roles[] — one per contributing Vatika
    money = null, // Stage3Money | null — shared
  }) {
    this.id = group.id
    this.group = group
    this.productId = group.productId
    this.vatikaIds = group.vatikaIds
    this.product = product
    this.vatikas = vatikas
    this.marketEntries = marketEntries
    this.institutionEntries = institutionEntries
    this.assessments = assessments
    this.costEconomics = costEconomics
    this.buyers = buyers
    this.supplierLines = supplierLines
    this.productionRows = productionRows
    this.rolesRows = rolesRows
    this._money = money
  }

  /** Convenience accessors so single-Vatika screens don't need to branch. */
  get vatikaId() {
    return this.vatikaIds[0]
  }
  get vatika() {
    return this.vatikas[0] || null
  }
  get isMerged() {
    return this.vatikaIds.length > 1
  }

  // ---- Stage 1 ----
  get stage1Status() {
    const count = this.marketEntries.length + this.institutionEntries.length
    return count > 0 ? 'done' : 'missing'
  }

  // ---- Stage 2 — every contributing Vatika must independently pass ----
  get stage2ByVatika() {
    return this.vatikaIds.map((vid) => ({ vatikaId: vid, assessment: this.assessments.get(vid) || null, status: perVatikaStage2Status(this.assessments.get(vid)) }))
  }

  get stage2Status() {
    const statuses = this.stage2ByVatika.map((v) => v.status)
    if (statuses.some((s) => s === 'blocked')) return 'blocked'
    if (statuses.every((s) => s === 'done')) return 'done'
    if (statuses.some((s) => s === 'done' || s === 'partial')) return 'partial'
    return 'missing'
  }

  // ---- Cost Economics — shared across the whole group ----
  get costEconomicsStatus() {
    if (!this.costEconomics) return 'missing'
    const light = this.costEconomics.trafficLight
    if (light === null) return 'partial'
    if (light === 'stop') return 'blocked'
    return 'done'
  }

  // ---- Stage 3 ----
  get stage3Sections() {
    const everyVatikaHas = (rows) => this.vatikaIds.every((vid) => rows.some((r) => r.vatikaId === vid))
    return {
      demand: this.buyers.length > 0,
      supplier: this.supplierLines.length > 0,
      production: this.productionRows.length > 0 && everyVatikaHas(this.productionRows),
      money: Boolean(this.money),
      roles: this.rolesRows.length > 0 && everyVatikaHas(this.rolesRows),
    }
  }

  get money() {
    return this._money || null
  }

  get stage3Status() {
    const s = this.stage3Sections
    const filled = Object.values(s).filter(Boolean).length
    if (filled === 0) return 'missing'
    if (filled === Object.keys(s).length) return 'done'
    return 'partial'
  }

  get stageReached() {
    if (this.stage3Status !== 'missing') return 4
    if (this.costEconomicsStatus !== 'missing') return 3
    if (this.stage2Status !== 'missing') return 2
    if (this.stage1Status !== 'missing') return 1
    return 0
  }

  get isLive() {
    return this.stage3Status === 'done'
  }

  get isBlocked() {
    return this.stage2Status === 'blocked' || this.costEconomicsStatus === 'blocked'
  }

  /** Who does the record need next, and for which Vatika — never just a role name. */
  get pendingOn() {
    if (this.isBlocked) return null
    if (this.stage1Status === 'missing') {
      return { role: `${ROLES.VASUKI} / ${ROLES.VIDUSHI}`, what: 'Survey this product (Stage 1)' }
    }
    const incompleteVatika = this.stage2ByVatika.find((v) => v.status === 'missing' || v.status === 'partial')
    if (incompleteVatika) {
      const name = this.vatikas.find((v) => v.id === incompleteVatika.vatikaId)?.name || incompleteVatika.vatikaId
      const verb = incompleteVatika.status === 'missing' ? 'Start' : 'Finish'
      return { role: ROLES.SWSM, what: `${verb} the production assessment (Stage 2) for ${name}` }
    }
    if (this.costEconomicsStatus === 'missing') {
      return { role: ROLES.SWSM, what: 'Fill in cost economics before Stage 3 opens' }
    }
    if (this.costEconomicsStatus === 'partial') {
      return { role: ROLES.SWSM, what: 'Finish the cost-economics price check' }
    }
    const s = this.stage3Sections
    if (!s.demand) return { role: ROLES.VASUKI, what: 'Add buyers to the Demand ledger (Stage 3)' }
    if (!s.supplier) return { role: ROLES.VASUKI, what: 'Add raw-material suppliers (Stage 3)' }
    if (!s.production) {
      const missing = this.vatikaIds.find((vid) => !this.productionRows.some((r) => r.vatikaId === vid))
      const name = this.vatikas.find((v) => v.id === missing)?.name || missing
      return { role: ROLES.VASUKI, what: `Fill in the Production plan for ${name} (Stage 3)` }
    }
    if (!s.money) return { role: ROLES.VASUKI, what: 'Fill in the Money section (Stage 3)' }
    if (!s.roles) {
      const missing = this.vatikaIds.find((vid) => !this.rolesRows.some((r) => r.vatikaId === vid))
      const name = this.vatikas.find((v) => v.id === missing)?.name || missing
      return { role: `${ROLES.VASUKI} / ${ROLES.SWSM}`, what: `Assign Vasuki, Mitra and Dhawak for ${name}` }
    }
    return null
  }

  // ---- Summary figures ----
  get totalMonthlyDemand() {
    return this.buyers.reduce((sum, b) => sum + (b.qtyPerMonth || 0), 0)
  }

  get monthlyCapacity() {
    if (this.productionRows.length === 0) return null
    return this.productionRows.reduce((sum, p) => sum + p.monthlyCapacity, 0)
  }

  get capacityUtilisationPct() {
    const cap = this.monthlyCapacity
    if (!cap) return null
    return (this.totalMonthlyDemand / cap) * 100
  }

  get effectiveMonthlyUnits() {
    const cap = this.monthlyCapacity
    if (cap == null) return this.totalMonthlyDemand
    return Math.min(cap, this.totalMonthlyDemand)
  }

  get monthlyRevenue() {
    if (!this.money) return null
    return this.money.vaibhaviSellingPriceRs * this.effectiveMonthlyUnits
  }

  get monthlyCost() {
    if (!this.money) return null
    return this.money.unitCostRs * this.effectiveMonthlyUnits
  }

  get monthlyProfit() {
    const rev = this.monthlyRevenue
    const cost = this.monthlyCost
    if (rev == null || cost == null) return null
    return rev - cost
  }

  /** Producer -> Dhawak -> Vasuki -> Retailer -> MRP, in rupees per unit. Margins average across contributing Vatikas when they differ. */
  get marginWaterfall() {
    if (!this.money || this.rolesRows.length === 0) return null
    const avg = (key) => this.rolesRows.reduce((sum, r) => sum + (r[key] || 0), 0) / this.rolesRows.length
    const producer = this.money.vaibhaviSellingPriceRs
    const dhawakRs = producer * (avg('deliveryMarginPct') / 100)
    const vasukiRs = producer * (avg('vasukiMarginPct') / 100)
    const retailerMarginPct = this.costEconomics ? this.costEconomics.margins.retailerPct : 0
    const preRetail = producer + dhawakRs + vasukiRs
    const retailerRs = preRetail * (retailerMarginPct / 100)
    const mrp = preRetail + retailerRs
    return { producer, dhawakRs, vasukiRs, retailerRs, mrp }
  }
}
