import { PRODUCT_CATEGORY } from './constants.js'

export class Product {
  constructor({ id, name, category = PRODUCT_CATEGORY.OTHER, unit = 'pcs', icon = '📦' }) {
    this.id = id
    this.name = name
    this.category = category
    this.unit = unit
    this.icon = icon
  }

  static fromJSON(json) {
    return new Product(json)
  }
}
