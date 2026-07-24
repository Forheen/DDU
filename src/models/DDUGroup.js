// A DDUGroup is the record of *which Vatikas produce which product together*.
// The common case is one Vatika, one product (created implicitly the first
// time anyone touches Stage 2/Cost Economics/Stage 3 for that pair). A merged
// Block DDU is the same entity with more than one vatikaId — several
// villages pooling their Vaibhavis into one shared business unit for a
// product no single village could support alone.
export class DDUGroup {
  constructor({ id, productId, vatikaIds, blockId = null, name = '' }) {
    this.id = id
    this.productId = productId
    this.vatikaIds = vatikaIds
    this.blockId = blockId
    this.name = name
  }

  get isMerged() {
    return this.vatikaIds.length > 1
  }

  static fromJSON(json) {
    return new DDUGroup(json)
  }
}

export function singleVatikaGroupId(vatikaId, productId) {
  return `${vatikaId}_${productId}`
}
