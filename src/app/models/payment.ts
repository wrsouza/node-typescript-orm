import Model from '../../infra/database/base/model';

class Payment extends Model {
  constructor() {
    super()
    this.table = "payments"
    this.fillable = [
      "group_id",
      "code", 
      "name",
      "min",
      "default",
      "active"
    ]
    this.hidden = [
      "created_at",
      "updated_at"
    ]
  }
}

export default new Payment; 