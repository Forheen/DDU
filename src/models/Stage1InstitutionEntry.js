import { SCOPE } from './constants.js'

// One row = one product finding at one institution (hospital/school/dhaba/gym).
export class Stage1InstitutionEntry {
  constructor({
    id,
    scope = SCOPE.VATIKA,
    vatikaId = null,
    blockId = null,
    productId = null,
    productName = '',
    institutionName = '',
    institutionType = 'Hospital', // Hospital | School | Dhaba | Gym | Other
    contactName = '',
    contactNumber = '',
    location = '',
    brand = 'local',
    unit = '',
    volumeMin = 0,
    volumeMax = 0,
    buyingPrice = 0,
    buyingFrequency = 'monthly',
    vendorSupplier = '',
    remarks = '',
    sakhyaOpportunity = false, // Block-scope only
    filledBy = null,
    date = null,
  }) {
    this.id = id
    this.scope = scope
    this.vatikaId = vatikaId
    this.blockId = blockId
    this.productId = productId
    this.productName = productName
    this.institutionName = institutionName
    this.institutionType = institutionType
    this.contactName = contactName
    this.contactNumber = contactNumber
    this.location = location
    this.brand = brand
    this.unit = unit
    this.volumeMin = volumeMin
    this.volumeMax = volumeMax
    this.buyingPrice = buyingPrice
    this.buyingFrequency = buyingFrequency
    this.vendorSupplier = vendorSupplier
    this.remarks = remarks
    this.sakhyaOpportunity = sakhyaOpportunity
    this.filledBy = filledBy
    this.date = date
  }

  static fromJSON(json) {
    return new Stage1InstitutionEntry(json)
  }
}
