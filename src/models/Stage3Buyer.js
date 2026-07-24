// One row = one buyer, in the Stage 3 Demand ledger.
export class Stage3Buyer {
  constructor({
    id,
    dduId,
    buyerType = 'Retail shop', // Retail shop | Institution | Household | Other
    name = '',
    contactNo = '',
    location = '',
    moq = 0,
    qtyPerMonth = 0,
    pricePerUnit = 0,
    howOften = 'monthly', // weekly | fortnightly | monthly
    whoDelivers = 'Vaibhavi', // Vaibhavi | Dhawak | Buyer picks up | Vasuki
    poAttachmentName = '', // photographed Purchase Order filename, optional
  }) {
    this.id = id
    this.dduId = dduId
    this.buyerType = buyerType
    this.name = name
    this.contactNo = contactNo
    this.location = location
    this.moq = moq
    this.qtyPerMonth = qtyPerMonth
    this.pricePerUnit = pricePerUnit
    this.howOften = howOften
    this.whoDelivers = whoDelivers
    this.poAttachmentName = poAttachmentName
  }

  get monthlyValue() {
    return this.qtyPerMonth * this.pricePerUnit
  }

  static fromJSON(json) {
    return new Stage3Buyer(json)
  }
}
