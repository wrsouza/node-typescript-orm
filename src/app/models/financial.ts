import Model from '../../infra/database/base/model';

class Financial extends Model {
  constructor() {
    super()
    this.table = "financials"
    this.fillable = [
      "group_id",
      "code", 
      "company_id",
      "customer_id",
      "description",
      "payment_id",
      "installment",
      "total",
      "pending",
      "status",
      "generated_at",
      "expired_at"
    ]
    this.hidden = [
      "created_at",
      "updated_at"
    ]
  }
}

export default new Financial; 