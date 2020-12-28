import Model from '../../infra/database/base/model';

class Price extends Model {
  constructor() {
    super()
    this.table = "prices"
    this.fillable = [
      "group_id",
      "code", 
      "name",
    ]
    this.hidden = [
      "created_at",
      "updated_at"
    ]
  }
}

export default new Price;