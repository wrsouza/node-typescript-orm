import Model from '../../infra/database/base/model';

class Product extends Model {
  constructor() {
    super()
    this.table = "products"
    this.fillable = [
      "category_id",
      "code", 
      "barcode",
      "name",
      "tag",
      "discount_limit",
      "status",
    ]
    this.hidden = [
      "created_at",
      "updated_at"
    ]
  }
}

export default new Product; 