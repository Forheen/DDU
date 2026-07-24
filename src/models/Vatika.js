export class Vatika {
  constructor({ id, name, blockId, region = '' }) {
    this.id = id
    this.name = name
    this.blockId = blockId
    this.region = region
  }

  static fromJSON(json) {
    return new Vatika(json)
  }
}
