// One row = one raw material / packaging material, in the Supplier & Cost ledger.
export class Stage3SupplierLine {
  constructor({
    id,
    dduId,
    materialName = '',
    supplierName = '',
    contactNo = '',
    location = '',
    moq = 0,
    pricePerUnit = 0,
    totalQtyRequiredMonthly = 0,
    howOftenRequired = 'monthly',
    whoDelivers = '',
    storedWhere = '',
  }) {
    this.id = id
    this.dduId = dduId
    this.materialName = materialName
    this.supplierName = supplierName
    this.contactNo = contactNo
    this.location = location
    this.moq = moq
    this.pricePerUnit = pricePerUnit
    this.totalQtyRequiredMonthly = totalQtyRequiredMonthly
    this.howOftenRequired = howOftenRequired
    this.whoDelivers = whoDelivers
    this.storedWhere = storedWhere
  }

  get monthlyCost() {
    return this.pricePerUnit * this.totalQtyRequiredMonthly
  }

  static fromJSON(json) {
    return new Stage3SupplierLine(json)
  }
}
