import Model from '../../infra/database/base/model';

class Category extends Model {
  constructor() {
    super()
    this.table = "categories"
    this.fillable = [
      "group_id",
      "category_id",
      "code", 
      "name",
    ]
    this.hidden = [
      "created_at",
      "updated_at"
    ]
  }
}

export default new Category; 