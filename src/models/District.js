export class District {
  constructor({ id, name }) {
    this.id = id
    this.name = name
  }

  static fromJSON(json) {
    return new District(json)
  }
}
