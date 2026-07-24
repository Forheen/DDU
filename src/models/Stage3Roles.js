// One row per contributing Vatika — each village keeps its own Vasuki and
// Mitra even inside a merged DDU. Delivery (Dhawak/Vaibhavi/buyer pickup) is
// also set per Vatika since each village's route can differ.
export class Stage3Roles {
  constructor({
    id,
    dduId,
    vatikaId,
    deliveryBy = 'Vaibhavi', // Vaibhavi | Dhawak | Buyer picks up
    deliveryMarginPct = 0,
    vasukiId = null,
    vasukiMarginPct = 0,
    mitraId = null, // no margin — village activator, not a margin-taking intermediary
  }) {
    this.id = id
    this.dduId = dduId
    this.vatikaId = vatikaId
    this.deliveryBy = deliveryBy
    this.deliveryMarginPct = deliveryMarginPct
    this.vasukiId = vasukiId
    this.vasukiMarginPct = vasukiMarginPct
    this.mitraId = mitraId
  }

  static fromJSON(json) {
    return new Stage3Roles(json)
  }
}
