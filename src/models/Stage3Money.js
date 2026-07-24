export class Stage3Money {
  constructor({
    id,
    dduId,
    toolsToStartRs = 0,
    rawMaterialPackagingMonthlyRs = 0,
    unitCostRs = 0,
    vaibhaviSellingPriceRs = 0, // pre-filled from Cost Economics' producerSellingPrice, editable
  }) {
    this.id = id
    this.dduId = dduId
    this.toolsToStartRs = toolsToStartRs
    this.rawMaterialPackagingMonthlyRs = rawMaterialPackagingMonthlyRs
    this.unitCostRs = unitCostRs
    this.vaibhaviSellingPriceRs = vaibhaviSellingPriceRs
  }

  static fromJSON(json) {
    return new Stage3Money(json)
  }
}
