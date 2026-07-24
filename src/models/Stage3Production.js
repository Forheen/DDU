// One row per contributing Vatika — a merged DDU has one of these per village
// pooling Vaibhavis into it; a single-Vatika DDU just has one row.
export class Stage3Production {
  constructor({ id, dduId, vatikaId, womenCount = 0, unitsPerWomanPerDay = 0, workingDaysPerMonth = 0 }) {
    this.id = id
    this.dduId = dduId
    this.vatikaId = vatikaId
    this.womenCount = womenCount
    this.unitsPerWomanPerDay = unitsPerWomanPerDay
    this.workingDaysPerMonth = workingDaysPerMonth
  }

  get monthlyCapacity() {
    return this.womenCount * this.unitsPerWomanPerDay * this.workingDaysPerMonth
  }

  static fromJSON(json) {
    return new Stage3Production(json)
  }
}
