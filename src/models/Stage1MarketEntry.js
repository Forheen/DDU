import { SCOPE } from './constants.js'

// One row = one product observed in one shop (Stage 1 – RRPs / market survey).
// scope 'vatika' -> vatikaId set. scope 'block' -> blockId set, vatikaId optional (village of origin).
export class Stage1MarketEntry {
  constructor({
    id,
    scope = SCOPE.VATIKA,
    vatikaId = null,
    blockId = null,
    productId = null,
    productName = '',
    shopName = '',
    shopContact = '',
    shopLocation = '',
    brand = 'local', // 'local' | 'branded'
    unit = '',
    mrp = 0,
    buyingFrequency = 'monthly',
    volumeEstimate = '', // e.g. "30-100/week"
    shopsSelling = '1', // '1' | '2-3' | '4-6' | '7+'
    seasonal = false,
    remarks = '',
    filledBy = null,
    date = null,
  }) {
    this.id = id
    this.scope = scope
    this.vatikaId = vatikaId
    this.blockId = blockId
    this.productId = productId
    this.productName = productName
    this.shopName = shopName
    this.shopContact = shopContact
    this.shopLocation = shopLocation
    this.brand = brand
    this.unit = unit
    this.mrp = mrp
    this.buyingFrequency = buyingFrequency
    this.volumeEstimate = volumeEstimate
    this.shopsSelling = shopsSelling
    this.seasonal = seasonal
    this.remarks = remarks
    this.filledBy = filledBy
    this.date = date
  }

  static fromJSON(json) {
    return new Stage1MarketEntry(json)
  }
}
