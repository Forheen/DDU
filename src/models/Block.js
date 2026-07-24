export class Block {
  constructor({ id, name, districtId = null }) {
    this.id = id
    this.name = name
    this.districtId = districtId
  }

  static fromJSON(json) {
    return new Block(json)
  }
}
